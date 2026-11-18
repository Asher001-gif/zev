// Side-scroll runner. Tap / Space to jump. Survive 30s.
import { makeGame, W, H, poly, sky, polyField, makeBg, makeHills, moveHills, drawHills, rand, clamp } from '../core.js';
const GY = 520;

export default makeGame({
  id: 'hop', name: 'Hop', caption: 'Tap to jump over the spikes. Survive 30s.', duration: 30,
  init() {
    return {
      p: { x: 80, y: GY - 30, vy: 0, w: 28, h: 30 }, obs: [], next: 0.5, speed: 230, off: 0,
      far: makeHills(7, 110, 120, 180, 90, 150), near: makeHills(7, 100, 70, 120, 40, 80),
      ground: makeBg(x => polyField(x, 0, GY, W, H - GY, 40, 18, 45, 30, 10)),
    };
  },
  update(g, s, dt) {
    s.speed = 230 + g.t * 3; s.off += s.speed * dt;
    moveHills(s.far, s.speed * 0.1 * dt); moveHills(s.near, s.speed * 0.25 * dt);
    const p = s.p;
    if (g.input.consumeTap() && p.y >= GY - p.h - 0.01) p.vy = -600;
    p.vy += 1750 * dt; p.y += p.vy * dt;
    if (p.y > GY - p.h) { p.y = GY - p.h; p.vy = 0; }
    s.next -= dt;
    if (s.next <= 0) {
      const r = Math.random();
      s.obs.push(r < 0.45 ? { x: W + 20, w: 26, h: 28, t: 's' } : r < 0.75 ? { x: W + 20, w: 52, h: 28, t: 's2' } : { x: W + 20, w: 32, h: 38, t: 'b' });
      s.next = rand(1.0, 1.7);
    }
    for (const o of s.obs) {
      o.x -= s.speed * dt;
      if (p.x + p.w - 5 > o.x + 4 && p.x + 5 < o.x + o.w - 4 && p.y + p.h > GY - o.h + 8) return g.lose();
    }
    s.obs = s.obs.filter(o => o.x > -80);
  },
  draw(g, s, c) {
    sky(c, '#ff9a76', '#ffe3b3');
    poly(c, [W - 90, 120, W - 60, 90, W - 30, 120, W - 60, 150], '#fff1c9');
    drawHills(c, s.far, GY, '#e07a7a', '#c25c6c');
    drawHills(c, s.near, GY, '#b8506a', '#923f5e');
    c.drawImage(s.ground, 0, 0, W, H);
    for (let k = 0; k < 5; k++) { const x = W - ((s.off + k * 90) % (W + 90)); poly(c, [x, GY + 16, x + 22, GY + 16, x + 11, GY + 24], 'rgba(255,255,255,.13)'); }
    for (const o of s.obs) {
      if (o.t === 'b') {
        poly(c, [o.x, GY, o.x, GY - o.h, o.x + o.w, GY - o.h, o.x + o.w, GY], '#6b4a8f');
        poly(c, [o.x, GY - o.h, o.x + o.w, GY - o.h, o.x + o.w / 2, GY - o.h / 2], '#8a63b5');
        poly(c, [o.x + o.w, GY - o.h, o.x + o.w, GY, o.x + o.w / 2, GY - o.h / 2], '#52376f');
      } else {
        const n = o.t === 's' ? 1 : 2, w = o.w / n;
        for (let i = 0; i < n; i++) { const x = o.x + i * w; poly(c, [x, GY, x + w / 2, GY - o.h, x + w / 2, GY], '#f4f1ea'); poly(c, [x + w / 2, GY, x + w / 2, GY - o.h, x + w, GY], '#b9b3a6'); }
      }
    }
    const p = s.p; c.save(); c.translate(p.x + 14, p.y + 15); c.rotate(clamp(p.vy / 1500, -0.4, 0.5));
    poly(c, [-14, -15, 14, -15, 14, 15, -14, 15], '#f28c28');
    poly(c, [-14, -15, 14, -15, 0, 2], '#ffb054');
    poly(c, [-14, 15, 14, 15, 0, 2], '#d4701a');
    poly(c, [-10, -15, -3, -15, -8, -27], '#f28c28'); poly(c, [3, -15, 10, -15, 8, -27], '#d4701a');
    poly(c, [-14, 2, -26, 8, -14, 12], '#fff4e0');
    c.fillStyle = '#1a1a1a'; c.fillRect(5, -8, 4, 4);
    c.restore();
  },
});
