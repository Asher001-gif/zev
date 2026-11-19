// Rhythm lanes. Tap the lane (or A / S / D, or arrows) when a gem hits the line. Hit 20 in 40s, 3 misses allowed.
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const LX = [60, 180, 300], HY = 520, GOAL = 20, KEYS = [['a', 'arrowleft'], ['s', 'arrowdown'], ['d', 'arrowright']];
const COL = [['#ff6b9a', '#c93f6e'], ['#ffd166', '#d4a03a'], ['#6bd6ff', '#3f9ac9']];
export default makeGame({
  id: 'rhythm', name: 'Rhythm', caption: 'Tap gems on the line. Hit 20.', duration: 40,
  how: 'Tap the lane when a gem reaches the glowing line (or press A / S / D). Hit 20 gems in 40 seconds. You can miss 3 gems before it\u2019s over.',
  init() {
    return { n: [], fx: [], next: .6, got: 0, lives: 3, combo: 0, glow: [0, 0, 0], last: [false, false, false], fl: '',
      bg: makeBg(x => { polyField(x, 0, 0, W, H, 40, 265, 35, 12, 5); for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(LX[i] - 54, 0, 108, H); x.fillStyle = COL[i][0]; x.globalAlpha = .18; x.fillRect(LX[i] - 54, 0, 2, H); x.fillRect(LX[i] + 52, 0, 2, H); x.globalAlpha = 1; } }) };
  },
  status: s => `Hits ${s.got}/${GOAL}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const inp = g.input, press = [];
    for (let i = 0; i < 3; i++) { const d = inp.keys.has(KEYS[i][0]) || inp.keys.has(KEYS[i][1]); if (d && !s.last[i]) press.push(i); s.last[i] = d; }
    while (inp.consumeTap()) { if (inp.ptr.down || inp.ptr.x) { const l = clamp(Math.floor(inp.ptr.x / 120), 0, 2); if (!press.length) press.push(l); } }
    s.next -= dt; if (s.next <= 0) { s.next = rand(.38, .7); s.n.push({ l: Math.floor(rand(0, 3)), y: -20 }); }
    for (const n of s.n) n.y += 300 * dt;
    for (const l of press) {
      s.glow[l] = .2; let best = null; for (const n of s.n) if (n.l === l && Math.abs(n.y - HY) < 42 && (!best || n.y > best.y)) best = n;
      if (best) { s.n.splice(s.n.indexOf(best), 1); s.combo++; s.fl = Math.abs(best.y - HY) < 14 ? 'PERFECT' : 'GOOD'; s.ft = .5; for (let i = 0; i < 10; i++) s.fx.push({ x: LX[l], y: HY, vx: rand(-140, 140), vy: rand(-200, 40), l: rand(.3, .6), c: COL[l][0] }); if (++s.got >= GOAL) return g.win(); }
    }
    for (const n of s.n) if (n.y > HY + 48 && !n.m) { n.m = true; s.combo = 0; s.fl = 'MISS'; s.ft = .5; if (--s.lives <= 0) return g.lose(); }
    s.n = s.n.filter(n => n.y < H + 30); for (let i = 0; i < 3; i++) s.glow[i] = Math.max(0, s.glow[i] - dt);
    s.ft = Math.max(0, (s.ft || 0) - dt); for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 400 * dt; f.l -= dt; } s.fx = s.fx.filter(f => f.l > 0);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (let i = 0; i < 3; i++) { const x = LX[i], a = .25 + s.glow[i] * 3; c.globalAlpha = Math.min(a, .9); poly(c, [x - 46, HY - 14, x + 46, HY - 14, x + 46, HY + 14, x - 46, HY + 14], COL[i][0]); c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x - 46, HY - 2, 92, 4); c.font = '700 13px system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.55)'; c.fillText('ASD'[i], x, HY + 40); }
    for (const n of s.n) { const x = LX[n.l], y = n.y, k = COL[n.l]; c.globalAlpha = n.m ? .35 : 1; poly(c, [x, y - 18, x + 24, y, x, y + 18, x - 24, y], k[0]); poly(c, [x, y - 18, x - 24, y, x, y + 18], k[1]); poly(c, [x - 8, y - 2, x, y - 10, x + 8, y - 2], 'rgba(255,255,255,.55)'); } c.globalAlpha = 1;
    for (const f of s.fx) { c.globalAlpha = clamp(f.l * 3, 0, 1); poly(c, [f.x, f.y - 4, f.x + 4, f.y, f.x, f.y + 4, f.x - 4, f.y], f.c); } c.globalAlpha = 1;
    if (s.ft > 0) { c.font = '800 28px system-ui,sans-serif'; c.textAlign = 'center'; c.globalAlpha = clamp(s.ft * 3, 0, 1); c.fillStyle = s.fl === 'MISS' ? '#ff6b6b' : s.fl === 'PERFECT' ? '#ffd166' : '#8be28f'; c.fillText(s.fl, W / 2, 400); c.globalAlpha = 1; }
    if (s.combo > 2) { c.font = '700 16px system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('x' + s.combo + ' combo', W / 2, 90); } c.textAlign = 'left';
  },
});
