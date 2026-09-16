// The owl, the wordmark and T(o,o)K — pixel grids from the brandbook, scaled by whole numbers only.
(() => {
  'use strict';
  const PAL = { K: '#050605', L: '#b5e853', D: '#6f9a2a', H: '#d7ff7a', A: '#f0c419', W: '#e8e8e0', N: '#050605', R: '#ff4d5e' };
  const GLYPHS = {
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  };
  const OWL = [ // 16 × 16, the one that survives a browser tab
    '..K..........K..', '..KK........KK..', '..KLK......KLK..', '..KLLKKKKKKLLK..', '.KLLLLLLLLLLLLK.', '.KLKKKKLLKKKKLK.',
    '.KKAAAAKKAAAAKK.', '.KKAANAKKANAAKK.', '.KKAAAAKKAAAAKK.', '.KLKKKKLLKKKKLK.', '.KLLLLLAALLLLLK.', '.KLDLDLDLDLDLDK.',
    '.KLLDLDLDLDLLLK.', '..KLLLLLLLLLLK..', '...KAAKLLKAAK...', '...KKK....KKK...'];
  const BIG = [ // 24 × 25, the hero; the drift sparkline is on its chest
    '...K................K...', '...KK..............KK...', '...KLK............KLK...', '..KLLLKKKKKKKKKKKKLLLK..', '.KLLLLLLLLLLLLLLLLLLLLK.',
    '.KLKKKKKKLLLLLLKKKKKKLK.', '.KKAAAAAAKLLLLKAAAAAAKK.', '.KKAAAWNAKLLLLKANWAAAKK.', '.KKAAANNAKLLLLKANNAAAKK.', '.KKAAAAAAKLLLLKAAAAAAKK.',
    '.KLKKKKKKLLAALLKKKKKKLK.', '.KLLLLLLLLLAALLLLLLLLLK.', '.KLLLLLLLLLKKLLLLLLLLLK.', '.KDLLLLLLLLLLLLLLLLLLDK.', '.KDDLLLLLLLLLLLLLLLLDDK.',
    '.KDDLLLLLLLLLLLLLLLLDDK.', '.KDDLLLLLLLLLLLLLLLLDDK.', '.KDDLLLLLLLLLDLALLLLDDK.', '.KDDLLLLLLLDLDDALLLLDDK.', '.KDDLLLLLDDDDDDALLLLDDK.',
    '.KDDLLLLDDDDDDDALLLLDDK.', '..KDLLLLLLLLLLLLLLLLDK..', '...KKLLLLLLLLLLLLLLKK...', '.....KAAKLLLLLLKAAK.....', '.....KKKKKKKKKKKKKK.....'];
  const TOOK = { // the word that matters has two o's, and the owl has two eyes
    T: ['LLLLL', '..L..', '..L..', '..L..', '..L..', '..L..', '..L..'],
    O: ['.LLL.', 'LAAAL', 'LAAAL', 'LANAL', 'LAAAL', 'LAAAL', '.LLL.'],
    K: ['L...L', 'L..L.', 'L.L..', 'LL...', 'L.L..', 'L..L.', 'L...L'],
  };

  function word() {
    const letters = [...'FIBO'], rows = Array.from({ length: 7 }, () => '');
    letters.forEach((ch, i) => GLYPHS[ch].forEach((row, y) => {
      rows[y] += row.replace(/1/g, 'L').replace(/0/g, '.') + (i < letters.length - 1 ? '.' : '');
    }));
    return rows;
  }

  function owl(face) {
    const rows = OWL.map((r) => [...r]), E = [3, 4, 5, 6, 9, 10, 11, 12];
    const pupils = (l, r) => { E.forEach((x) => { rows[7][x] = 'A'; }); rows[7][l] = 'N'; rows[7][r] = 'N'; };
    if (face === 'auditor') E.forEach((x) => { rows[6][x] = 'D'; });
    if (face === 'empty' || face === 'blink') E.forEach((x) => { rows[6][x] = 'D'; rows[7][x] = 'D'; rows[8][x] = 'K'; });
    if (face === 'refuse') { E.forEach((x) => { rows[6][x] = 'D'; }); rows[4][6] = 'K'; rows[4][9] = 'K'; rows[5][7] = 'K'; rows[5][8] = 'K'; }
    if (face === 'lookl') pupils(4, 10);
    if (face === 'lookr') pupils(6, 12);
    if (face === 'lookd') { E.forEach((x) => { rows[7][x] = 'A'; }); rows[8][5] = 'N'; rows[8][11] = 'N'; }
    if (face === 'looku') { E.forEach((x) => { rows[7][x] = 'A'; }); rows[6][5] = 'N'; rows[6][11] = 'N'; }
    if (face === 'doctor') {
      [3, 4, 5, 6].forEach((x) => { rows[6][x] = 'D'; });
      [9, 10, 11, 12].forEach((x) => { rows[5][x] = 'W'; rows[9][x] = 'W'; });
      [[6, 8], [7, 8], [8, 8], [6, 13], [7, 13], [8, 13], [10, 13], [11, 14], [12, 14]].forEach(([y, x]) => { rows[y][x] = 'W'; });
    }
    return rows.map((r) => r.join(''));
  }

  function big(face) {
    const rows = BIG.map((r) => [...r]), L = [3, 4, 5, 6, 7, 8], R = [15, 16, 17, 18, 19, 20], E = [...L, ...R];
    const gaze = (dx, dy) => { // both pupils move together, snapping: no smooth tracking
      [6, 7, 8, 9].forEach((y) => E.forEach((x) => { rows[y][x] = 'A'; }));
      const lx = 5 + dx, rx = 17 + dx, y = 7 + dy;
      [lx, lx + 1, rx, rx + 1].forEach((x) => { rows[y][x] = 'N'; rows[y + 1][x] = 'N'; });
      if (lx - 1 >= 3) rows[y][lx - 1] = 'W';
      if (rx - 1 >= 15) rows[y][rx - 1] = 'W';
    };
    if (face === 'auditor') E.forEach((x) => { rows[6][x] = 'D'; rows[7][x] = 'D'; });
    if (face === 'blink') { [6, 7, 9].forEach((y) => E.forEach((x) => { rows[y][x] = 'D'; })); E.forEach((x) => { rows[8][x] = 'K'; }); }
    if (face === 'lookl') gaze(-2, 0);
    if (face === 'lookr') gaze(2, 0);
    if (face && face[0] === 'g') {
      const [dx, dy] = face.slice(1).split(',').map(Number);
      gaze(Math.max(-2, Math.min(2, dx)), Math.max(-1, Math.min(1, dy)));
    }
    return rows.map((r) => r.join(''));
  }

  function took() {
    const rows = Array.from({ length: 7 }, () => '');
    [...'TOOK'].forEach((ch, i) => TOOK[ch].forEach((r, y) => { rows[y] += r + (i < 3 ? '.' : ''); }));
    return rows;
  }

  function sprite(name) {
    if (name.startsWith('owl:')) return owl(name.slice(4));
    if (name.startsWith('big:')) return big(name.slice(4));
    if (name === 'took') return took();
    return word();
  }

  function paint(cv, name) {
    if (!cv) return;
    name = name || cv.dataset.sprite;
    const scale = Math.max(1, parseInt(cv.dataset.scale || '1', 10)), key = `${name}@${scale}`;
    if (cv.dataset.painted === key) return;
    const rows = sprite(name), w = rows[0].length, h = rows.length;
    cv.width = w; cv.height = h;
    cv.style.width = `${w * scale}px`; cv.style.height = `${h * scale}px`;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    rows.forEach((r, y) => [...r].forEach((ch, x) => { const c = PAL[ch]; if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }));
    cv.dataset.sprite = name;
    cv.dataset.painted = key;
  }

  const paintAll = (root = document) => root.querySelectorAll('canvas[data-sprite]').forEach((cv) => paint(cv));

  function favicon(name = 'owl:auditor') {
    const cv = document.createElement('canvas');
    paint(cv, name);
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = cv.toDataURL('image/png');
  }

  window.Sprites = { sprite, paint, paintAll, favicon };
})();
