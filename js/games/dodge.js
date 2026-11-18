// Top-down survival. Drag / WASD to move. Survive 30s.
import { makeGame, W, H, poly, polyField, makeBg, steer, rand, clamp } from '../core.js';

export default makeGame({
  id: 'dodge', how: 'Drag your finger (or use WASD / arrow keys) to move. Don’t touch the red shards. Survive 30 seconds.', name: 'Dodge', caption: 'Drag to move. Avoid the red shards for 30s.', duration: 30,
  init() {
    return { p: { x: W / 2, y: H / 2 }, sh: [], next: 0.5, bg: makeBg(x => polyField(x, 0, 0, W, H, 40, 190, 35, 22, 8, 3)) };
  },
  update(g, s, dt) {
    const p = s.p; steer(p, 200, dt, g.input);
    p.x = clamp(p.x, 14, W - 14); p.y = clamp(p.y, 60, H - 14);
    s.next -= dt;
    if (s.next <= 0) {
      s.next = Math.max(0.28, 0.65 - g.t * 0.012);
      const e = Math.floor(Math.random() * 4); let x, y;
      if (e === 0) { x = rand(0, W); y = -20; } else if (e === 1) { x = W + 20; y = rand(0, H); } else if (e === 2) { x = rand(0, W); y = H + 20; } else { x = -20; y = rand(0, H); }
      const tx = p.x + rand(-70, 70), ty = p.y + rand(-70, 70), d = Math.hypot(tx - x, ty - y), sp = rand(110, 190) + g.t * 2;
      s.sh.push({ x, y, vx: (tx - x) / d * sp, vy: (ty - y) / d * sp, rot: rand(0, 6.28) });
    }
    for (const q of s.sh) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += dt * 5;
      if (Math.hypot(q.x - p.x, q.y - p.y) < 18) return g.lose();
    }
    s.sh = s.sh.filter(q => q.x > -60 && q.x < W + 60 && q.y > -60 && q.y < H + 60);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const q of s.sh) {
      c.save(); c.translate(q.x, q.y); c.rotate(q.rot);
      poly(c, [0, -12, 11, 9, 0, 3], '#ff6b6b'); poly(c, [0, -12, -11, 9, 0, 3], '#d64545'); poly(c, [-11, 9, 11, 9, 0, 3], '#a82f3a');
      c.restore();
    }
    const p = s.p;
    poly(c, [p.x, p.y - 13, p.x + 11, p.y, p.x, p.y], '#7ff0e0'); poly(c, [p.x, p.y - 13, p.x - 11, p.y, p.x, p.y], '#4fc9bb');
    poly(c, [p.x + 11, p.y, p.x, p.y + 13, p.x, p.y], '#35a398'); poly(c, [p.x - 11, p.y, p.x, p.y + 13, p.x, p.y], '#2a8279');
  },
});
