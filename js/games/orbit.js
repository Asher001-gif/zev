// Orbit. Tap / Space reverses direction. Grab 10 stars, avoid the red blocks.
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const CX = W / 2, CY = 340, RR = 115, GOAL = 10, TAU = Math.PI * 2;
const dif = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };
const pt = (a, r) => [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
export default makeGame({
  id: 'orbit', name: 'Orbit', caption: 'Tap to reverse. Grab 10 stars.', duration: 40,
  how: 'Your orb circles the ring. Tap (or press Space) to reverse direction. Collect 10 stars in 40 seconds and avoid the red blocks.',
  init() {
    return { a: 0, dir: 1, sp: 2.1, coin: rand(1, 5), got: 0, bl: [], next: 1.5, trail: [], fx: [],
      bg: makeBg(x => { polyField(x, 0, 0, W, H, 40, 250, 30, 14, 6); x.lineWidth = 34; x.strokeStyle = '#2b2a55'; x.beginPath(); x.arc(CX, CY, RR, 0, TAU); x.stroke(); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.18)'; for (const d of [-17, 17]) { x.beginPath(); x.arc(CX, CY, RR + d, 0, TAU); x.stroke(); } }) };
  },
  status: s => `Stars ${s.got}/${GOAL}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    if (g.input.consumeTap()) s.dir = -s.dir;
    s.sp = 2.1 + g.t * .02; s.a += s.dir * s.sp * dt;
    const p = pt(s.a, RR); s.trail.push({ x: p[0], y: p[1], l: .3 }); for (const t of s.trail) t.l -= dt; s.trail = s.trail.filter(t => t.l > 0);
    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.l -= dt; } s.fx = s.fx.filter(f => f.l > 0);
    s.next -= dt; if (s.next <= 0) { s.next = rand(1.6, 2.4); let a; for (let n = 0; n < 8; n++) { a = rand(0, TAU); if (dif(a, s.a) > 1.2 && dif(a, s.coin) > .4) break; } s.bl.push({ a, life: 0, w: .2 }); }
    for (const b of s.bl) { b.life += dt; if (b.life > .9 && dif(b.a, s.a) < b.w + .07) return g.lose(); }
    s.bl = s.bl.filter(b => b.life < 7);
    if (dif(s.coin, s.a) < .17) { const q = pt(s.coin, RR); for (let i = 0; i < 10; i++) s.fx.push({ x: q[0], y: q[1], vx: rand(-120, 120), vy: rand(-120, 120), l: rand(.3, .6) }); if (++s.got >= GOAL) return g.win(); do { s.coin = rand(0, TAU); } while (dif(s.coin, s.a) < 1 || s.bl.some(b => dif(b.a, s.coin) < .4)); }
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const b of s.bl) { const on = b.life > .9, a0 = b.a - b.w, a1 = b.a + b.w; c.globalAlpha = on ? 1 : (Math.floor(b.life * 10) % 2 ? .5 : .15); const P = [pt(a0, RR - 17), pt(a1, RR - 17), pt(a1, RR + 17), pt(a0, RR + 17)]; poly(c, [P[0][0], P[0][1], P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]], '#e8202a'); const m = pt(b.a, RR); poly(c, [P[0][0], P[0][1], m[0], m[1], P[3][0], P[3][1]], '#a8141c'); } c.globalAlpha = 1;
    const q = pt(s.coin, RR), sp = 10 + Math.sin(g.t * 6) * 2; poly(c, [q[0], q[1] - sp, q[0] + sp * .35, q[1] - sp * .35, q[0] + sp, q[1], q[0] + sp * .35, q[1] + sp * .35, q[0], q[1] + sp, q[0] - sp * .35, q[1] + sp * .35, q[0] - sp, q[1], q[0] - sp * .35, q[1] - sp * .35], '#ffd166');
    for (const t of s.trail) { c.globalAlpha = t.l * 2; poly(c, [t.x, t.y - 5, t.x + 5, t.y, t.x, t.y + 5, t.x - 5, t.y], '#7ff0e0'); } c.globalAlpha = 1;
    const p = pt(s.a, RR); poly(c, [p[0], p[1] - 10, p[0] + 10, p[1], p[0], p[1] + 10], '#9ff8ec'); poly(c, [p[0], p[1] - 10, p[0] - 10, p[1], p[0], p[1] + 10], '#39c5b3');
    c.fillStyle = '#ffd166'; for (const f of s.fx) { c.globalAlpha = clamp(f.l * 3, 0, 1); c.fillRect(f.x, f.y, 4, 4); } c.globalAlpha = 1;
  },
});
