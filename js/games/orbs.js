// Top-down collect & chase. Drag / WASD to move. Grab 12 orbs in 35s, don't get caught.
import { makeGame, W, H, poly, polyField, makeBg, steer, rand, clamp } from '../core.js';
const TARGET = 12;
const newOrb = (p) => { let x, y; do { x = rand(30, W - 30); y = rand(80, H - 30); } while (Math.hypot(x - p.x, y - p.y) < 130); return { x, y }; };

export default makeGame({
  id: 'orbs', how: 'Drag (or WASD / arrows) to move. Collect 12 orbs before time runs out. Don’t let the red chasers touch you.', name: 'Orbs', caption: 'Collect 12 orbs. Don’t get caught.', duration: 35,
  init() {
    const p = { x: W / 2, y: H / 2 + 80 };
    return { p, orb: newOrb(p), got: 0, ch: [{ x: 30, y: 90 }, { x: W - 30, y: 90 }], spawned: 0, bg: makeBg(x => polyField(x, 0, 0, W, H, 40, 140, 35, 24, 9, 11)) };
  },
  status: s => `Orbs ${s.got}/${TARGET}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const p = s.p; steer(p, 190, dt, g.input);
    p.x = clamp(p.x, 12, W - 12); p.y = clamp(p.y, 60, H - 12);
    if (Math.hypot(p.x - s.orb.x, p.y - s.orb.y) < 20) { if (++s.got >= TARGET) return g.win(); s.orb = newOrb(p); }
    const want = g.t > 24 ? 4 : g.t > 12 ? 3 : 2;
    if (s.ch.length < want) { const right = p.x < W / 2, down = p.y < H / 2; s.ch.push({ x: right ? W - 20 : 20, y: down ? H - 20 : 80 }); }
    const sp = Math.min(140, 95 + g.t * 1.5);
    for (const q of s.ch) {
      const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1;
      q.x += dx / d * sp * dt; q.y += dy / d * sp * dt; q.a = Math.atan2(dy, dx);
      if (d < 22) return g.lose();
    }
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    const pulse = 1 + Math.sin(g.t * 6) * 0.12, o = s.orb, r = 13 * pulse;
    poly(c, [o.x, o.y - r, o.x + r, o.y, o.x, o.y], '#ffe27a'); poly(c, [o.x, o.y - r, o.x - r, o.y, o.x, o.y], '#ffd166');
    poly(c, [o.x + r, o.y, o.x, o.y + r, o.x, o.y], '#e0a93a'); poly(c, [o.x - r, o.y, o.x, o.y + r, o.x, o.y], '#f0bd4a');
    for (const q of s.ch) {
      c.save(); c.translate(q.x, q.y); c.rotate(q.a || 0);
      poly(c, [16, 0, -10, -12, -4, 0], '#ff6b6b'); poly(c, [16, 0, -10, 12, -4, 0], '#c93f4a'); poly(c, [-10, -12, -4, 0, -10, 12], '#8f2d3a');
      c.restore();
    }
    const p = s.p;
    poly(c, [p.x, p.y - 13, p.x + 11, p.y, p.x, p.y], '#7ff0e0'); poly(c, [p.x, p.y - 13, p.x - 11, p.y, p.x, p.y], '#4fc9bb');
    poly(c, [p.x + 11, p.y, p.x, p.y + 13, p.x, p.y], '#35a398'); poly(c, [p.x - 11, p.y, p.x, p.y + 13, p.x, p.y], '#2a8279');
  },
});
