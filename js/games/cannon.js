// Cannon. Drag toward where you want to shoot, release to fire (or W/S angle, A/D power, Space). Pop 5 balloons with 6 shots.
import { makeGame, W, H, poly, sky, makeHills, drawHills, rand, clamp } from '../core.js';
const CX = 50, CY = 520, GY = 560, G = 700, SHOTS = 6, GOAL = 5, COLS = [['#ff6b6b', '#c93f4a'], ['#ffd166', '#d4a03a'], ['#8be28f', '#4cb34f'], ['#c79bff', '#8f63c9'], ['#6bb8ff', '#3f86c9']];
const vel = (a, p) => [Math.cos(a) * p, Math.sin(a) * p];
export default makeGame({
  id: 'cannon', name: 'Cannon', caption: 'Pop 5 balloons with 6 shots.', duration: 45,
  how: 'Drag toward where you want to shoot (farther = stronger) and release to fire. Keys: W/S angle, A/D power, Space to fire. Pop 5 balloons with 6 shots.',
  init() {
    const b = []; for (let i = 0; i < GOAL; i++) b.push({ x: 150 + i * 36 + rand(-8, 8), y: rand(130, 440), ph: rand(0, 6), c: COLS[i], r: 22, hit: false });
    return { b, ang: -.8, pw: 560, shots: SHOTS, pr: null, fx: [], was: false, sp: false, end: 0, got: 0, hills: makeHills(6, 100, 140, 200, 60, 110) };
  },
  status: s => `Popped ${s.got}/${GOAL}   Shots ${s.shots}`,
  timeoutWin: s => s.got >= GOAL,
  update(g, s, dt) {
    const inp = g.input, k = inp.keys, ptr = inp.ptr; inp.consumeTap();
    for (const b of s.b) b.y += Math.sin(g.t * 1.5 + b.ph) * 14 * dt;
    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; f.l -= dt; } s.fx = s.fx.filter(f => f.l > 0);
    if (s.end) { s.end -= dt; if (s.end <= 0) return s.got >= GOAL ? g.win() : g.lose(); return; }
    let fire = false;
    if (ptr.down && !s.pr) { const dx = ptr.x - CX, dy = ptr.y - CY; s.ang = clamp(Math.atan2(dy, dx), -1.45, .05); s.pw = clamp(Math.hypot(dx, dy) * 3, 250, 900); s.aim = true; }
    else { if (s.aim && !ptr.down && s.was) fire = true; s.aim = false; if (k.has('w') || k.has('arrowup')) s.ang = clamp(s.ang - 1.1 * dt, -1.45, .05); if (k.has('s') || k.has('arrowdown')) s.ang = clamp(s.ang + 1.1 * dt, -1.45, .05); if (k.has('a') || k.has('arrowleft')) s.pw = clamp(s.pw - 320 * dt, 250, 900); if (k.has('d') || k.has('arrowright')) s.pw = clamp(s.pw + 320 * dt, 250, 900); }
    const sp = k.has(' '); if (sp && !s.sp) fire = true; s.sp = sp; s.was = ptr.down;
    if (fire && !s.pr && s.shots > 0) { const v = vel(s.ang, s.pw); s.pr = { x: CX, y: CY, vx: v[0], vy: v[1] }; s.shots--; }
    const p = s.pr; if (p) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += G * dt;
      for (const b of s.b) if (!b.hit && Math.hypot(p.x - b.x, p.y - b.y) < b.r + 8) { b.hit = true; s.got++; for (let i = 0; i < 14; i++) s.fx.push({ x: b.x, y: b.y, vx: rand(-160, 160), vy: rand(-200, 60), l: rand(.3, .7), c: b.c[0] }); }
      if (p.y > GY || p.x > W + 40) { s.pr = null; if (s.got >= GOAL || s.shots === 0) s.end = .9; }
    }
  },
  draw(g, s, c) {
    sky(c, '#8fd3ff', '#fff3d6'); drawHills(c, s.hills, GY, '#8fd08f', '#66b066'); poly(c, [0, GY, W, GY, W, H, 0, H], '#58a858'); poly(c, [0, GY, W, GY, W, GY + 14, 0, GY + 14], '#3f8a3f');
    for (const b of s.b) { if (b.hit) continue; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x, b.y + 22); c.lineTo(b.x, b.y + 50); c.stroke(); poly(c, [b.x, b.y - 26, b.x + 20, b.y - 10, b.x + 16, b.y + 14, b.x, b.y + 24, b.x, b.y - 26], b.c[0]); poly(c, [b.x, b.y - 26, b.x - 20, b.y - 10, b.x - 16, b.y + 14, b.x, b.y + 24], b.c[1]); poly(c, [b.x - 4, b.y - 18, b.x + 6, b.y - 14, b.x - 2, b.y - 6], 'rgba(255,255,255,.5)'); }
    if (!s.pr && s.shots > 0) { const v = vel(s.ang, s.pw); let x = CX, y = CY, vx = v[0], vy = v[1]; c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 26; i++) { x += vx * .035; y += vy * .035; vy += G * .035; if (y > GY) break; c.fillRect(x - 2, y - 2, 4, 4); } }
    c.save(); c.translate(CX, CY); c.rotate(s.ang); poly(c, [0, -9, 46, -7, 46, 7, 0, 9], '#555a6b'); poly(c, [0, -9, 46, -7, 46, 0, 0, 0], '#7b8196'); c.restore();
    poly(c, [CX - 22, GY, CX - 14, CY - 6, CX + 14, CY - 6, CX + 22, GY], '#8a5a2a'); poly(c, [CX - 22, GY, CX - 14, CY - 6, CX, CY - 6, CX, GY], '#6b4420'); poly(c, [CX - 12, CY - 14, CX, CY - 22, CX + 12, CY - 14, CX + 12, CY + 4, CX - 12, CY + 4], '#3a3f52');
    if (s.pr) { poly(c, [s.pr.x, s.pr.y - 7, s.pr.x + 7, s.pr.y, s.pr.x, s.pr.y + 7, s.pr.x - 7, s.pr.y], '#222'); }
    for (const f of s.fx) { c.globalAlpha = clamp(f.l * 3, 0, 1); poly(c, [f.x, f.y - 4, f.x + 4, f.y, f.x, f.y + 4, f.x - 4, f.y], f.c); } c.globalAlpha = 1;
  },
});
