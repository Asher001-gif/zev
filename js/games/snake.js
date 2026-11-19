// Top-down snake. Arrows/WASD or drag toward where you want to go. Eat 12 apples in 40s.
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const C = 18, R = 29, CS = 20, OY = 60, GOAL = 12;
const D = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] };
function apple(s) { for (;;) { const a = { x: Math.floor(rand(0, C)), y: Math.floor(rand(0, R)) }; if (!s.body.some(b => b.x === a.x && b.y === a.y)) return a; } }
export default makeGame({
  id: 'snake', name: 'Snake', caption: 'Eat 12 apples. Don\u2019t hit walls or yourself.', duration: 40,
  how: 'Arrow keys / WASD, or drag toward where you want to go. Eat 12 apples in 40 seconds. Hitting a wall or yourself ends the game.',
  init() {
    const s = { body: [{ x: 6, y: 14 }, { x: 5, y: 14 }, { x: 4, y: 14 }], dir: D.r, want: D.r, tick: 0, got: 0, grow: 0, fx: [],
      bg: makeBg(x => { polyField(x, 0, 0, W, OY, 20, 150, 20, 14, 4); for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) { x.fillStyle = (i + j) % 2 ? '#3f8f4a' : '#4aa056'; x.fillRect(i * CS, OY + j * CS, CS, CS); } }) };
    s.ap = apple(s); return s;
  },
  status: s => `Apples ${s.got}/${GOAL}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const k = g.input.keys, ptr = g.input.ptr, h = s.body[0];
    let w = null;
    if (k.has('arrowleft') || k.has('a')) w = D.l; else if (k.has('arrowright') || k.has('d')) w = D.r; else if (k.has('arrowup') || k.has('w')) w = D.u; else if (k.has('arrowdown') || k.has('s')) w = D.d;
    else if (ptr.down) { const dx = ptr.x - (h.x * CS + CS / 2), dy = ptr.y - (OY + h.y * CS + CS / 2); if (Math.max(Math.abs(dx), Math.abs(dy)) > 14) w = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? D.l : D.r) : (dy < 0 ? D.u : D.d); }
    if (w && !(w[0] === -s.dir[0] && w[1] === -s.dir[1])) s.want = w;
    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.l -= dt; } s.fx = s.fx.filter(f => f.l > 0);
    s.tick += dt; if (s.tick < .13) return; s.tick = 0;
    s.dir = s.want; const nx = h.x + s.dir[0], ny = h.y + s.dir[1];
    if (nx < 0 || ny < 0 || nx >= C || ny >= R || s.body.some((b, i) => i < s.body.length - (s.grow > 0 ? 0 : 1) && b.x === nx && b.y === ny)) return g.lose();
    s.body.unshift({ x: nx, y: ny });
    if (nx === s.ap.x && ny === s.ap.y) {
      s.grow += 2; for (let i = 0; i < 10; i++) s.fx.push({ x: nx * CS + 10, y: OY + ny * CS + 10, vx: rand(-110, 110), vy: rand(-110, 110), l: rand(.3, .6) });
      if (++s.got >= GOAL) return g.win(); s.ap = apple(s);
    }
    if (s.grow > 0) s.grow--; else s.body.pop();
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    const a = s.ap, ax = a.x * CS + 10, ay = OY + a.y * CS + 10, q = 6, bob = Math.sin(g.t * 6) * 1.5;
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(ax - 7, ay + 6, 14, 3);
    poly(c, [ax, ay - 9 + bob, ax + q, ay - 5 + bob, ax + 9, ay + bob, ax + q, ay + 6 + bob, ax, ay + 8 + bob, ax, ay - 9 + bob], '#ff5d5d'); poly(c, [ax, ay - 9 + bob, ax - q, ay - 5 + bob, ax - 9, ay + bob, ax - q, ay + 6 + bob, ax, ay + 8 + bob], '#c93f4a');
    poly(c, [ax, ay - 9 + bob, ax + 4, ay - 14 + bob, ax + 8, ay - 10 + bob], '#7ee08a');
    for (let i = s.body.length - 1; i >= 0; i--) {
      const b = s.body[i], x = b.x * CS, y = OY + b.y * CS, t = i % 2;
      poly(c, [x + 1, y + 1, x + CS - 1, y + 1, x + CS - 1, y + CS / 2, x + 1, y + CS / 2], t ? '#ffd166' : '#ffb347'); poly(c, [x + 1, y + CS / 2, x + CS - 1, y + CS / 2, x + CS - 1, y + CS - 1, x + 1, y + CS - 1], t ? '#d4a03a' : '#d4801a');
      if (i === 0) { const d = s.dir; c.fillStyle = '#fff'; const ex = d[0] ? 11 * d[0] : 0, ey = d[1] ? 11 * d[1] : 0; c.fillRect(x + 10 + ex - 3 - (d[1] ? 5 : 0), y + 10 + ey - 3 - (d[0] ? 5 : 0), 5, 5); c.fillRect(x + 10 + ex - 3 + (d[1] ? 5 : 0), y + 10 + ey - 3 + (d[0] ? 5 : 0), 5, 5); }
    }
    c.fillStyle = '#fff'; for (const f of s.fx) { c.globalAlpha = clamp(f.l * 3, 0, 1); c.fillRect(f.x, f.y, 4, 4); } c.globalAlpha = 1;
  },
});
