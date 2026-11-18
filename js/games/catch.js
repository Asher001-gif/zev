// Side-view catcher. Drag / A-D to move the basket. Catch 15 gems in 40s, dodge bombs.
import { makeGame, W, H, poly, sky, polyField, makeBg, makeHills, moveHills, drawHills, rand, clamp } from '../core.js';
const BY = 560, BW = 76, TARGET = 15;

export default makeGame({
  id: 'catch', how: 'Drag (or A / D, arrows) to slide the basket. Catch 15 gems before time runs out. Don’t catch bombs!', name: 'Catch', caption: 'Slide the basket. Catch 15 gems, dodge bombs.', duration: 40,
  init() {
    return {
      bx: W / 2, items: [], next: 0.4, got: 0, hills: makeHills(7, 110, 130, 190, 90, 150),
      ground: makeBg(x => polyField(x, 0, BY + 14, W, H - BY - 14, 40, 150, 35, 22, 8, 5)),
    };
  },
  status: s => `Gems ${s.got}/${TARGET}`,
  timeoutWin: s => s.got >= TARGET,
  update(g, s, dt) {
    moveHills(s.hills, 8 * dt);
    const inp = g.input;
    if (inp.ptr.down) s.bx += (inp.ptr.x - s.bx) * Math.min(1, dt * 18); else s.bx += inp.axisX() * 400 * dt;
    s.bx = clamp(s.bx, BW / 2, W - BW / 2);
    s.next -= dt;
    if (s.next <= 0) { s.next = 0.6; s.items.push({ x: rand(24, W - 24), y: -20, vy: rand(170, 250), bomb: Math.random() < 0.25, rot: 0 }); }
    for (const it of s.items) {
      it.y += it.vy * dt; it.rot += dt * 3;
      if (!it.done && it.y > BY - 14 && it.y < BY + 16 && Math.abs(it.x - s.bx) < BW / 2 + 2) {
        it.done = true;
        if (it.bomb) return g.lose();
        if (++s.got >= TARGET) return g.win();
      }
    }
    s.items = s.items.filter(it => !it.done && it.y < H + 30);
  },
  draw(g, s, c) {
    sky(c, '#14163a', '#5a3d7a');
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 24; i++) c.fillRect((i * 97) % W, (i * 53) % 300, 2, 2);
    drawHills(c, s.hills, BY + 14, '#3a3070', '#2b2458');
    c.drawImage(s.ground, 0, 0, W, H);
    for (const it of s.items) {
      c.save(); c.translate(it.x, it.y);
      if (it.bomb) {
        c.rotate(it.rot * 0.3);
        poly(c, [-6, -12, 6, -12, 12, -6, 12, 6, 6, 12, -6, 12, -12, 6, -12, -6], '#2e2e3a'); poly(c, [-6, -12, 6, -12, 0, 0], '#4a4a5c'); poly(c, [0, 0, 12, 6, 6, 12], '#1c1c26');
        poly(c, [-2, -12, 2, -12, 0, -20], '#ff5d5d');
      } else {
        poly(c, [0, -13, 10, 0, 0, 0], '#8ff3ff'); poly(c, [0, -13, -10, 0, 0, 0], '#5ed6ee'); poly(c, [10, 0, 0, 13, 0, 0], '#2fa9c4'); poly(c, [-10, 0, 0, 13, 0, 0], '#45c1dc');
      }
      c.restore();
    }
    const x = s.bx;
    poly(c, [x - BW / 2, BY - 14, x + BW / 2, BY - 14, x + BW / 2 - 10, BY + 16, x - BW / 2 + 10, BY + 16], '#c98b4a');
    poly(c, [x - BW / 2, BY - 14, x, BY - 14, x, BY + 16, x - BW / 2 + 10, BY + 16], '#e0a560');
    poly(c, [x - BW / 2 - 3, BY - 18, x + BW / 2 + 3, BY - 18, x + BW / 2, BY - 12, x - BW / 2, BY - 12], '#8a5a2b');
  },
});
