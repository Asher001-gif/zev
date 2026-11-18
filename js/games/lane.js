// Top-down road crossing. Drag / WASD to move. Cross the road 3 times in 40s, 3 lives.
import { makeGame, W, H, poly, polyField, makeBg, steer, rand, clamp } from '../core.js';
const LANES = 6, LY = i => 140 + i * 58, TARGET = 3, SX = W / 2, SY = H - 46;
const COLORS = [['#ff6b6b', '#c93f4a'], ['#ffd166', '#d4a03a'], ['#6bb8ff', '#3f86c9'], ['#8be28f', '#4cb34f'], ['#c79bff', '#8f63c9']];

export default makeGame({
  id: 'lane', name: 'Lane', caption: 'Cross the road 3 times. Mind the cars.', duration: 40,
  how: 'Drag (or WASD / arrows) to move. Cross the road to the top 3 times. You have 3 lives; each car hit costs one.',
  init() {
    const cars = [];
    for (let i = 0; i < LANES; i++) {
      const dir = i % 2 ? 1 : -1, sp = rand(70, 135), w = rand(46, 70), n = 3, gap = (W + 160) / n, off = rand(0, gap);
      const [a, b] = COLORS[Math.floor(rand(0, COLORS.length))];
      for (let k = 0; k < n; k++) cars.push({ x: -80 + off + k * gap, y: LY(i), w, dir, sp, a, b });
    }
    return {
      p: { x: SX, y: SY }, cars, lives: 3, got: 0, inv: 0,
      bg: makeBg(x => {
        polyField(x, 0, 0, W, 111, 40, 120, 35, 30, 8);
        polyField(x, 0, 111, W, 348, 40, 220, 10, 22, 6);
        polyField(x, 0, 459, W, H - 459, 40, 120, 35, 30, 8, 4);
        x.fillStyle = 'rgba(255,255,255,.28)';
        for (let i = 0; i < LANES - 1; i++) for (let k = 0; k < W; k += 44) x.fillRect(k, LY(i) + 28, 22, 3);
        x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '800 16px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('GOAL ▲', W / 2, 90);
      }),
    };
  },
  status: s => `Crossed ${s.got}/${TARGET}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const p = s.p; steer(p, 165, dt, g.input);
    p.x = clamp(p.x, 12, W - 12); p.y = clamp(p.y, 60, H - 14);
    s.inv = Math.max(0, s.inv - dt);
    for (const c of s.cars) {
      c.x += c.dir * c.sp * dt;
      if (c.dir > 0 && c.x > W + 80) c.x -= W + 160; else if (c.dir < 0 && c.x < -80 - c.w) c.x += W + 160;
      if (s.inv <= 0 && Math.abs(p.x - (c.x + c.w / 2)) < c.w / 2 + 8 && Math.abs(p.y - c.y) < 22) {
        if (--s.lives <= 0) return g.lose();
        p.x = SX; p.y = SY; s.inv = 1.2; break;
      }
    }
    if (p.y < 100) { if (++s.got >= TARGET) return g.win(); p.x = SX; p.y = SY; s.inv = 0.4; }
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const k of s.cars) {
      const x = k.x, y = k.y - 14, w = k.w, f = k.dir > 0 ? x + w : x, wd = k.dir > 0 ? -16 : 16;
      poly(c, [x, y, x + w, y, x + w, y + 14, x, y + 14], k.a);
      poly(c, [x, y + 14, x + w, y + 14, x + w, y + 28, x, y + 28], k.b);
      poly(c, [f, y + 4, f + wd, y + 6, f + wd, y + 22, f, y + 24], '#1d2b3f');
    }
    const p = s.p;
    if (s.inv > 0 && Math.floor(g.t * 12) % 2) return;
    poly(c, [p.x, p.y - 13, p.x + 11, p.y + 10, p.x, p.y + 4], '#8be28f');
    poly(c, [p.x, p.y - 13, p.x - 11, p.y + 10, p.x, p.y + 4], '#4cb34f');
    poly(c, [p.x - 11, p.y + 10, p.x + 11, p.y + 10, p.x, p.y + 4], '#2f8a3a');
  },
});
