// Whack-a-mole. Tap moles (or arrows to pick a hole + Space). Whack 15 in 35s, skip bombs, 3 lives.
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const GOAL = 15, COLS = 3, ROWS = 4, HX = i => 60 + i * 120, HY = j => 200 + j * 115;
const cell = (x, y) => { const i = Math.round((x - 60) / 120), j = Math.round((y - 200) / 115); return (i < 0 || i >= COLS || j < 0 || j >= ROWS) ? -1 : j * COLS + i; };
export default makeGame({
  id: 'mole', name: 'Whack', caption: 'Whack 15 moles. Don\u2019t hit bombs.', duration: 35,
  how: 'Tap the moles as they pop up (or arrows to move the highlight, Space to whack). Whack 15 in 35 seconds. Bombs cost a life; you have 3.',
  init() {
    return { m: [], fx: [], lives: 3, got: 0, next: .4, sel: 4, key: false, flash: 0, ax: 0, ay: 0, px: -1, py: -1,
      bg: makeBg(x => { polyField(x, 0, 0, W, H, 40, 100, 38, 30, 8); for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { x.fillStyle = '#3a2417'; x.beginPath(); x.ellipse(HX(i), HY(j) + 6, 44, 17, 0, 0, 7); x.fill(); x.fillStyle = '#5b3a24'; x.beginPath(); x.ellipse(HX(i), HY(j), 44, 17, 0, 0, 7); x.fill(); x.fillStyle = '#1e120b'; x.beginPath(); x.ellipse(HX(i), HY(j) + 2, 34, 12, 0, 0, 7); x.fill(); } }) };
  },
  status: s => `Whacked ${s.got}/${GOAL}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const inp = g.input, ax = inp.axisX(), ay = inp.axisY();
    if ((ax && !s.ax) || (ay && !s.ay)) { s.key = true; const i = clamp(s.sel % COLS + ax, 0, COLS - 1), j = clamp(Math.floor(s.sel / COLS) + ay, 0, ROWS - 1); s.sel = j * COLS + i; }
    s.ax = ax; s.ay = ay; if (inp.ptr.x !== s.px || inp.ptr.y !== s.py || inp.ptr.down) { if (s.px !== -1 || inp.ptr.down) s.key = false; s.px = inp.ptr.x; s.py = inp.ptr.y; }
    s.flash = Math.max(0, s.flash - dt);
    s.next -= dt; if (s.next <= 0) { s.next = rand(.45, .8); const free = []; for (let k = 0; k < COLS * ROWS; k++) if (!s.m.some(m => m.c === k)) free.push(k); if (free.length && s.m.length < 3) s.m.push({ c: free[Math.floor(rand(0, free.length))], t: 0, d: rand(.9, 1.3), bomb: Math.random() < .2, hit: 0 }); }
    for (const m of s.m) m.t += dt; for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.l -= dt; }
    s.m = s.m.filter(m => m.t < m.d && !(m.hit && m.t > m.hit + .25)); s.fx = s.fx.filter(f => f.l > 0);
    while (inp.consumeTap()) {
      const k = s.key ? s.sel : cell(inp.ptr.x, inp.ptr.y); if (k < 0) continue;
      const m = s.m.find(q => q.c === k && !q.hit && Math.sin(Math.PI * q.t / q.d) > .25); if (!m) continue;
      m.hit = m.t; const x = HX(k % COLS), y = HY(Math.floor(k / COLS));
      for (let i = 0; i < 10; i++) s.fx.push({ x, y: y - 20, vx: rand(-140, 140), vy: rand(-170, 20), l: rand(.3, .6), col: m.bomb ? '#ff7a3a' : '#ffd166' });
      if (m.bomb) { s.flash = .3; if (--s.lives <= 0) return g.lose(); } else if (++s.got >= GOAL) return g.win();
    }
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const m of s.m) {
      const x = HX(m.c % COLS), y = HY(Math.floor(m.c / COLS)), up = m.hit ? 0.25 : Math.sin(Math.PI * m.t / m.d), h = up * 50;
      c.save(); c.beginPath(); c.rect(x - 60, y - 90, 120, 96); c.clip();
      if (m.bomb) { poly(c, [x - 18, y - h + 10, x, y - h - 10, x + 18, y - h + 10, x + 18, y + 10, x - 18, y + 10], '#2a2a35'); poly(c, [x - 18, y - h + 10, x, y - h - 10, x, y + 10, x - 18, y + 10], '#15151c'); c.fillStyle = Math.random() < .5 ? '#ffd166' : '#ff7a3a'; c.fillRect(x + 2, y - h - 18, 6, 6); }
      else { poly(c, [x - 20, y - h + 12, x - 12, y - h - 8, x + 12, y - h - 8, x + 20, y - h + 12, x + 20, y + 12, x - 20, y + 12], '#a9743f'); poly(c, [x - 20, y - h + 12, x - 12, y - h - 8, x, y - h - 8, x, y + 12, x - 20, y + 12], '#85592e');
        poly(c, [x - 8, y - h + 4, x + 8, y - h + 4, x, y - h + 12], '#ffb3a7'); c.fillStyle = '#111'; if (m.hit) { c.fillRect(x - 11, y - h - 2, 8, 2); c.fillRect(x + 3, y - h - 2, 8, 2); } else { c.fillRect(x - 10, y - h - 3, 5, 5); c.fillRect(x + 5, y - h - 3, 5, 5); } }
      c.restore();
      c.fillStyle = '#5b3a24'; c.beginPath(); c.ellipse(x, y + 6, 44, 10, 0, 0, Math.PI); c.fill();
    }
    if (s.key) { const k = s.sel, x = HX(k % COLS), y = HY(Math.floor(k / COLS)); c.strokeStyle = '#ffd166'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y + 2, 50, 20, 0, 0, 7); c.stroke(); }
    for (const f of s.fx) { c.globalAlpha = clamp(f.l * 3, 0, 1); poly(c, [f.x, f.y - 4, f.x + 4, f.y, f.x, f.y + 4, f.x - 4, f.y], f.col); } c.globalAlpha = 1;
    if (s.flash > 0) { c.fillStyle = 'rgba(255,80,60,' + s.flash + ')'; c.fillRect(0, 0, W, H); }
  },
});
