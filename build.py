"""Builds data.js from the real program, run on its demo repository.

Every line of terminal output on the page comes from `fibo` itself; the
page does not write any of it. The program lives in its own repository, so
point this at a checkout of it and commit the data.js it writes:

    python build.py --project ../fibo
"""

from __future__ import annotations

import argparse
import contextlib
import io
import json
import shutil
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent


def locate(given: str | None) -> Path:
    """The fibo checkout: --project, or a folder named fibo next to this one."""
    for candidate in [Path(given)] if given else [HERE.parent / "fibo"]:
        if (candidate / "src" / "fibo" / "__init__.py").is_file():
            return candidate.resolve()
    raise SystemExit("fibo not found: pass --project PATH, the folder that holds src/fibo")


_options = argparse.ArgumentParser(description="Build data.js from the real program.")
_options.add_argument("--project", help="a checkout of github.com/0xkuch/Fibo")
ROOT = locate(_options.parse_args().project)
sys.path.insert(0, str(ROOT / "src"))

from fibo import __version__, config, demo, git, render  # noqa: E402
from fibo.__main__ import main  # noqa: E402
from fibo.analysis import analyze  # noqa: E402
from fibo.i18n import STRINGS, Lang, by, times  # noqa: E402
from fibo.pair import Keys, collect  # noqa: E402
from fibo.sources import ledger  # noqa: E402

SHOWN = "/tmp/fibo-demo"  # where `fibo demo` puts it on Linux; the page shows that path
EN = Lang("en")


class Program:
    """Runs the real entry point and keeps what it printed, with the temporary path shown as SHOWN."""

    def __init__(self, path: Path):
        self.path = path
        self.shown = [str(path), render.pretty_path(path)]

    def clean(self, text: str) -> list[str]:
        for real in self.shown:
            text = text.replace(real, SHOWN)
        lines = [l.rstrip() for l in text.splitlines()]
        while lines and not lines[-1]:
            lines.pop()
        return lines

    def __call__(self, *argv: str) -> list[str]:
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            main(["--no-color", "--lang", "en", "-C", str(self.path), *argv])
        return self.clean(out.getvalue() + err.getvalue())


def films(run: Program, free: int, example: str) -> list[dict]:
    def film(title: str, sub: str, cmd: str, *steps: tuple[str, list[str]]) -> dict:
        lines, t = [], 0
        for command, output in steps:
            lines.append([t, f"$ {command}"])
            t += 3
            for line in output:
                lines.append([t, line])
                t += 2
            t += 5
        return {"title": title, "sub": sub, "cmd": cmd, "dur": t + 8, "lines": lines}

    key, other = f"PROJ-{free}", f"PROJ-{free + 1}"
    said = run("say", key, "2d")
    again = run("say", key, "3d")
    vague = run("say", other, "soon")
    task = run(example)
    body = [l for l in task[4:] if l.strip()][:11]
    doctor = [l for l in run("doctor")[4:] if l.strip()][:11]
    return [
        film("say", "writing a promise down", "fibo say",
             (f"fibo say {key} 2d", said), (f"fibo say {key} 3d", again),
             (f"fibo say {other} soon", vague)),
        film("one task", "taken apart", f"fibo {example}", (f"fibo {example}", body)),
        film("doctor", "through the monocle", "fibo doctor", ("fibo doctor", doctor)),
    ]


def toy_ledger() -> dict:
    """The four-line ledger on the page, written and checked by the real ledger code."""
    root = Path(tempfile.mkdtemp(prefix="fibo-toy-"))
    try:
        for key, said, at in (("PROJ-388", "1d", "2026-05-02 09:14"), ("PROJ-401", "4h", "2026-05-06 10:02"),
                              ("PROJ-412", "2d", "2026-05-11 08:51"), ("PROJ-419", "1w", "2026-05-13 17:40")):
            ledger.append(root, key, said, demo.ME[1], datetime.fromisoformat(f"{at}+03:00"))
        path = root / ledger.PATH
        honest = path.read_text(encoding="utf-8").splitlines()
        rows = [{"key": e["key"], "said": e["said"], "at": e["at"][:16].replace("T", " "),
                 "hash": ledger._digest(line)[:6]} for e, line in zip(ledger.read(root)[0], honest)]
        clean = EN.t("doc_ok", what=EN.t("doc_chain"))
        tampered = list(honest)
        tampered[1] = tampered[1].replace('"said": "4h"', '"said": "2d"')
        path.write_text("\n".join(tampered) + "\n", encoding="utf-8")
        problems = ledger.read(root)[1]
        broken = [n for n, _ in problems]
        edited = {"hash": ledger._digest(tampered[1])[:6], "said": "2d"}
        report = f"✗ {EN.t('doc_chain')}: {len(problems)} · " + " · ".join(
            EN.t("doc_chain_row", n=n, problem=p) for n, p in problems)
        return {"rows": rows, "edited": edited, "broken": broken, "clean": clean, "report": report}
    finally:
        demo._remove(root)


