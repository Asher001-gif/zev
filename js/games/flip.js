// Gravity flipper. Tap / Space flips gravity between floor and ceiling. Survive 30s.
import { makeGame, W, H, poly, sky, polyField, makeBg, makeHills, moveHills, drawHills, rand } from '../core.js';
const CEIL = 150, FLOOR = 490, PS = 26, PX = 90;

export default makeGame({
  id: 'flip', name: 'Flip', caption: 'Tap to flip gravity. Survive 30s.', duration: 30,
  how: 'Tap the screen (or press Space) to flip gravity between the floor and the ceiling. Dodge the spikes and pillars for 30 seconds.',
  init() {
    return {
      p: { y: FLOOR - PS, vy: 0, g: 1 }, obs: [], next: 0.9, off: 0,
      far: makeHills(7, 110, 120, 180, 60, 110),
      bg: makeBg(x => {
        sky(x, '#2a1b4d', '#6a3f8f');
        polyField(x, 0, 0, W, CEIL, 40, 265, 35, 16, 6);
        polyField(x, 0, FLOOR, W, H - FLOOR, 40, 265, 35, 16, 6, 3);
      }),
    };
  },
  update(g, s, dt) {
    const speed = 250 + g.t * 4; s.off += speed * dt; moveHills(s.far, speed * 0.1 * dt);
    const p = s.p;
    if (g.input.consumeTap()) { p.g = -p.g; p.vy = p.g * 250; }
    p.vy = Math.max(-950, Math.min(950, p.vy + p.g * 2600 * dt)); p.y += p.vy * dt;
    if (p.y > FLOOR - PS) { p.y = FLOOR - PS; p.vy = Math.min(p.vy, 0); }
    if (p.y < CEIL) { p.y = CEIL; p.vy = Math.max(p.vy, 0); }
    s.next -= dt;
    if (s.next <= 0) {
      const spike = Math.random() < 0.6, n = spike && Math.random() < 0.4 ? 2 : 1;
      s.obs.push({ x: W + 20, w: spike ? 26 * n : 30, h: spike ? 38 : 84, floor: Math.random() < 0.5, spike, n });
      s.next = rand(0.95, 1.5) * (1 - g.t / 90);
    }
    for (const o of s.obs) {
      o.x -= speed * dt;
      const trim = o.spike ? 12 : 0;
      const top = o.floor ? FLOOR - o.h + trim : CEIL, bot = o.floor ? FLOOR : CEIL + o.h - trim;
      if (PX + PS - 5 > o.x + 4 && PX + 5 < o.x + o.w - 4 && p.y + PS > top && p.y < bot) return g.lose();
    }
    s.obs = s.obs.filter(o => o.x > -80);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    drawHills(c, s.far, FLOOR, '#7a4aa5', '#5f3a85');
    for (let k = 0; k < 5; k++) { const x = W - ((s.off + k * 90) % (W + 90)); poly(c, [x, FLOOR + 14, x + 22, FLOOR + 14, x + 11, FLOOR + 22], 'rgba(255,255,255,.12)'); poly(c, [x, CEIL - 14, x + 22, CEIL - 14, x + 11, CEIL - 22], 'rgba(255,255,255,.12)'); }
    for (const o of s.obs) {
      const d = o.floor ? -1 : 1, by = o.floor ? FLOOR : CEIL;
      if (o.spike) {
        const w = o.w / o.n;
        for (let i = 0; i < o.n; i++) { const x = o.x + i * w; poly(c, [x, by, x + w / 2, by + d * o.h, x + w / 2, by], '#ffd8e8'); poly(c, [x + w / 2, by, x + w / 2, by + d * o.h, x + w, by], '#d98aaa'); }
      } else {
        poly(c, [o.x, by, o.x, by + d * o.h, o.x + o.w, by + d * o.h, o.x + o.w, by], '#4fc9bb');
        poly(c, [o.x, by + d * o.h, o.x + o.w, by + d * o.h, o.x + o.w / 2, by + d * o.h / 2], '#7ff0e0');
        poly(c, [o.x + o.w, by, o.x + o.w, by + d * o.h, o.x + o.w / 2, by + d * o.h / 2], '#2a8279');
      }
    }
    const p = s.p; c.save(); c.translate(PX + PS / 2, p.y + PS / 2); c.scale(1, p.g);
    poly(c, [-13, -13, 13, -13, 13, 13, -13, 13], '#ffd166');
    poly(c, [-13, -13, 13, -13, 0, 0], '#ffe49a'); poly(c, [-13, 13, 13, 13, 0, 0], '#d4a03a');
    c.fillStyle = '#1a1a1a'; c.fillRect(3, 2, 4, 4);
    c.restore();
  },
});
