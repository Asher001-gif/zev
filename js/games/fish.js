// Fishing. Drag / arrows to move the boat, HOLD to lower the hook, release to reel up. Catch 8 fish, avoid jellyfish (3 lives).
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const SY = 120, GOAL = 8, MAXD = 590;
const mk = (t, i) => ({ t, x: rand(30, W - 30), y: rand(220, 560), dir: Math.random() < .5 ? -1 : 1, sp: t === 'j' ? rand(20, 40) : rand(40, 90), c: ['#ff9f5a', '#6bd6ff', '#ffd166', '#c79bff'][i % 4], on: false });
export default makeGame({
  id: 'fish', name: 'Fishing', caption: 'Hold to dive, catch 8 fish.', duration: 45,
  how: 'Drag (or arrows) to move the boat. HOLD the screen (or Space) to lower the hook, release to reel it up. Bring up 8 fish in 45 seconds. Jellyfish zap you; you have 3 lives.',
  init() {
    const f = []; for (let i = 0; i < 8; i++) f.push(mk('f', i)); for (let i = 0; i < 3; i++) f.push(mk('j', i));
    return { f, bx: W / 2, hy: SY + 20, got: 0, lives: 3, inv: 0, fx: [], carry: [],
      bg: makeBg(x => { x.fillStyle = '#9fdcff'; x.fillRect(0, 0, W, SY); polyField(x, 0, SY, W, H - SY, 40, 205, 55, 36, 8); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 400, W, 240); polyField(x, 0, 590, W, 50, 30, 40, 40, 30, 8); }) };
  },
  status: s => `Fish ${s.got}/${GOAL}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const inp = g.input, k = inp.keys, ax = inp.axisX(); inp.consumeTap();
    const held = inp.ptr.down || k.has(' ') || k.has('arrowdown') || k.has('s');
    if (ax) s.bx += ax * 220 * dt; else if (inp.ptr.down) s.bx += clamp(inp.ptr.x - s.bx, -240 * dt, 240 * dt);
    s.bx = clamp(s.bx, 30, W - 30); s.inv = Math.max(0, s.inv - dt);
    const down = held && s.inv <= 0; s.hy = clamp(s.hy + (down ? 250 : -340) * dt, SY + 20, MAXD);
    for (const f of s.f) {
      if (f.on) { f.x = s.bx; f.y = s.hy + 8; continue; }
      f.x += f.dir * f.sp * dt; if (f.x < 20 || f.x > W - 20) f.dir = -f.dir; if (f.t === 'j') f.y += Math.sin(g.t * 2 + f.sp) * 18 * dt;
      if (f.t === 'f' && Math.hypot(f.x - s.bx, f.y - s.hy) < 20 && s.hy > SY + 40) f.on = true;
      else if (f.t === 'j' && s.inv <= 0 && Math.hypot(f.x - s.bx, f.y - s.hy) < 24) { s.inv = 1.2; s.hy = Math.max(SY + 20, s.hy - 120); s.lives--; for (const q of s.f) q.on = false; for (let i = 0; i < 10; i++) s.fx.push({ x: s.bx, y: s.hy, vx: rand(-120, 120), vy: rand(-120, 120), l: rand(.3, .6) }); if (s.lives <= 0) return g.lose(); }
    }
    if (s.hy <= SY + 24) for (const f of s.f) if (f.on) { f.on = false; s.got++; Object.assign(f, mk('f', s.got), { y: rand(280, 570) }); if (s.got >= GOAL) return g.win(); }
    for (const q of s.fx) { q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt; } s.fx = s.fx.filter(q => q.l > 0);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H); const bx = s.bx, bob = Math.sin(g.t * 3) * 2;
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, SY - 6); c.lineTo(bx, s.hy); c.stroke();
    for (const f of s.f) {
      const x = f.x, y = f.y, d = f.dir;
      if (f.t === 'j') { const w = 16 + Math.sin(g.t * 6 + f.sp) * 2; poly(c, [x - w, y, x, y - 16, x, y + 2], '#ff8ad8'); poly(c, [x, y - 16, x + w, y, x, y + 2], '#c75fb0'); c.strokeStyle = '#ff8ad8'; c.lineWidth = 2; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * 7, y + 2); c.lineTo(x + i * 7 + Math.sin(g.t * 5 + i) * 3, y + 20); c.stroke(); } }
      else { const tail = d > 0 ? -1 : 1; poly(c, [x + 18 * tail, y, x + 30 * tail, y - 9, x + 30 * tail, y + 9], f.c); poly(c, [x - 18, y, x, y - 11, x + 18, y], f.c); poly(c, [x - 18, y, x, y + 11, x + 18, y], 'rgba(0,0,0,.2)'); c.fillStyle = '#fff'; c.fillRect(x + 8 * -tail - 2, y - 4, 4, 4); }
    }
    c.fillStyle = '#c0c4d4'; c.fillRect(bx - 4, s.hy, 3, 8); c.fillRect(bx - 4, s.hy + 6, 9, 3);
    poly(c, [bx - 36, SY - 14 + bob, bx + 36, SY - 14 + bob, bx + 26, SY + 6 + bob, bx - 26, SY + 6 + bob], '#e8202a'); poly(c, [bx - 36, SY - 14 + bob, bx + 36, SY - 14 + bob, bx + 34, SY - 8 + bob, bx - 34, SY - 8 + bob], '#fff'); poly(c, [bx - 6, SY - 36 + bob, bx + 6, SY - 36 + bob, bx + 6, SY - 14 + bob, bx - 6, SY - 14 + bob], '#f6d6b0'); poly(c, [bx - 8, SY - 44 + bob, bx + 8, SY - 44 + bob, bx + 10, SY - 36 + bob, bx - 10, SY - 36 + bob], '#f2c14e');
    if (s.inv > 0) { c.fillStyle = 'rgba(255,255,100,.5)'; c.fillRect(bx - 6, s.hy - 6, 12, 18); }
    c.fillStyle = '#fff'; for (const q of s.fx) { c.globalAlpha = clamp(q.l * 3, 0, 1); c.fillRect(q.x, q.y, 4, 4); } c.globalAlpha = 1;
  },
});
