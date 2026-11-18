// Side-scroll flyer. Tap / Space to flap. Survive 30s.
import { makeGame, W, H, poly, sky, makeHills, moveHills, drawHills, rand, clamp } from '../core.js';
const GAP = 170, PW = 56, FLOOR = H - 60;

export default makeGame({
  id: 'flap', how: 'Tap (or press Space) to flap and fly through the gaps. Don’t hit the pipes or the ground. Survive 30 seconds.', name: 'Flap', caption: 'Tap to flap through the gaps. Survive 30s.', duration: 30,
  init() { return { y: 300, vy: 0, pil: [], next: 0.6, gy: 320, hills: makeHills(7, 110, 130, 190, 80, 140) }; },
  update(g, s, dt) {
    moveHills(s.hills, 20 * dt);
    if (g.input.consumeTap()) s.vy = -310;
    s.vy += 950 * dt; s.y += s.vy * dt;
    if (s.y < 13) { s.y = 13; s.vy = 0; }
    if (s.y > FLOOR - 13) return g.lose();
    s.next -= dt;
    if (s.next <= 0) { s.gy = clamp(s.gy + rand(-130, 130), 150, 470); s.pil.push({ x: W + 30, gy: s.gy }); s.next = 1.55; }
    for (const q of s.pil) {
      q.x -= 150 * dt;
      const cx = clamp(100, q.x, q.x + PW);
      if (Math.abs(100 - cx) < 13) {   // overlapping horizontally with pillar column
        if (s.y - 11 < q.gy - GAP / 2 || s.y + 11 > q.gy + GAP / 2) return g.lose();
      }
    }
    s.pil = s.pil.filter(q => q.x > -PW - 10);
  },
  draw(g, s, c) {
    sky(c, '#3b2a6b', '#e58a8a');
    drawHills(c, s.hills, FLOOR, '#5b4a93', '#463a7a');
    for (const q of s.pil) {
      const top = q.gy - GAP / 2, bot = q.gy + GAP / 2, x = q.x;
      poly(c, [x, 0, x + PW / 2, 0, x + PW / 2, top, x, top], '#4fc38a'); poly(c, [x + PW / 2, 0, x + PW, 0, x + PW, top, x + PW / 2, top], '#2f8f63');
      poly(c, [x - 4, top, x + PW + 4, top, x + PW / 2, top - 0.01], '#3fae78');
      poly(c, [x, bot, x + PW / 2, bot, x + PW / 2, FLOOR, x, FLOOR], '#4fc38a'); poly(c, [x + PW / 2, bot, x + PW, bot, x + PW, FLOOR, x + PW / 2, FLOOR], '#2f8f63');
      poly(c, [x - 4, bot, x + PW + 4, bot, x + PW / 2, bot - 14], '#7ae0ac');
      poly(c, [x - 4, top, x + PW + 4, top, x + PW / 2, top + 14], '#7ae0ac');
    }
    poly(c, [0, FLOOR, W, FLOOR, W, H, 0, H], '#2b2350'); poly(c, [0, FLOOR, W, FLOOR, W / 2, FLOOR + 22], '#3a2f69');
    c.save(); c.translate(100, s.y); c.rotate(clamp(s.vy / 700, -0.5, 0.8));
    poly(c, [-14, 0, 0, -13, 14, 0, 0, 13], '#ffd166'); poly(c, [-14, 0, 0, -13, 0, 0], '#ffe49a'); poly(c, [0, 0, 14, 0, 0, 13], '#e0a93a');
    poly(c, [14, -3, 24, 1, 14, 5], '#ff8c42'); poly(c, [-6, 0, -16, -10, -2, -3], '#f0b84a');
    c.fillStyle = '#1a1a1a'; c.fillRect(4, -6, 3, 3);
    c.restore();
  },
});
