// Vertical jumper. Steer left/right (drag, arrows, A/D); you bounce on platforms. Climb 300m in 40s.
import { makeGame, W, H, poly, sky, makeHills, rand, clamp, hash } from '../core.js';
const GOAL = 3000;
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = c => 'rgb(' + c.join(',') + ')';
function plat(s, y) { const mv = s.h > 600 && Math.random() < .3; return { x: rand(10, W - 80), y, w: 70, mv, dx: mv ? rand(40, 80) * (Math.random() < .5 ? -1 : 1) : 0 }; }
export default makeGame({
  id: 'climb', name: 'Climb', caption: 'Bounce up the sky. Reach 300m.', duration: 40,
  how: 'Drag left/right (or use arrows / A and D) to steer. You bounce automatically on platforms. Reach 300m in 40 seconds and don\u2019t fall.',
  init() {
    const s = { p: { x: W / 2, y: 520, vy: -620, face: 1 }, pl: [{ x: W / 2 - 35, y: 580, w: 70, mv: false, dx: 0 }], h: 0, cl: Array.from({ length: 6 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H, s: .6 + hash(i, 3) })) };
    let y = 580; while (y > -60) { y -= rand(62, 100); s.pl.push(plat(s, y)); } return s;
  },
  status: s => `${Math.floor(s.h / 10)}m / ${GOAL / 10}m`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const p = s.p, inp = g.input, ax = inp.axisX();
    if (ax) { p.x += ax * 300 * dt; p.face = ax; } else if (inp.ptr.down) { const d = inp.ptr.x - p.x; if (Math.abs(d) > 4) { p.x += clamp(d, -320 * dt, 320 * dt); p.face = d > 0 ? 1 : -1; } }
    if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
    const oy = p.y; p.vy += 1400 * dt; p.y += p.vy * dt;
    for (const q of s.pl) { if (q.mv) { q.x += q.dx * dt; if (q.x < 0 || q.x + q.w > W) q.dx = -q.dx; }
      if (p.vy > 0 && oy + 16 <= q.y + 2 && p.y + 16 >= q.y && p.x > q.x - 8 && p.x < q.x + q.w + 8) { p.vy = -620; s.sq = .15; } }
    if (p.y < 250) { const d = 250 - p.y; p.y = 250; s.h += d; for (const q of s.pl) q.y += d; for (const c of s.cl) { c.y += d * .3 * c.s; if (c.y > H + 40) { c.y = -40; c.x = rand(0, W); } } }
    s.sq = Math.max(0, (s.sq || 0) - dt);
    let top = Math.min.apply(null, s.pl.map(q => q.y)); while (top > -40) { top -= rand(62, 100 + Math.min(s.h / 80, 30)); s.pl.push(plat(s, top)); }
    s.pl = s.pl.filter(q => q.y < H + 30);
    if (s.h >= GOAL) return g.win(); if (p.y > H + 30) return g.lose();
  },
  draw(g, s, c) {
    const t = clamp(s.h / GOAL, 0, 1);
    sky(c, rgb(mix([120, 190, 255], [10, 10, 40], t)), rgb(mix([210, 235, 255], [60, 40, 110], t)));
    if (t > .4) { c.fillStyle = '#fff'; c.globalAlpha = (t - .4); for (let i = 0; i < 30; i++) c.fillRect(hash(i, 8) * W, hash(i, 9) * H, 2, 2); c.globalAlpha = 1; }
    for (const k of s.cl) { const w = 50 * k.s; c.globalAlpha = .6 * (1 - t * .7); poly(c, [k.x, k.y, k.x + w / 2, k.y - 18 * k.s, k.x + w, k.y], '#fff'); poly(c, [k.x + w * .3, k.y, k.x + w * .8, k.y - 22 * k.s, k.x + w * 1.4, k.y], '#e8f1ff'); } c.globalAlpha = 1;
    for (const q of s.pl) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(q.x + 3, q.y + 6, q.w, 8); poly(c, [q.x, q.y, q.x + q.w, q.y, q.x + q.w, q.y + 7, q.x, q.y + 7], q.mv ? '#6bb8ff' : '#8be28f'); poly(c, [q.x, q.y + 7, q.x + q.w, q.y + 7, q.x + q.w - 6, q.y + 14, q.x + 6, q.y + 14], q.mv ? '#3f86c9' : '#4cb34f'); }
    const p = s.p, sq = s.sq > 0 ? 1.2 : 1, w = 16 / sq * 1, h = 18 * sq;
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(p.x, p.y + 17, 12, 4, 0, 0, 7); c.fill();
    poly(c, [p.x, p.y - h, p.x + w, p.y - h / 3, p.x + w * .8, p.y + 14, p.x, p.y + 14], '#ffd166'); poly(c, [p.x, p.y - h, p.x - w, p.y - h / 3, p.x - w * .8, p.y + 14, p.x, p.y + 14], '#e5a93a');
    poly(c, [p.x - 8, p.y + 14, p.x - 3, p.y + 14, p.x - 6, p.y + 20], '#c93f4a'); poly(c, [p.x + 3, p.y + 14, p.x + 8, p.y + 14, p.x + 6, p.y + 20], '#c93f4a');
    c.fillStyle = '#fff'; c.fillRect(p.x - 8 + p.face * 3, p.y - 8, 6, 7); c.fillRect(p.x + 2 + p.face * 3, p.y - 8, 6, 7); c.fillStyle = '#111'; c.fillRect(p.x - 6 + p.face * 5, p.y - 6, 3, 4); c.fillRect(p.x + 4 + p.face * 5, p.y - 6, 3, 4);
  },
});
