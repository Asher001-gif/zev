// Top-down shooter. Auto-fires. Drag / WASD to move. Survive 35s with 3 lives.
import { makeGame, W, H, poly, makeBg, polyField, steer, rand, clamp } from '../core.js';

export default makeGame({
  id: 'blaster', how: 'Drag (or WASD / arrows) to move. Your ship fires by itself. You have 3 lives. Survive 35 seconds.', name: 'Blaster', caption: 'Drag to move, your ship fires itself. Survive 35s.', duration: 35,
  init() {
    return {
      p: { x: W / 2, y: 540 }, b: [], e: [], parts: [], fire: 0.2, next: 0.5, lives: 3, kills: 0, inv: 0, off: 0,
      stars: Array.from({ length: 45 }, () => ({ x: rand(0, W), y: rand(0, H), s: rand(0.5, 2) })),
      bg: makeBg(x => polyField(x, 0, 0, W, H, 60, 245, 40, 12, 5, 7)),
    };
  },
  status: s => `Lives ${'♥'.repeat(s.lives)}   Kills ${s.kills}`,
  update(g, s, dt) {
    const p = s.p; steer(p, 230, dt, g.input);
    p.x = clamp(p.x, 20, W - 20); p.y = clamp(p.y, 380, 610);
    for (const st of s.stars) { st.y += st.s * 50 * dt; if (st.y > H) { st.y = 0; st.x = rand(0, W); } }
    s.fire -= dt; if (s.fire <= 0) { s.b.push({ x: p.x, y: p.y - 18 }); s.fire = 0.2; }
    for (const b of s.b) b.y -= 520 * dt;
    s.b = s.b.filter(b => b.y > -10);
    s.next -= dt;
    if (s.next <= 0) {
      s.next = Math.max(0.35, 0.8 - g.t * 0.012);
      s.e.push({ x: rand(24, W - 24), y: -24, vx: rand(-30, 30), vy: rand(60, 100) + g.t * 1.5, hp: g.t > 12 && Math.random() < 0.3 ? 2 : 1, r: 16 });
    }
    s.inv -= dt;
    for (const e of s.e) {
      e.x += e.vx * dt; e.y += e.vy * dt;
      for (const b of s.b) if (b.y > -50 && Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4) { e.hp--; b.y = -100; if (e.hp <= 0) { e.dead = true; s.kills++; for (let i = 0; i < 6; i++) s.parts.push({ x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90), l: 0.4 }); } }
      if (!e.dead && s.inv <= 0 && Math.hypot(e.x - p.x, e.y - p.y) < e.r + 11) { e.dead = true; s.lives--; s.inv = 1.2; if (s.lives <= 0) return g.lose(); }
    }
    s.e = s.e.filter(e => !e.dead && e.y < H + 30);
    for (const q of s.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt; }
    s.parts = s.parts.filter(q => q.l > 0);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.6)'; for (const st of s.stars) c.fillRect(st.x, st.y, st.s, st.s);
    for (const b of s.b) poly(c, [b.x - 2, b.y + 6, b.x, b.y - 8, b.x + 2, b.y + 6], '#ffe27a');
    for (const e of s.e) {
      const col = e.hp > 1 ? ['#c77dff', '#9d4edd', '#7b2cbf'] : ['#ff7b9c', '#d94f70', '#a53556'];
      poly(c, [e.x, e.y - 16, e.x + 16, e.y, e.x, e.y], col[0]); poly(c, [e.x, e.y - 16, e.x - 16, e.y, e.x, e.y], col[1]);
      poly(c, [e.x + 16, e.y, e.x, e.y + 16, e.x, e.y], col[2]); poly(c, [e.x - 16, e.y, e.x, e.y + 16, e.x, e.y], col[1]);
    }
    for (const q of s.parts) { c.globalAlpha = clamp(q.l * 2.5, 0, 1); poly(c, [q.x, q.y - 4, q.x + 4, q.y + 3, q.x - 4, q.y + 3], '#ffd166'); c.globalAlpha = 1; }
    const p = s.p;
    if (s.inv <= 0 || Math.floor(s.inv * 12) % 2) {
      poly(c, [p.x, p.y - 20, p.x + 16, p.y + 14, p.x, p.y + 6], '#7ff0e0'); poly(c, [p.x, p.y - 20, p.x - 16, p.y + 14, p.x, p.y + 6], '#4fc9bb');
      poly(c, [p.x - 5, p.y + 8, p.x + 5, p.y + 8, p.x, p.y + 18 + Math.random() * 4], '#ff9f43');
    }
  },
});
