"""The page shows what the program printed, and asks for nothing that is not there."""

import json
import re
import unittest
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]


def data() -> dict:
    text = (SITE / "data.js").read_text(encoding="utf-8")
    return json.loads(text[text.index("{"): text.rindex("}") + 1])


class Page(unittest.TestCase):
    def test_the_page_only_asks_for_files_that_exist(self):
        for page in ("index.html", "404.html"):
            html = (SITE / page).read_text(encoding="utf-8")
            for ref in re.findall(r'(?:src|href)="(?!https?:|#|data:|/\s*"|mailto:)([^"]+)"', html):
                with self.subTest(page=page, ref=ref):
                    self.assertTrue((SITE / ref.lstrip("/")).is_file(), ref)

    def test_the_data_holds_what_the_page_reads(self):
        d = data()
        for key in ("version", "tests", "demo", "out", "tasks", "films", "tape", "toy", "say"):
            self.assertIn(key, d)
        self.assertEqual(d["out"]["report"][-1], "all of it computed from your history, none of it written here")
        self.assertEqual(len(d["films"]), 3)
        self.assertEqual(d["toy"]["broken"], [3])  # editing line 2 breaks the link from line 3, and only that one

    def test_the_page_speaks_english_only(self):
        for path in sorted(SITE.glob("*.*")):
            if path.suffix in {".html", ".css", ".js", ".py", ".md"}:
                with self.subTest(file=path.name):
                    self.assertIsNone(re.search("[Ѐ-ӿ]", path.read_text(encoding="utf-8")))

    def test_every_github_link_points_at_the_program(self):
        self.assertIn('repoUrl: "https://github.com/Artemoon13/fibo"', (SITE / "config.js").read_text(encoding="utf-8"))
        self.assertNotIn("location.hostname.split", (SITE / "app.js").read_text(encoding="utf-8"))

    def test_the_page_says_what_it_is(self):
        html = (SITE / "index.html").read_text(encoding="utf-8")
        self.assertIn("not financial advice", html)
        self.assertIn("nothing is deployed yet", html)


if __name__ == "__main__":
    unittest.main()