def build() -> dict:
    work = Path(tempfile.mkdtemp(prefix="fibo-site-"))
    try:
        path = work / "fibo-demo"
        demo.build(path)
        run = Program(path)
        cfg = config.load(path, git.user_email(path))
        a = analyze(path, cfg)
        s = a.summary
        day, week = render.sizes(a)

        outs = {
            "report": run(), "calendar": run("--calendar"), "verbose": run("-v"),
            "drift": run("drift"), "doctor": run("doctor"), "whose": run("--whose", "someone@else.com"),
        }
        other = Program(work / "second")
        outs["demo"] = other.clean(_capture_demo(work / "second"))
        style = render.Style(False)
        tasks = {o.key: run.clean(render.detail(a, o, EN, style)) for o in a.outcomes}

        everything = collect(git.open_repo(path), Keys(), git.remotes(path) or ["origin"])
        landed = sorted(k for k, us in everything.items() if any(u.landed for u in us))
        started = {}
        for k, us in everything.items():
            commits = sorted((c for u in us for c in u.commits), key=lambda c: c.at)
            if commits and k not in landed:
                started[k] = [commits[0].short, f"{commits[0].at:%Y-%m-%d %H:%M}"]
        numbers = [int(k.split("-")[1]) for k in list(everything) + list(ledger.estimates(path))
                   if k.startswith("PROJ-") and k.split("-")[1].isdigit()]
        example = max((o for o in a.counted if o.kind == "migration"), key=lambda o: o.ratio()).key
        film = films(run, max(numbers) + 20, example)
        said = {k: [v[0].text, f"{v[0].at:%Y-%m-%d}"] for k, v in ledger.estimates(path).items()}

        counted = sorted(a.counted, key=lambda o: o.end)
        pick = counted[:: max(1, len(counted) // 12)][:12]
        tape = [[EN.said(o.estimate.parts, o.estimate.text), EN.amount(o.span_h, o.estimate.unit, day, week),
                 round(o.ratio(), 1)] for o in pick]
        groups = [{"said": EN.said(g.estimate.parts, g.estimate.text),
                   "took": EN.amount(g.estimate.work_hours(day, week / day) * g.multiplier, g.estimate.unit, day, week),
                   "m": by(g.multiplier)} for g in a.groups]
        now = datetime.now(timezone.utc)
        excluded = a.excluded
        n_ex = sum(excluded.values())
        return {
            "version": __version__,
            "generated": now.isoformat(timespec="seconds"),
            "tests": unittest.defaultTestLoader.discover(str(ROOT / "tests"), top_level_dir=str(ROOT)).countTestCases(),
            "demo": {
                "path": SHOWN, "email": a.me[0], "tasks": len(a.outcomes), "closed": len(a.closed),
                "estimated": len(a.estimated), "counted": len(a.counted), "groups": groups,
                "multiplier": round(s.multiplier, 1), "calendar": times(a.other.multiplier), "p90": by(s.p90),
                "under": round(s.under * 100),
                "kinds": [[EN.kind(k), by(m), n] for k, m, n in a.kinds],
                "drift": {"spark": render.sparkline([m for _, m, _ in a.drift]), "first": times(a.drift[0][1]),
                          "last": times(a.drift[-1][1]), "values": [round(m, 2) for _, m, _ in a.drift]},
                "excluded": EN.t("excluded", n=n_ex, tasks=EN.word(n_ex, "task"),
                                 reasons=" · ".join(f"{EN.reason(r)}: {k}" for r, k in excluded.most_common())),
                "ledger": len(said),
            },
            "out": outs, "tasks": tasks, "films": film, "tape": tape, "toy": toy_ledger(),
            "say": {
                "email": a.me[0], "head": ledger.head(path), "ledger": said, "landed": landed, "started": started,
                "refuse": render.REFUSE,
                "strings": {k: STRINGS["en"][k] for k in ("say_ok", "say_hash", "no_duration", "no_points",
                                                          "no_after_start", "no_again", "no_closed", "no_whose",
                                                          "no_verb", "not_found")},
            },
        }
    finally:
        demo._remove(work)


def _capture_demo(target: Path) -> str:
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        main(["--no-color", "--lang", "en", "demo", str(target)])
    return out.getvalue()


if __name__ == "__main__":
    data = build()
    target = Path(__file__).with_name("data.js")
    target.write_text("// Generated by site/build.py from the real program. Do not edit by hand.\n"
                      f"window.FIBO = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};\n",
                      encoding="utf-8")
    print(f"{target} · {target.stat().st_size // 1024} KiB · {len(data['tasks'])} tasks · {data['tests']} tests")
