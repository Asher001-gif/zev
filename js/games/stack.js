// Side-view tower stacker. Tap / Space to drop the sliding block. Stack 12 blocks in 40s.
import { makeGame, W, H, poly, sky, rand } from '../core.js';
const BH = 30, BASE = 580, TARGET = 12, D = 8;
const col = i => { const h = (200 + i * 22) % 360; return [`hsl(${h} 65% 66%)`, `hsl(${h} 60% 52%)`, `hsl(${h} 55% 38%)`]; };
function block(c, x, y, w, i) {
  const [top, front, side] = col(i);
  poly(c, [x, y, x + w, y, x + w + D, y - D, x + D, y - D], top);
  poly(c, [x, y, x + w, y, x + w, y + BH, x, y + BH], front);
  poly(c, [x + w, y, x + w + D, y - D, x + w + D, y + BH - D, x + w, y + BH], side);
}

export default makeGame({
  id: 'stack', name: 'Stack', caption: 'Tap to drop the block. Stack 12 high.', duration: 40,
  how: 'Tap the screen (or press Space) to drop the sliding block. Only the part that lands on the tower stays. Stack 12 blocks before time runs out.',
  init() {
    return { stack: [{ x: W / 2 - 80, w: 160 }], cur: { x: 0, w: 160, dir: 1 }, n: 0, cam: 0, debris: [], started: false };
  },
  status: s => `Blocks ${s.n}/${TARGET}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    if (!s.started) { s.started = true; while (g.input.consumeTap()); }
    const c = s.cur, speed = 150 + s.n * 16;
    c.x += c.dir * speed * dt;
    if (c.x < 0) { c.x = 0; c.dir = 1; }
    if (c.x + c.w > W) { c.x = W - c.w; c.dir = -1; }
    s.cam += (Math.max(0, (s.stack.length - 6) * BH) - s.cam) * Math.min(1, dt * 6);
    for (const d of s.debris) { d.vy += 1300 * dt; d.y += d.vy * dt; }
    s.debris = s.debris.filter(d => d.y + s.cam < H + 60);
    if (!g.input.consumeTap()) return;
    const top = s.stack[s.stack.length - 1], wy = BASE - s.stack.length * BH;
    const l = Math.max(c.x, top.x), r = Math.min(c.x + c.w, top.x + top.w), ov = r - l;
    if (ov < 3) return g.lose();
    let nb;
    if (Math.abs(c.x - top.x) < 5) nb = { x: top.x, w: top.w };
    else {
      nb = { x: l, w: ov };
      if (c.x < top.x) s.debris.push({ x: c.x, w: top.x - c.x, y: wy, vy: 0, i: s.stack.length });
      if (c.x + c.w > top.x + top.w) s.debris.push({ x: top.x + top.w, w: c.x + c.w - (top.x + top.w), y: wy, vy: 0, i: s.stack.length });
    }
    s.stack.push(nb); s.n++;
    if (s.n >= TARGET) return g.win();
    const left = Math.random() < 0.5;
    s.cur = { x: left ? 0 : W - nb.w, w: nb.w, dir: left ? 1 : -1 };
  },
  draw(g, s, c) {
    sky(c, '#1b2a49', '#e0796b');
    poly(c, [0, 470, 90, 380, 180, 470], '#2e3f66'); poly(c, [140, 470, 250, 360, 360, 470], '#26365a');
    for (let i = 0; i < 14; i++) { const x = (i * 97) % W, y = (i * 53) % 260; poly(c, [x, y, x + 3, y + 3, x, y + 6, x - 3, y + 3], 'rgba(255,255,255,.55)'); }
    c.fillStyle = '#16213a'; c.fillRect(0, BASE + BH + s.cam, W, H);
    s.stack.forEach((b, i) => block(c, b.x, BASE - i * BH + s.cam, b.w, i));
    for (const d of s.debris) block(c, d.x, d.y + s.cam, d.w, d.i);
    const cu = s.cur; block(c, cu.x, BASE - s.stack.length * BH + s.cam, cu.w, s.stack.length);
  },
});
