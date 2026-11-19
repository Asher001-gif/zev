// Swipe to slice fruit, avoid bombs. Drag / arrows to slice. Slice 15 in 35s, 3 lives.
import { makeGame, W, H, poly, polyField, makeBg, rand, clamp } from '../core.js';
const GOAL = 15, KINDS = [['#ff5d5d', '#c93f4a', '#7ee08a'], ['#ffb347', '#d4801a', '#7ee08a'], ['#9be15d', '#5aa83a', '#2f8a3a'], ['#c06bff', '#8f3fc9', '#7ee08a']];
function seg(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy; let t = l ? ((px - x1) * dx + (py - y1) * dy) / l : 0; t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
function ball(c, f, half) {
  const r = f.r, q = r * .7; c.save(); c.translate(f.x, f.y); c.rotate(f.a);
  if (half) { c.beginPath(); if (half < 0) c.rect(-r - 4, -r - 4, r + 4, 2 * r + 8); else c.rect(0, -r - 4, r + 4, 2 * r + 8); c.clip(); c.translate(half * f.sep, 0); }
  const oct = [0, -r, q, -q, r, 0, q, q, 0, r, -q, q, -r, 0, -q, -q];
  if (f.bomb) {
    poly(c, oct, '#2a2a35'); poly(c, [0, -r, -q, -q, -r, 0, -q, q, 0, r], '#15151c');
    poly(c, [0, -r, 4, -r - 10, 8, -r - 6], '#8a7a5a'); c.fillStyle = Math.random() < .5 ? '#ffd166' : '#ff7a3a'; c.fillRect(5, -r - 14, 5, 5);
  } else {
    const k = f.k; poly(c, oct, k[0]); poly(c, [0, -r, -q, -q, -r, 0, -q, q, 0, r], k[1]);
    poly(c, [q * .2, -q, q, -q * .6, q * .5, -q * .1], 'rgba(255,255,255,.45)'); poly(c, [0, -r, 6, -r - 9, 11, -r + 2], k[2]);
  }
  if (half) { c.fillStyle = '#fff1c4'; c.fillRect(-2, -r, 4, 2 * r); }
  c.restore();
}
export default makeGame({
  id: 'slice', name: 'Slice', caption: 'Swipe to slice 15 fruits. Skip the bombs.', duration: 35,
  how: 'Drag across fruit to slice it (or use arrow keys / WASD to move the blade). Slice 15 fruits in 35 seconds. Bombs cost a life; you have 3.',
  init() {
    return {
      f: [], h: [], fx: [], trail: [], cur: { x: W / 2, y: H / 2 }, prev: null, was: false, lives: 3, got: 0, next: .3, flash: 0,
      bg: makeBg(x => { polyField(x, 0, 0, W, H, 40, 275, 28, 17, 7); const g = x.createRadialGradient(W / 2, H / 2, 150, W / 2, H / 2, 430); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }),
    };
  },
  status: s => `Sliced ${s.got}/${GOAL}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const inp = g.input, ax = inp.axisX(), ay = inp.axisY(), cur = s.cur;
    let active = false;
    if (inp.ptr.down) { cur.x = inp.ptr.x; cur.y = inp.ptr.y; active = true; }
    else if (ax || ay) { cur.x = clamp(cur.x + ax * 380 * dt, 0, W); cur.y = clamp(cur.y + ay * 380 * dt, 0, H); active = true; }
    const prev = s.was && s.prev ? s.prev : { x: cur.x, y: cur.y };
    if (active) { s.trail.push({ x: cur.x, y: cur.y, l: .2 }); s.prev = { x: cur.x, y: cur.y }; }
    s.was = active; s.flash = Math.max(0, s.flash - dt);
    for (const t of s.trail) t.l -= dt; s.trail = s.trail.filter(t => t.l > 0);
    s.next -= dt;
    if (s.next <= 0) {
      const n = 1 + Math.floor(rand(0, 3)); s.next = rand(.7, 1.1);
      for (let i = 0; i < n; i++) { const x = rand(50, W - 50), bomb = Math.random() < .2; s.f.push({ x, y: H + 30, vx: (W / 2 - x) * rand(.1, .35), vy: rand(-780, -650), r: bomb ? 22 : rand(24, 30), a: 0, w: rand(-4, 4), bomb, k: KINDS[Math.floor(rand(0, KINDS.length))], sep: 0 }); }
    }
    for (const f of s.f) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 700 * dt; f.a += f.w * dt; }
    for (const f of s.f.slice()) {
      if (active && Math.hypot(cur.x - prev.x, cur.y - prev.y) > 2 && seg(prev.x, prev.y, cur.x, cur.y, f.x, f.y) < f.r + 8) {
        s.f.splice(s.f.indexOf(f), 1);
        if (f.bomb) {
          s.flash = .35; for (let i = 0; i < 14; i++) s.fx.push({ x: f.x, y: f.y, vx: rand(-220, 220), vy: rand(-220, 220), l: rand(.3, .7), col: i % 2 ? '#ff7a3a' : '#ffd166' });
          if (--s.lives <= 0) return g.lose();
        } else {
          s.h.push({ x: f.x, y: f.y, vx: f.vx - 90, vy: f.vy, r: f.r, a: f.a, w: -3, half: -1, k: f.k, sep: 0 }, { x: f.x, y: f.y, vx: f.vx + 90, vy: f.vy, r: f.r, a: f.a, w: 3, half: 1, k: f.k, sep: 0 });
          for (let i = 0; i < 6; i++) s.fx.push({ x: f.x, y: f.y, vx: rand(-160, 160), vy: rand(-200, 60), l: rand(.3, .6), col: f.k[0] });
          if (++s.got >= GOAL) return g.win();
        }
      }
    }
    for (const h of s.h) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 700 * dt; h.a += h.w * dt; h.sep = Math.min(h.sep + 30 * dt, 10); }
    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 500 * dt; f.l -= dt; }
    s.f = s.f.filter(f => f.y < H + 60 || f.vy < 0); s.h = s.h.filter(h => h.y < H + 60); s.fx = s.fx.filter(f => f.l > 0);
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const f of s.f) ball(c, f, 0);
    for (const h of s.h) ball(c, h, h.half);
    for (const f of s.fx) { c.globalAlpha = clamp(f.l * 2.5, 0, 1); poly(c, [f.x, f.y - 3, f.x + 3, f.y, f.x, f.y + 3, f.x - 3, f.y], f.col); }
    c.globalAlpha = 1; c.lineCap = 'round';
    for (let i = 1; i < s.trail.length; i++) { const a = s.trail[i - 1], b = s.trail[i]; c.strokeStyle = 'rgba(255,255,255,' + clamp(b.l * 5, 0, 1) + ')'; c.lineWidth = 2 + b.l * 28; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    if (s.flash > 0) { c.fillStyle = 'rgba(255,80,60,' + s.flash + ')'; c.fillRect(0, 0, W, H); }
  },
});
