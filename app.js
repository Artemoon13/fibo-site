// fibo — the landing page, without a framework.
// data.js is made by site/build.py from the real program; config.js is the one file meant for hands.
(() => {
  'use strict';
  const D = window.FIBO, CFG = window.FIBO_CONFIG || {}, TK = CFG.token || {};
  if (!D || !window.Sprites) return;
  const O = D.out, SAY = D.say, S = SAY.strings, demo = D.demo;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const face = (cv, name) => window.Sprites.paint(cv, name);
  const pad = (n) => String(n).padStart(2, '0');
  const copy = (text) => { try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* the owl saw anyway */ } };
  const done = (btn, ms = 1600) => {
    const idle = $('.idle', btn), ok = $('.ok', btn);
    if (idle) idle.hidden = true;
    if (ok) ok.hidden = false;
    clearTimeout(btn.doneTimer);
    btn.doneTimer = setTimeout(() => { if (idle) idle.hidden = false; if (ok) ok.hidden = true; }, ms);
  };

  window.Sprites.paintAll();
  window.Sprites.favicon();

  // ── where the code lives: the program's own repository, named in config.js ──
  const repoUrl = CFG.repoUrl || 'https://github.com/0xkuch/Fibo';
  const install = `pipx install git+${repoUrl}`;
  $$('[data-repo]').forEach((a) => { a.href = repoUrl; });
  $$('[data-repo-text]').forEach((e) => { e.textContent = repoUrl; });
  const facts = { path: demo.path, tasks: demo.tasks, counted: demo.counted, ledger: demo.ledger, tests: D.tests, p90: demo.p90, version: D.version };
  $$('[data-d]').forEach((e) => { if (e.dataset.d in facts) e.textContent = facts[e.dataset.d]; });

  // ── copying: the nav owl blinks once, one frame, 380 ms. that is the whole animation ──
  const navOwl = $('#navOwl');
  const blinkNav = () => { face(navOwl, 'owl:blink'); setTimeout(() => face(navOwl, 'owl:auditor'), 380); };
  $$('[data-copy="install"]').forEach((b) => b.addEventListener('click', () => { copy(install); blinkNav(); done(b); }));

  // ── the hero owl: a stepped clock, and pupils that snap toward the cursor ──
  const heroOwl = $('#heroOwl'), elapsedEl = $('#elapsed');
  const SEQ = ['report', 'report', 'report', 'lookl', 'lookl', 'report', 'report', 'lookr', 'lookr', 'report', 'report', 'report',
    'blink', 'report', 'report', 'report', 'auditor', 'auditor', 'report'];
  const t0 = performance.now();
  let fi = 0, gaze = null, gazeTimer = 0, away = false;
  setInterval(() => {
    if (!reduced) fi = (fi + 1) % SEQ.length;
    if (!gaze) face(heroOwl, `big:${away ? 'auditor' : SEQ[fi]}`);
    const s = (performance.now() - t0) / 1000;
    if (elapsedEl) {
      const took = s < 60 ? `${s.toFixed(0)} s` : `${Math.floor(s / 60)} min ${Math.floor(s % 60)} s`;
      elapsedEl.textContent = took + (s > 30 ? ` · ×${(s / 30).toFixed(1)}` : '');
    }
  }, 420);
  window.addEventListener('mousemove', (e) => {
    if (!heroOwl) return;
    away = false;
    const r = heroOwl.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.32);
    const g = Math.abs(dx) < r.width * 0.12 && Math.abs(dy) < r.height * 0.12 ? 'g0,0'
      : `g${Math.max(-2, Math.min(2, Math.round(dx / 160)))},${Math.max(-1, Math.min(1, Math.round(dy / 220)))}`;
    if (g !== gaze) { gaze = g; face(heroOwl, `big:${g}`); }
    clearTimeout(gazeTimer);
    gazeTimer = setTimeout(() => { gaze = null; }, 2600);
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { away = true; gaze = null; face(heroOwl, 'big:auditor'); });

  // ── the hero terminal: said 1.0 s, took 3.8 s, then the report ──
  const report = $('#report'), loader = $('#loader');
  const groups = demo.groups.map((g, i) => `<span class="ink">said "${esc(g.said)}"</span><span class="lime">took ${esc(g.took)}</span>`
    + `<b style="text-align:right"${i === 0 ? ' class="amber"' : ''}>${esc(g.m)}</b>`).join('');
  const kinds = demo.kinds.map((k, i) => `<span>${esc(k[0])}</span><b class="${i === demo.kinds.length - 1 ? 'amber' : 'ink'}">${esc(k[1])}</b>`
    + `<span class="dim2">n=${k[2]}</span>`).join('');
  const spark = demo.drift.spark;
  report.innerHTML = `<div class="rep-head"><canvas class="px" data-sprite="owl:report" data-scale="2" style="flex:none;margin-top:4px"></canvas>`
    + `<div class="col"><span><span class="lime">(o,o)</span>  fibo · ${esc(demo.path)}</span><span class="mut">${demo.tasks} tasks · ${demo.closed} closed · `
    + `${demo.estimated} estimated · <span class="lime">${demo.counted} counted</span></span></div></div>`
    + `<div class="g3 sep">${groups}</div>`
    + `<div class="rep-mult sep"><span class="label">your multiplier</span><span style="display:flex;align-items:baseline;gap:12px">`
    + `<b class="big-mult">${demo.multiplier.toFixed(1)}<span class="x">×</span></b><span class="dim" style="font-size:11px">calendar ${esc(demo.calendar)}</span></span></div>`
    + `<div class="g2 mut"><span>worst case (p90)</span><b class="amber">${esc(demo.p90)}</b><span>underestimated</span><b class="ink">${demo.under}% of tasks</b></div>`
    + `<div class="label sep">by kind of work</div><div class="g3 mut">${kinds}</div>`
    + `<div class="drift-line"><span>drift</span><span>${esc(demo.drift.first)} <span class="spark">${esc(spark.slice(0, -1))}<span class="amber">${esc(spark.slice(-1))}</span></span> ${esc(demo.drift.last)}</span></div>`
    + `<div class="foot-lines">${esc(demo.excluded)}<br>one subject: you — ${esc(demo.email)}<br><span class="mut">all of it computed from your history, none of it written here</span></div>`
    + '<div style="margin-top:10px"><span class="mut">$ </span><span class="cursor"></span></div>';
  window.Sprites.paintAll(report);
  const saidBar = $('#saidBar'), tookBar = $('#tookBar'), loadLabel = $('#loadLabel'), late = $('#late');
  const l0 = performance.now();
  (function load() {
    const t = (performance.now() - l0) / 1000;
    saidBar.style.width = `${(Math.min(1, t) * 26).toFixed(1)}%`;
    tookBar.style.width = `${(Math.min(1, t / 3.8) * 100).toFixed(1)}%`;
    loadLabel.textContent = `${t.toFixed(1)} s`;
    late.hidden = t <= 1;
    late.textContent = `late ×${Math.min(3.8, t).toFixed(1)}`;
    if (t >= 3.8) { loader.hidden = true; report.hidden = false; return; }
    setTimeout(load, reduced ? 400 : 60);
  })();

  // ── the ticker: real tasks from the demo ──
  const tapeItem = ([s, t, m]) => `<span class="tape-item"><span class="ink">said "${esc(s)}"</span><span class="dim2">→</span>`
    + `<span class="lime">took ${esc(t)}</span><span style="color:${m >= 4 ? 'var(--amber)' : m <= 1 ? 'var(--dim2)' : 'var(--ink)'}">×${m.toFixed(1)}</span><span class="sq">▪</span></span>`;
  $('#tape').innerHTML = [...D.tape, ...D.tape].map(tapeItem).join('');

  // ── SHA-256, so the ledger in the browser chains exactly like the one on disk ──
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70,
    0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  function sha256(text) {
    const bytes = new TextEncoder().encode(text), len = bytes.length;
    const buf = new Uint8Array(((len + 9 + 63) >> 6) << 6);
    buf.set(bytes);
    buf[len] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(buf.length - 8, Math.floor(len / 0x20000000));
    view.setUint32(buf.length - 4, (len * 8) >>> 0);
    const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], w = new Uint32Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const a = w[t - 15], b = w[t - 2];
        w[t] = (w[t - 16] + (ror(a, 7) ^ ror(a, 18) ^ (a >>> 3)) + w[t - 7] + (ror(b, 17) ^ ror(b, 19) ^ (b >>> 10))) >>> 0;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let t = 0; t < 64; t++) {
        const t1 = (hh + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) >>> 0;
        const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, hh].forEach((v, j) => { h[j] = (h[j] + v) >>> 0; });
    }
    return h.map((v) => v.toString(16).padStart(8, '0')).join('');
  }
  window.fiboSha256 = sha256; // for anyone who wants to check the chain by hand

  // ── the program, in the browser. every line below was printed by the real one ──
  const out = $('#out'), input = $('#cmd'), termOwl = $('#termOwl'), ledgerN = $('#ledgerN');
  const book = Object.assign({}, SAY.ledger), mine = {};
  let head = SAY.head || '0'.repeat(64), faceTimer = 0;
  const history = [];
  let hi = -1;
  const NOT_HERE = new Set(['export', 'team', 'predict', 'forecast', 'all', 'everyone', 'aggregate']);
  const refuse = (msg) => `${SAY.refuse}  ${msg}`;
  const HELP = [
    'fibo                    the report: one number, from your history',
    'fibo demo               two years of made-up history, same on every machine',
    'fibo KEY                one task, taken apart',
    'fibo say KEY 2d         write a promise down before you start (h · d · w)',
    'fibo doctor             check that nobody nudged anything',
    'fibo drift              quarter by quarter',
    'fibo --calendar · -v    calendar time · the detailed view',
    'fibo --whose EMAIL      one subject: it has to be one of yours',
    'man fibo                the man page  (or press ?)',
    'clear', '', 'it has one subject. yours.'];

  function tone(line) {
    const t = line.trim();
    if (/^\$ /.test(line)) return 'ink b';
    if (/^\(ò,ó\)|^✗|^usage:|^fibo: error|not found in your tasks|command not found/.test(t)) return 'red';
    if (/^\(o,O\)/.test(t)) return 'amber b';
    if (/^\((o,o|-,-)\)/.test(t)) return 'lime b';
    if (t === '/)_)' || t === '""') return 'lime';
    if (/^(your multiplier|said: |took )/.test(t)) return 'lime b';
    if (/^worst case/.test(t)) return 'amber';
    if (/^all of it computed/.test(t)) return 'ink b';
    if (/^status\s+counted$/.test(t) || /^✓/.test(t)) return 'lime';
    if (/^(excluded|one subject|by kind of work|!|\.fibo\/ledger)/.test(t)) return 'mut';
    if (/(ago|now)$/.test(t) && !/[×:]/.test(t)) return 'dim';
    if (/^(·|demo repository|a demo is a demo|next:|it has one subject)/.test(t) || /· this tab/.test(t)) return 'dim';
    return 'ink';
  }
  function print(lines) {
    const frag = document.createDocumentFragment();
    lines.forEach((l) => { const div = document.createElement('div'); div.className = tone(l); div.textContent = l; frag.appendChild(div); });
    out.appendChild(frag);
    while (out.childElementCount > 400) out.firstElementChild.remove();
    out.scrollTop = out.scrollHeight;
    requestAnimationFrame(() => { out.scrollTop = out.scrollHeight; });
  }

  const PART = /(\d+(?:[.,]\d+)?)\s*(minutes|minute|mins|min|m|hours|hour|hrs|hr|h|days|day|d|weeks|week|wks|wk|w)(?![a-z])/gi;
  const POINTS = /^(\d+(?:[.,]\d+)?)\s*(?:story\s*points?|points?|pts?|sp)$/i;
  function kindOf(text) { // the same reading as model.parse_estimate
    const body = text.trim().split(/\s+/).join(' ').replace(/^[~≈]+/, '').trim();
    const pts = POINTS.exec(body);
    if (pts) return parseFloat(pts[1].replace(',', '.')) > 0 ? 'points' : 'none';
    const parts = [...body.matchAll(PART)];
    const rest = body.replace(PART, ' ').replace(/[+,]/g, ' ').trim();
    const total = parts.reduce((s, m) => s + parseFloat(m[1].replace(',', '.')), 0);
    return parts.length && !rest && total > 0 ? 'duration' : 'none';
  }
  function say(rawKey, rawSaid) {
    if (!rawKey || !rawSaid) return { lines: ['usage: fibo say KEY DURATION   (e.g. fibo say PROJ-412 2d)'], face: 'refuse' };
    const key = rawKey.toUpperCase(), said = rawSaid.trim().split(/\s+/).join(' '), kind = kindOf(said);
    const no = (msg) => ({ lines: [refuse(msg)], face: 'refuse' });
    if (kind === 'points') return no(S.no_points);
    if (kind !== 'duration') return no(fill(S.no_duration, { said: rawSaid }));
    if (book[key]) return no(fill(S.no_again, { key, said: book[key][0], at: book[key][1] }));
    if (SAY.landed.includes(key)) return no(fill(S.no_closed, { key }));
    if (SAY.started[key]) return no(fill(S.no_after_start, { sha: SAY.started[key][0], at: SAY.started[key][1] }));
    const d = new Date(), off = -d.getTimezoneOffset();
    const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const at = `${day}T${clock}:${pad(d.getSeconds())}${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
    const line = `{"at": ${JSON.stringify(at)}, "email": ${JSON.stringify(SAY.email)}, "key": ${JSON.stringify(key)}, "prev": "${head}", "said": ${JSON.stringify(said)}}`;
    const prev = head;
    head = sha256(line);
    book[key] = [said, day];
    mine[key] = said;
    ledgerN.textContent = Object.keys(book).length;
    return { lines: [fill(S.say_ok, { key, said, at: `${day} ${clock}` }), fill(S.say_hash, { new: head.slice(0, 6), prev: prev.slice(0, 6) })], face: 'report' };
  }

  function answer(cmd) {
    const a = cmd.split(/\s+/);
    if (cmd === 'help' || /^fibo (-h|--help|help)$/.test(cmd)) return { lines: HELP };
    if (cmd === 'man' || cmd === 'man fibo') { openMan(); return { lines: ['opening FIBO(1) …'] }; }
    if (a[0] !== 'fibo') return { lines: [`${a[0]}: command not found · try help`], face: 'refuse' };
    let lang = 'en', whose = null, calendar = false, verbose = false;
    const rest = [];
    for (let i = 1; i < a.length; i++) {
      const x = a[i];
      if (x === '--lang') lang = a[++i] || 'en';
      else if (x.startsWith('--lang=')) lang = x.slice(7);
      else if (x === '--whose') whose = a[++i] || '';
      else if (x.startsWith('--whose=')) whose = x.slice(8);
      else if (x === '--calendar') calendar = true;
      else if (x === '-v' || x === '--verbose') verbose = true;
      else if (x === '-C') i++;
      else if (['--no-color', '--color', '--offline', '--refresh'].includes(x)) { /* nothing to change here */ }
      else if (x.startsWith('-') && rest[0] !== 'say') return { lines: ['usage: fibo [options] [command]', `fibo: error: unrecognized arguments: ${x}`], face: 'refuse' };
      else rest.push(x);
    }
    const sub = rest[0];
    if (whose !== null && whose.trim().toLowerCase() !== SAY.email) {
      return { lines: [refuse(fill(S.no_whose, { email: whose, emails: SAY.email }))], face: 'refuse' };
    }
    if (lang !== 'en') return { lines: ['fibo: this copy in the browser carries the english output only'], face: 'refuse' };
    if (!sub) return { lines: calendar ? O.calendar : verbose ? O.verbose : O.report };
    if (sub === 'demo') return { lines: O.demo };
    if (sub === 'drift') return { lines: O.drift };
    if (sub === 'doctor') return { lines: O.doctor, face: 'doctor' };
    if (sub === 'say') return say(rest[1], rest.slice(2).join(' '));
    const key = Object.keys(D.tasks).find((k) => k.toLowerCase() === sub.toLowerCase());
    if (key) return { lines: D.tasks[key] };
    if (mine[sub.toUpperCase()]) return { lines: [`${sub.toUpperCase()}: said ${mine[sub.toUpperCase()]} in this tab · the real ledger lives in .fibo/, this one forgets on reload`] };
    if (NOT_HERE.has(sub.toLowerCase())) return { lines: [refuse(fill(S.no_verb, { verb: sub }))], face: 'refuse' };
    return { lines: [fill(S.not_found, { key: sub })], face: 'refuse' };
  }

  function run(raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return;
    history.unshift(cmd);
    history.length = Math.min(history.length, 50);
    hi = -1;
    if (cmd === 'clear') { out.textContent = ''; return; }
    const res = answer(cmd);
    print([`$ ${cmd}`, ...res.lines, '']);
    face(termOwl, `owl:${res.face || 'report'}`);
    clearTimeout(faceTimer);
    faceTimer = setTimeout(() => face(termOwl, 'owl:auditor'), 2400);
  }
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hi = Math.min(history.length - 1, hi + 1); input.value = history[hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.max(-1, hi - 1); input.value = hi < 0 ? '' : history[hi]; }
  });
  out.addEventListener('click', () => input.focus());

  const numbers = [...SAY.landed, ...Object.keys(SAY.started), ...Object.keys(book), ...Object.keys(D.tasks)]
    .map((k) => /^PROJ-(\d+)$/.exec(k)).filter(Boolean).map((m) => +m[1]);
  const free = `PROJ-${Math.max(...numbers) + 31}`;
  const begun = Object.keys(SAY.started)[0] || SAY.landed[SAY.landed.length - 1];
  const example = D.films[1] ? D.films[1].cmd : 'fibo';
  const QUICK = [['fibo', 'fibo'], ['demo', 'fibo demo'], ['one task', example], ['say 2d', `fibo say ${free} 2d`],
    ['say soon ✗', `fibo say ${free} soon`], ['after start ✗', `fibo say ${begun} 2d`],
    ['someone else ✗', 'fibo --whose someone@else.com'], ['doctor', 'fibo doctor'], ['drift', 'fibo drift'],
    ['calendar', 'fibo --calendar'], ['help', 'help'], ['clear', 'clear']];
  const quick = $('#quick');
  QUICK.forEach(([label, cmd]) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => { run(cmd); input.focus({ preventScroll: true }); });
    quick.appendChild(b);
  });
  run('fibo demo');

  // ── three looping films, one clock ──
  const films = D.films.map((f) => {
    const box = document.createElement('div');
    box.className = 'film';
    box.innerHTML = `<div class="film-screen"><div class="film-bar"><i></i><i></i><i></i><span class="cmd">${esc(f.cmd)}</span>`
      + '<span class="loop">● LOOP 00s</span></div><div class="film-body"></div></div>'
      + `<span class="caption"><span class="ink">${esc(f.title)}</span> · ${esc(f.sub)}</span>`;
    const body = $('.film-body', box);
    const lines = f.lines.map(([t, text]) => { const div = document.createElement('div'); div.className = tone(text); div.textContent = text; body.appendChild(div); return { t, div }; });
    const cursor = document.createElement('div');
    cursor.innerHTML = '<span class="mut">$ </span><span class="cursor"></span>';
    body.appendChild(cursor);
    $('#films').appendChild(box);
    return { f, lines, cursor, clock: $('.loop', box), last: f.lines[f.lines.length - 1][0] };
  });
  let ft = 0;
  const frame = () => films.forEach((x) => {
    const k = reduced ? x.f.dur - 1 : ft % x.f.dur;
    x.lines.forEach((l) => { l.div.hidden = k < l.t; });
    x.cursor.hidden = !(k > x.last + 2);
    x.clock.textContent = `● LOOP ${pad(Math.round(k / 4))}s`;
  });
  frame();
  if (!reduced) setInterval(() => { ft += 1; frame(); }, 250);

  // ── 02: a number tells you what was promised when you hover it ──
  $$('[data-g]').forEach((span) => {
    const g = demo.groups.find((x) => x.said === span.dataset.g);
    if (!g) return;
    const idle = `<b class="lime">took ${esc(g.took)}</b>`, over = `<b class="ink">said "${esc(g.said)}"</b> <span class="amber">${esc(g.m)}</span>`;
    span.innerHTML = idle;
    span.addEventListener('mouseenter', () => { span.innerHTML = over; });
    span.addEventListener('mouseleave', () => { span.innerHTML = idle; });
  });

  // ── 03: the multiplier counts up once it is seen; the drift is the demo's own ──
  const multNum = $('#multNum'), target = demo.multiplier;
  let counted = false;
  const countUp = () => {
    if (counted) return;
    counted = true;
    let m = 0;
    (function step() { m = Math.min(target, Math.round((m + 0.1) * 10) / 10); multNum.textContent = m.toFixed(1); if (m < target) setTimeout(step, reduced ? 0 : 45); })();
  };
  const vals = demo.drift.values, top = Math.max(...vals);
  $('#bars').innerHTML = vals.map((v, i) => `<div title="×${v.toFixed(1)}" style="height:${Math.round((v / top) * 100)}%;`
    + `background:${i === vals.length - 1 ? 'var(--amber)' : 'var(--lime-dk)'};animation-delay:${i * 60}ms"></div>`).join('');
  $('#driftFirst').textContent = demo.drift.first;
  $('#driftLast').textContent = `${demo.drift.last} · last 90 days`;

  // ── 05: a toy ledger, written and checked by the real ledger code at build time ──
  const toy = D.toy, ledgerEl = $('#ledger'), docOwl = $('#docOwl'), docMsg = $('#docMsg'), tamper = $('#tamper');
  let broken = false;
  const drawLedger = () => {
    ledgerEl.innerHTML = toy.rows.map((r, i) => {
      const n = i + 1, edited = broken && n === 2, bad = broken && toy.broken.includes(n);
      const hash = edited ? toy.edited.hash : r.hash, said = edited ? toy.edited.said : r.said;
      return `<div class="lrow${edited ? ' edited' : ''}${bad ? ' bad' : ''}"><span class="h">${edited ? '! ' : bad ? '✗ ' : ''}${esc(hash)}</span>`
        + `<span class="what">say ${esc(r.key)} <b>${esc(said)}</b></span><span class="at">${esc(r.at)}</span></div>`;
    }).join('');
    face(docOwl, broken ? 'owl:refuse' : 'owl:report');
    docMsg.textContent = broken ? toy.report : toy.clean;
    tamper.textContent = broken ? 'undo' : 'edit line 2';
  };
  tamper.addEventListener('click', () => { broken = !broken; drawLedger(); });
  drawLedger();

  // ── 06: the token. the program does not know it exists; only config.js does ──
  const ticker = TK.ticker || '$FIB', contract = TK.contract || '', pool = TK.pool || '';
  $$('[data-t="ticker"]').forEach((e) => { e.textContent = ticker; });
  $$('[data-t="network"]').forEach((e) => { e.textContent = TK.network || 'robinhood chain'; });
  $$('[data-t="status"]').forEach((e) => { e.textContent = contract ? 'live' : 'not live yet · address appears here at launch'; });
  $('#tokenPrice').textContent = TK.price || '—';
  $('#tokenContract').textContent = contract || '— · appears here at launch';
  const link = (el, url, label) => { el.href = url || '#token'; el.textContent = url ? label : el.id === 'tokenSwap' ? '— · after launch' : '—'; };
  link($('#tokenSwap'), TK.swap, 'open ↗');
  link($('#tokenExplorer'), TK.explorer, 'open ↗');
  $('#swapBtn').href = TK.swap || '#token';
  $('#copyCa').addEventListener('click', (e) => { if (contract) copy(contract); blinkNav(); done(e.currentTarget); });
  $('#chartPool').textContent = pool ? `${pool.slice(0, 10)}…` : '— · pool address appears here';
  if (pool) {
    const frameEl = document.createElement('iframe');
    frameEl.title = 'live chart';
    frameEl.allow = 'clipboard-write';
    frameEl.src = `https://www.geckoterminal.com/${encodeURIComponent(TK.geckoNetwork || 'robinhood')}/pools/${encodeURIComponent(pool)}`
      + '?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m';
    $('#chartLive').appendChild(frameEl);
    $('#chartLive').hidden = false;
    $('#chartFake').hidden = true;
  } else { // a pump, a smaller pump, a long fade — made up, like the demo, and the same on every machine
    let p = 40;
    const candles = [], volume = [];
    for (let i = 0; i < 48; i++) {
      const drift = i < 4 ? 14 : i < 8 ? -9 : i < 12 ? 7 : i < 16 ? -6 : -1.4, noise = Math.sin(i * 2.3) * 3 + Math.cos(i * 0.7) * 2;
      const o = p, c = Math.max(6, p + drift + noise);
      p = c;
      const lo = Math.min(o, c), hiP = Math.max(o, c), w = 2 + Math.abs(noise) * 0.6, wb = Math.max(0, lo - w), wt = Math.min(96, hiP + w);
      const color = c >= o ? '#4f8f2a' : '#a63a44';
      candles.push(`<div title="candle ${i + 1}"><div class="wick" style="background:${color};bottom:${wb.toFixed(1)}%;height:${(wt - wb).toFixed(1)}%"></div>`
        + `<div class="body" style="background:${color};bottom:${lo.toFixed(1)}%;height:${Math.max(0.8, hiP - lo).toFixed(1)}%"></div></div>`);
      volume.push(`<div style="background:${color};height:${(15 + Math.abs(drift) * 5 + Math.abs(noise) * 4).toFixed(0)}%"></div>`);
    }
    $('#candles').innerHTML = candles.join('');
    $('#volume').innerHTML = volume.join('');
  }
  // ── the burn: a clock standing in a fire. at zero the fees buy the token and the token is burned; then the clock starts over ──
  const burnEl = $('#burn'), burnCfg = TK.burn || {}, burnAt0 = burnCfg.at ? Date.parse(burnCfg.at) : NaN;
  if (burnEl && contract && !Number.isNaN(burnAt0)) {
    burnEl.hidden = false;
    const every = Math.max(1, Number(burnCfg.everyDays) || 7), period = every * 86400000;
    $('#burnEvery').textContent = every;
    const digits = $$('#burnClock b'), tookEl = $('#burnTook'), flag = $('#burnFlag'), whenEl = $('#burnWhen'), countEl = $('#burnCount'), bar = $('#burnBar');
    const dur = (s) => s < 3600 ? `${Math.floor(s / 60)} min` : s < 86400 ? `${Math.floor(s / 3600)} h ${Math.floor(s / 60) % 60} min` : `${Math.floor(s / 86400)} d ${Math.floor(s / 3600) % 24} h`;
    let heat = 0.2;
    const tick = () => {
      const now = Date.now(), n = now < burnAt0 ? 0 : Math.floor((now - burnAt0) / period) + 1, at = burnAt0 + n * period, from = at - period;
      const left = Math.max(0, Math.floor((at - now) / 1000)), gone = Math.max(0, Math.floor((now - from) / 1000)), done = Math.min(1, (now - from) / period);
      [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60].forEach((v, i) => {
        const t = pad(v);
        if (digits[i].textContent !== t) digits[i].textContent = t;
      });
      tookEl.textContent = dur(gone);
      const burning = n > 0 && gone < 900, lastHour = left < 3600; // fifteen minutes of "burning" after every zero
      flag.textContent = burning ? 'burning' : lastHour ? 'last hour' : 'lit';
      burnEl.classList.toggle('hot', burning || lastHour);
      whenEl.textContent = `${n ? 'next' : 'first'} burn · ${new Date(at).toISOString().slice(0, 16).replace('T', ' ')} utc`;
      countEl.textContent = `burn #${n + 1}`;
      bar.style.width = `${(done * 100).toFixed(2)}%`;
      heat = burning || lastHour ? 1 : 0.22 + 0.78 * done * done;
    };
    tick();
    setInterval(tick, 1000);
    const fire = $('#burnFire'), ctx = fire.getContext('2d'), SCALE = 4, MAX = 17;
    const stops = [[15, 24, 12], [31, 51, 18], [61, 92, 31], [111, 154, 42], [181, 232, 83], [215, 255, 122], [240, 196, 25], [255, 210, 63], [255, 248, 220]];
    const PAL = [[0, 0, 0, 0]];
    for (let i = 1; i <= MAX; i++) {
      const t = (i - 1) / (MAX - 1) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t)), f = t - k;
      PAL.push([0, 1, 2].map((c) => Math.round(stops[k][c] + (stops[k + 1][c] - stops[k][c]) * f)).concat(i < 3 ? 140 + i * 40 : 255));
    }
    let W = 0, H = 0, buf, img;
    const frame = () => {
      const w = Math.max(1, Math.ceil(fire.clientWidth / SCALE)), h = Math.max(1, Math.ceil(fire.clientHeight / SCALE));
      if (w !== W || h !== H) { W = w; H = h; fire.width = W; fire.height = H; buf = new Uint8Array(W * H); img = ctx.createImageData(W, H); }
      const seed = Math.round(MAX * (0.55 + 0.45 * heat)), lit = 0.3 + 0.7 * heat, cool = 0.3 * (1 - heat), base = (H - 1) * W;
      for (let x = 0; x < W; x++) buf[base + x] = Math.random() < lit ? seed : (Math.random() * seed * 0.5) | 0;
      for (let y = 0; y < H - 1; y++) {
        for (let x = 0; x < W; x++) {
          const v = buf[(y + 1) * W + x], r = (Math.random() * 3) | 0, dx = Math.min(W - 1, Math.max(0, x + r - 1));
          buf[y * W + dx] = v ? Math.max(0, v - (r & 1) - (Math.random() < cool ? 1 : 0)) : 0;
        }
      }
      const d = img.data;
      for (let i = 0, j = 0; i < W * H; i++, j += 4) { const c = PAL[buf[i]]; d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = c[3]; }
      ctx.putImageData(img, 0, 0);
    };
    if (reduced) { for (let i = 0; i < 90; i++) frame(); } else setInterval(() => { if (!document.hidden) frame(); }, 55);
  }
  window.Sprites.paintAll();

  // ── man fibo ──
  const man = $('#man');
  function openMan() { man.hidden = false; }
  $('#manBtn').addEventListener('click', openMan);
  man.addEventListener('click', () => { man.hidden = true; });
  window.addEventListener('keydown', (e) => {
    if (e.key === '?' && !/INPUT|TEXTAREA/.test(e.target.tagName)) openMan();
    if (e.key === 'Escape') man.hidden = true;
  });

  // ── the perch: the owl sits on a branch and slides with the page ──
  const SECS = ['top', 'film', 'start', 'promise', 'multiplier', 'refuses', 'disk', 'token', 'limits'];
  const rail = $('#rail'), page = $('#page'), prog = $('#railProg'), perch = $('#perch'), perchOwl = $('#perchOwl');
  $('#ticks').innerHTML = SECS.map((s, i) => `<a class="tick" href="#${s}" title="${s}" style="top:calc(72px + (100% - 222px) * ${(i / (SECS.length - 1)).toFixed(3)})"></a>`).join('');
  let lastY = scrollY, dirTimer = 0, queued = false;
  const layout = () => {
    const wide = (document.documentElement.clientWidth || innerWidth) > 860;
    rail.hidden = !wide;
    page.classList.toggle('railed', wide);
  };
  const onScroll = () => {
    queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
    const dir = scrollY > lastY ? 'lookd' : scrollY < lastY ? 'looku' : 'report';
    lastY = scrollY;
    prog.style.height = `calc((100% - 222px) * ${p.toFixed(3)})`;
    perch.style.top = `calc(72px + (100% - 222px) * ${p.toFixed(3)})`;
    $('#railPct').textContent = `${Math.round(p * 100)}%`;
    $('#railWhere').textContent = `you are in ${SECS[Math.min(SECS.length - 1, Math.round(p * (SECS.length - 1)))].toUpperCase()}`;
    face(perchOwl, `owl:${p > 0.97 ? 'auditor' : dir}`);
    clearTimeout(dirTimer);
    dirTimer = setTimeout(() => face(perchOwl, `owl:${p > 0.97 ? 'auditor' : 'report'}`), 700);
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', layout);
  layout();
  onScroll();

  // ── sections arrive in five steps, like everything else here ──
  if (typeof IntersectionObserver === 'function') {
    const reveal = new IntersectionObserver((es) => es.forEach((x) => {
      if (x.isIntersecting) { x.target.setAttribute('data-reveal', 'on'); reveal.unobserve(x.target); }
    }), { threshold: 0.08 });
    $$('[data-reveal="1"]').forEach((el) => reveal.observe(el));
    const seen = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { countUp(); seen.disconnect(); } }, { threshold: 0.4 });
    seen.observe($('#multBox'));
  } else {
    $$('[data-reveal]').forEach((el) => el.setAttribute('data-reveal', 'on'));
    countUp();
  }
})();
