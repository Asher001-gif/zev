// Side-scroll jetpack. Hold to fly up, release to fall. Collect 10 coins in 35s, avoid zappers.
import { makeGame, W, H, poly, sky, polyField, makeBg, makeHills, moveHills, drawHills, rand, clamp, hash } from '../core.js';
const CY = 64, FY = 566, GOAL = 10;
function segDist(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy; let t = l ? ((px - x1) * dx + (py - y1) * dy) / l : 0; t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
export default makeGame({
  id: 'jet', name: 'Jetpack', caption: 'Hold to fly. Grab 10 coins, dodge zappers.', duration: 35,
  how: 'Hold the screen (or Space / Up) to fly up, release to fall. Collect 10 coins in 35 seconds and stay away from the zappers.',
  init() {
    return {
      p: { x: 90, y: 300, vy: 0 }, zs: [], coins: [], fl: [], next: .8, nc: 1, got: 0, speed: 220, off: 0,
      far: makeHills(7, 110, 120, 180, 90, 150), near: makeHills(7, 100, 70, 120, 40, 80),
      fg: makeBg(x => {
        polyField(x, 0, 0, W, CY, 32, 255, 25, 14, 6); polyField(x, 0, FY, W, H - FY, 32, 255, 25, 14, 6);
        x.fillStyle = '#ffd166'; for (let k = 0; k < W; k += 28) { x.fillRect(k, CY - 3, 14, 3); x.fillRect(k + 14, FY, 14, 3); }
      }),
      stars: Array.from({ length: 30 }, (_, i) => [hash(i, 1) * W, hash(i, 2) * 400, 1 + hash(i, 3) * 2]),
    };
  },
  status: s => `Coins ${s.got}/${GOAL}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const inp = g.input, k = inp.keys, p = s.p, held = inp.ptr.down || k.has(' ') || k.has('arrowup') || k.has('w');
    s.speed = 220 + g.t * 2; s.off += s.speed * dt; moveHills(s.far, s.speed * .08 * dt); moveHills(s.near, s.speed * .2 * dt);
    p.vy = clamp(p.vy + (held ? -1500 : 1100) * dt, -380, 420); p.y += p.vy * dt;
    if (p.y < CY + 16) { p.y = CY + 16; p.vy = 0; } if (p.y > FY - 18) { p.y = FY - 18; p.vy = 0; }
    if (held) s.fl.push({ x: p.x - 10, y: p.y + 14, l: .3 });
    for (const f of s.fl) { f.x -= s.speed * .6 * dt; f.y += 90 * dt; f.l -= dt; } s.fl = s.fl.filter(f => f.l > 0);
    s.next -= dt; s.nc -= dt;
    if (s.next <= 0) { const a = Math.PI / 2 + rand(-.8, .8); s.zs.push({ x: W + 40, y: rand(CY + 60, FY - 60), len: rand(90, 150), a }); s.next = rand(.9, 1.5); }
    if (s.nc <= 0) { const y0 = rand(CY + 70, FY - 70); for (let i = 0; i < 5; i++) s.coins.push({ x: W + 20 + i * 26, y: y0 - Math.sin(i / 4 * Math.PI) * 34, ph: i }); s.nc = rand(1.5, 2); }
    for (const z of s.zs) {
      z.x -= s.speed * dt; const dx = Math.cos(z.a) * z.len / 2, dy = Math.sin(z.a) * z.len / 2;
      if (segDist(z.x - dx, z.y - dy, z.x + dx, z.y + dy, p.x, p.y) < 14) return g.lose();
    }
    for (const c of s.coins) { c.x -= s.speed * dt; if (!c.got && Math.hypot(c.x - p.x, c.y - p.y) < 20) { c.got = true; if (++s.got >= GOAL) return g.win(); } }
    s.zs = s.zs.filter(z => z.x > -120); s.coins = s.coins.filter(c => c.x > -30 && !c.got);
  },
  draw(g, s, c) {
    sky(c, '#1c1b3a', '#4a3a78');
    c.fillStyle = '#fff'; for (const t of s.stars) { c.globalAlpha = .4 + .4 * Math.sin(g.t * 2 + t[0]); c.fillRect(t[0], t[1], t[2], t[2]); } c.globalAlpha = 1;
    poly(c, [W - 80, 130, W - 52, 100, W - 24, 130, W - 52, 160], '#f5e9ff');
    drawHills(c, s.far, FY, '#4b3f86', '#3a3170'); drawHills(c, s.near, FY, '#33295f', '#261f4a');
    c.drawImage(s.fg, 0, 0, W, H);
    for (const z of s.zs) {
      const dx = Math.cos(z.a) * z.len / 2, dy = Math.sin(z.a) * z.len / 2, x1 = z.x - dx, y1 = z.y - dy, x2 = z.x + dx, y2 = z.y + dy, fl = Math.random() < .3 ? 2 : 0;
      c.lineCap = 'round'; c.strokeStyle = 'rgba(255,225,90,.3)'; c.lineWidth = 12 + fl; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      c.strokeStyle = '#fff6a8'; c.lineWidth = 3; c.stroke();
      for (const [ex, ey] of [[x1, y1], [x2, y2]]) { poly(c, [ex, ey - 8, ex + 8, ey, ex, ey + 8, ex - 8, ey], '#6b4a8f'); poly(c, [ex, ey - 8, ex + 8, ey, ex, ey], '#8a63b5'); }
    }
    for (const k of s.coins) { const w = Math.max(.15, Math.abs(Math.cos(g.t * 6 + k.ph))) * 9; poly(c, [k.x - w, k.y, k.x, k.y - 10, k.x, k.y + 10], '#ffd166'); poly(c, [k.x, k.y - 10, k.x + w, k.y, k.x, k.y + 10], '#d4a03a'); }
    for (const f of s.fl) { const r = f.l * 30; c.globalAlpha = f.l * 3 > 1 ? 1 : f.l * 3; poly(c, [f.x, f.y - r / 3, f.x - r, f.y + r / 6, f.x, f.y + r / 3], '#ffb347'); poly(c, [f.x, f.y - r / 6, f.x - r * .55, f.y, f.x, f.y + r / 6], '#fff2a8'); } c.globalAlpha = 1;
    const p = s.p, x = p.x, y = p.y;
    c.save(); c.translate(x, y); c.rotate(clamp(p.vy / 1200, -.3, .3));
    poly(c, [-16, -8, -8, -8, -8, 12, -16, 12], '#8b8fa6'); poly(c, [-16, -8, -12, -8, -12, 12, -16, 12], '#6b6f86');
    poly(c, [-8, -14, 10, -14, 10, 14, -8, 14], '#ff6b6b'); poly(c, [-8, 0, 10, 0, 10, 14, -8, 14], '#c93f4a');
    poly(c, [-6, -26, 8, -26, 10, -14, -8, -14], '#f6d6b0'); poly(c, [-6, -26, 8, -26, 8, -21, -6, -21], '#7a4a2a');
    poly(c, [2, -23, 9, -23, 9, -16, 2, -16], '#8ee7ff'); poly(c, [-8, 14, -2, 14, -4, 22, -8, 22], '#33295f'); poly(c, [2, 14, 8, 14, 8, 22, 4, 22], '#33295f');
    c.restore();
  },
});
