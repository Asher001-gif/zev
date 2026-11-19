// Stick bridge. Hold to grow the stick, release to drop it. Cross 6 gaps in 45s.
import { makeGame, W, H, poly, sky, makeHills, drawHills, rand, clamp } from '../core.js';
const GOAL = 6, GY = 470, BASE = 100;
export default makeGame({
  id: 'bridge', name: 'Bridge', caption: 'Hold to grow the stick. Cross 6 gaps.', duration: 45,
  how: 'Hold the screen (or Space) to grow the stick, release to drop it. It must reach the next platform without overshooting. Cross 6 gaps in 45 seconds.',
  init() {
    return { pl: [{ x: BASE - 90, w: 90 }, { x: BASE + 120, w: 70 }], st: 'idle', L: 0, ang: 0, hx: BASE - 14, got: 0, sc: 0, fall: 0, far: makeHills(7, 110, 120, 180, 90, 150) };
  },
  status: s => `Crossed ${s.got}/${GOAL}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const k = g.input.keys, held = g.input.ptr.down || k.has(' ') || k.has('arrowup') || k.has('w'), a = s.pl[0], b = s.pl[1], base = a.x + a.w;
    g.input.consumeTap();
    if (s.st === 'idle' && held) s.st = 'grow';
    if (s.st === 'grow') { s.L += 230 * dt; if (!held) { s.st = 'drop'; s.ang = 0; } }
    else if (s.st === 'drop') { s.ang += dt * 4; if (s.ang >= 1) { s.ang = 1; s.ok = s.L >= b.x - base && s.L <= b.x + b.w - base; s.tx = s.ok ? b.x + b.w - 14 : base + s.L + 8; s.st = 'walk'; } }
    else if (s.st === 'walk') { s.hx += 260 * dt; if (s.hx >= s.tx) { s.hx = s.tx; if (s.ok) { if (++s.got >= GOAL) return g.win(); s.st = 'scroll'; s.sc = 0; s.shift = b.x + b.w - BASE; } else s.st = 'fall'; } }
    else if (s.st === 'fall') { s.fall += dt; s.hy = s.fall * s.fall * 900; if (s.fall > .6) return g.lose(); }
    else if (s.st === 'scroll') {
      const d = Math.min(s.shift * dt * 3, s.shift - s.sc); s.sc += d; for (const p of s.pl) p.x -= d; s.hx -= d; moveFar(s, d);
      if (s.sc >= s.shift - .01) { s.pl.shift(); const l = s.pl[0]; s.pl.push({ x: l.x + l.w + rand(60, 190), w: rand(36, 90) }); s.st = 'idle'; s.L = 0; s.ang = 0; }
    }
  },
  draw(g, s, c) {
    sky(c, '#2d3a6b', '#ff9a76'); poly(c, [W - 90, 130, W - 62, 100, W - 34, 130, W - 62, 160], '#fff1c9');
    drawHills(c, s.far, GY, '#6b4a8f', '#54386f');
    for (const p of s.pl) { poly(c, [p.x, GY, p.x + p.w, GY, p.x + p.w, H, p.x, H], '#2b2a3f'); poly(c, [p.x, GY, p.x + p.w, GY, p.x + p.w - 6, GY + 14, p.x + 6, GY + 14], '#4a4870'); poly(c, [p.x + p.w / 2 - 6, GY, p.x + p.w / 2 + 6, GY, p.x + p.w / 2 + 6, GY + 6, p.x + p.w / 2 - 6, GY + 6], '#e8202a'); }
    const a = s.pl[0], bx = a.x + a.w;
    c.save(); c.translate(bx, GY); c.rotate(s.ang * Math.PI / 2); c.fillStyle = '#8a5a2a'; c.fillRect(-2, -s.L, 4, s.L); c.fillStyle = '#5b3a1a'; c.fillRect(0, -s.L, 2, s.L); c.restore();
    const hy = s.st === 'fall' ? GY + (s.hy || 0) : GY, x = s.hx, bob = s.st === 'walk' ? Math.abs(Math.sin(g.t * 20)) * 2 : 0, y = hy - bob;
    poly(c, [x - 7, y - 24, x + 7, y - 24, x + 7, y, x - 7, y], '#e8e8f0'); poly(c, [x - 7, y - 24, x, y - 24, x, y, x - 7, y], '#b8b8c8'); poly(c, [x - 8, y - 38, x + 8, y - 38, x + 8, y - 24, x - 8, y - 24], '#222'); c.fillStyle = '#e8202a'; c.fillRect(x - 8, y - 33, 16, 3); c.fillStyle = '#fff'; c.fillRect(x + 2, y - 36, 5, 3);
    if (s.st === 'grow') { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '700 14px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('release to drop', W / 2, 560); c.textAlign = 'left'; }
  },
});
function moveFar(s, d) { for (const m of s.far.items) { m.x -= d * .15; if (m.x + m.w < -10) m.x += s.far.total; } }
