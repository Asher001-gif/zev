// Tap-to-pop. Tap / click (or Space at the cursor) on balloons. Pop 15 in 30s, let at most 3 escape.
import { makeGame, W, H, poly, sky, makeBg, rand } from '../core.js';
const TARGET = 15, MAXMISS = 4;
const HUES = [350, 40, 200, 140, 280, 20];

export default makeGame({
  id: 'pop', name: 'Pop', caption: 'Pop 15 balloons. Don’t let 4 escape.', duration: 30,
  how: 'Tap a balloon (or move the mouse and press Space) to pop it. Pop 15 balloons before 4 float away.',
  init() {
    return {
      b: [], bits: [], next: 0.2, popped: 0, esc: 0,
      bg: makeBg(x => {
        sky(x, '#6fb7ff', '#dff3ff');
        for (const [cx, cy, s] of [[70, 130, 1], [260, 230, 1.3], [120, 420, 0.9]]) {
          poly(x, [cx - 50 * s, cy + 14, cx - 20 * s, cy - 18 * s, cx + 10 * s, cy + 14], 'rgba(255,255,255,.8)');
          poly(x, [cx - 10 * s, cy + 14, cx + 20 * s, cy - 26 * s, cx + 55 * s, cy + 14], 'rgba(255,255,255,.95)');
        }
      }),
    };
  },
  status: s => `Popped ${s.popped}/${TARGET}   Missed ${s.esc}/${MAXMISS}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    s.next -= dt;
    if (s.next <= 0) {
      s.b.push({ x0: rand(40, W - 40), x: 0, y: H + 40, r: rand(24, 32), vy: rand(80, 120) + g.t * 2.5, ph: rand(0, 6.28), hue: HUES[Math.floor(rand(0, HUES.length))] });
      s.next = rand(0.45, 0.8) * (1 - g.t / 90);
    }
    for (const o of s.b) { o.y -= o.vy * dt; o.x = o.x0 + Math.sin(g.t * 2 + o.ph) * 14; }
    for (const o of s.b) if (o.y < -60) { s.esc++; o.dead = true; }
    if (s.esc >= MAXMISS) return g.lose();
    const p = g.input.ptr;
    while (g.input.consumeTap()) {
      let best = null, bd = 1e9;
      for (const o of s.b) { if (o.dead) continue; const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < o.r + 14 && d < bd) { bd = d; best = o; } }
      if (!best) continue;
      best.dead = true; s.popped++;
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + rand(0, 0.5); s.bits.push({ x: best.x, y: best.y, vx: Math.cos(a) * rand(90, 190), vy: Math.sin(a) * rand(90, 190), life: 0.5, hue: best.hue }); }
      if (s.popped >= TARGET) return g.win();
    }
    s.b = s.b.filter(o => !o.dead);
    for (const k of s.bits) { k.x += k.vx * dt; k.y += k.vy * dt; k.vy += 400 * dt; k.life -= dt; }
    s.bits = s.bits.filter(k => k.life > 0);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const o of s.b) {
      const rx = o.r, ry = o.r * 1.2, n = 6;
      c.strokeStyle = 'rgba(60,60,80,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(o.x, o.y + ry + 8); c.lineTo(o.x + Math.sin(g.t * 5 + o.ph) * 5, o.y + ry + 40); c.stroke();
      for (let k = 0; k < n; k++) {
        const a1 = k / n * 6.2832 - 1.5708, a2 = (k + 1) / n * 6.2832 - 1.5708;
        poly(c, [o.x, o.y, o.x + Math.cos(a1) * rx, o.y + Math.sin(a1) * ry, o.x + Math.cos(a2) * rx, o.y + Math.sin(a2) * ry], `hsl(${o.hue} 75% ${k % 2 ? 50 : 62}%)`);
      }
      poly(c, [o.x - 5, o.y + ry + 8, o.x + 5, o.y + ry + 8, o.x, o.y + ry - 1], `hsl(${o.hue} 70% 40%)`);
    }
    for (const k of s.bits) poly(c, [k.x, k.y - 5, k.x + 5, k.y + 4, k.x - 5, k.y + 4], `hsl(${k.hue} 75% 55%)`);
    const p = g.input.ptr; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 14, 0, 6.2832); c.stroke();
  },
});
