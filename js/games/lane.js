// Top-down road crossing. Drag / WASD to move. Cross the road 3 times in 40s, 3 lives.
import { makeGame, W, H, poly, polyField, makeBg, steer, rand, clamp, hash } from '../core.js';
const LANES = 6, LY = i => 140 + i * 58, TARGET = 3, SX = W / 2, SY = H - 46;
const PAL = [['#ff6b6b', '#c93f4a'], ['#ffd166', '#d4a03a'], ['#6bb8ff', '#3f86c9'], ['#8be28f', '#4cb34f'], ['#c79bff', '#8f63c9'], ['#ff9f5a', '#d1713a']];
const pick = a => a[Math.floor(rand(0, a.length))];

function pine(x, X, Y, s) {
  poly(x, [X - 3 * s, Y, X + 3 * s, Y, X + 3 * s, Y + 9 * s, X - 3 * s, Y + 9 * s], '#5b3a24');
  for (let k = 0; k < 3; k++) { const y = Y - k * 11 * s, w = (20 - k * 4) * s; poly(x, [X - w, y, X, y - 20 * s, X, y], '#3a9a46'); poly(x, [X, y, X, y - 20 * s, X + w, y], '#237a30'); }
}
function vehicle(c, k) {
  const x = k.x, w = k.w, d = k.dir, y = k.y - 14, f = d > 0 ? x + w : x, r = d > 0 ? x : x + w;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 3, y + 5, w, 28);
  poly(c, [f, y + 5, f + d * 50, y - 5, f + d * 50, y + 33, f, y + 23], 'rgba(255,240,160,.15)');
  c.fillStyle = '#15171c';
  for (const o of k.t === 'car' ? [8, w - 18] : [8, 24, w - 18]) { c.fillRect(x + o, y - 2, 11, 3); c.fillRect(x + o, y + 27, 11, 3); }
  poly(c, [x, y, x + w, y, x + w, y + 14, x, y + 14], k.a); poly(c, [x, y + 14, x + w, y + 14, x + w, y + 28, x, y + 28], k.b);
  if (k.t === 'truck') {
    const bx = d > 0 ? x : x + 30, bw = w - 30;
    poly(c, [bx, y, bx + bw, y, bx + bw, y + 14, bx, y + 14], '#f4f1ea'); poly(c, [bx, y + 14, bx + bw, y + 14, bx + bw, y + 28, bx, y + 28], '#c7c2b6');
    c.fillStyle = k.a; c.fillRect(bx, y + 12, bw, 4);
  } else if (k.t === 'bus') {
    c.fillStyle = '#1d2b3f'; for (let i = 8; i < w - 24; i += 14) { c.fillRect(x + i, y + 4, 9, 6); c.fillRect(x + i, y + 18, 9, 6); }
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x + 4, y + 12, w - 8, 4);
  } else {
    const a = x + w * .22, b = x + w * .66;
    poly(c, [a, y + 3, b, y + 3, b, y + 14, a, y + 14], 'rgba(255,255,255,.28)'); poly(c, [a, y + 14, b, y + 14, b, y + 25, a, y + 25], 'rgba(0,0,0,.18)');
  }
  const wf = d > 0 ? f - 13 : f;
  poly(c, [wf, y + 4, wf + 13, y + 4, wf + 13, y + 24, wf, y + 24], '#1d2b3f');
  c.fillStyle = '#fff2a8'; c.fillRect(f - (d > 0 ? 3 : 0), y + 2, 3, 5); c.fillRect(f - (d > 0 ? 3 : 0), y + 21, 3, 5);
  c.fillStyle = '#ff3b3b'; c.fillRect(r - (d > 0 ? 0 : 3), y + 2, 3, 5); c.fillRect(r - (d > 0 ? 0 : 3), y + 21, 3, 5);
}

export default makeGame({
  id: 'lane', name: 'Lane', caption: 'Cross the road 3 times. Mind the traffic.', duration: 40,
  how: 'Drag (or WASD / arrows) to move. Cross the road to the top 3 times. You have 3 lives; each hit costs one.',
  init() {
    const cars = [];
    for (let i = 0; i < LANES; i++) {
      const dir = i % 2 ? 1 : -1, sp = rand(70, 140), r = Math.random(), t = r < .5 ? 'car' : r < .8 ? 'truck' : 'bus';
      const w = t === 'car' ? rand(46, 54) : t === 'truck' ? rand(78, 90) : 96, n = t === 'car' ? 3 : 2, gap = (W + 160) / n, off = rand(0, gap), col = pick(PAL);
      for (let k = 0; k < n; k++) cars.push({ x: -80 + off + k * gap, y: LY(i), w, dir, sp, a: col[0], b: col[1], t });
    }
    return {
      p: { x: SX, y: SY }, cars, lives: 3, got: 0, inv: 0, fx: [], shake: 0, mv: 0,
      bg: makeBg(x => {
        polyField(x, 0, 0, W, 111, 30, 125, 40, 34, 9);
        for (let i = 0; i < 9; i++) pine(x, 18 + i * 42 + hash(i, 1) * 14, 38 + hash(i, 2) * 40, .8 + hash(i, 3) * .4);
        for (let i = 0; i < 28; i++) { x.fillStyle = i % 2 ? '#ffe08a' : '#ff9ec2'; x.fillRect(hash(i, 5) * W, 6 + hash(i, 6) * 92, 3, 3); }
        for (let k = 0; k < W / 12; k++) for (let r = 0; r < 2; r++) { x.fillStyle = (k + r) % 2 ? '#fff' : '#222'; x.fillRect(k * 12, 99 + r * 6, 12, 6); }
        polyField(x, 0, 111, W, 348, 29, 220, 9, 21, 5);
        x.fillStyle = '#d6d0c2'; x.fillRect(0, 111, W, 5); x.fillRect(0, 454, W, 5);
        x.fillStyle = '#9a9588'; x.fillRect(0, 116, W, 2); x.fillRect(0, 452, W, 2);
        x.fillStyle = 'rgba(255,255,255,.35)';
        for (let i = 0; i < LANES - 1; i++) for (let k = 0; k < W; k += 44) x.fillRect(k, LY(i) + 28, 22, 3);
        polyField(x, 0, 459, W, H - 459, 30, 125, 40, 34, 4);
        x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(SX - 40, SY - 22, 80, 44);
        pine(x, 26, 560, 1); pine(x, W - 26, 585, 1.1); pine(x, 70, 610, .8);
        const g = x.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 420); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      }),
    };
  },
  status: s => `Crossed ${s.got}/${TARGET}   ${'♥'.repeat(s.lives)}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    const p = s.p, ox = p.x, oy = p.y; steer(p, 165, dt, g.input);
    p.x = clamp(p.x, 12, W - 12); p.y = clamp(p.y, 60, H - 14);
    s.mv = Math.hypot(p.x - ox, p.y - oy) > .3; s.inv = Math.max(0, s.inv - dt); s.shake = Math.max(0, s.shake - dt);
    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 320 * dt; f.l -= dt; }
    s.fx = s.fx.filter(f => f.l > 0);
    for (const c of s.cars) {
      c.x += c.dir * c.sp * dt;
      if (c.dir > 0 && c.x > W + 80) c.x -= W + 160; else if (c.dir < 0 && c.x < -80 - c.w) c.x += W + 160;
      if (s.inv <= 0 && Math.abs(p.x - (c.x + c.w / 2)) < c.w / 2 + 8 && Math.abs(p.y - c.y) < 22) {
        for (let i = 0; i < 16; i++) s.fx.push({ x: p.x, y: p.y, vx: rand(-150, 150), vy: rand(-220, 40), l: rand(.4, .9), col: i % 3 ? '#8be28f' : c.a });
        s.shake = .3;
        if (--s.lives <= 0) return g.lose();
        p.x = SX; p.y = SY; s.inv = 1.2; break;
      }
    }
    if (p.y < 100) {
      for (let i = 0; i < 24; i++) s.fx.push({ x: p.x, y: 96, vx: rand(-130, 130), vy: rand(-200, -20), l: rand(.6, 1.1), col: pick(['#ffd166', '#ff6b6b', '#6bb8ff', '#8be28f', '#fff']) });
      if (++s.got >= TARGET) return g.win(); p.x = SX; p.y = SY; s.inv = 0.4;
    }
  },
  draw(g, s, c) {
    c.save();
    if (s.shake > 0) c.translate(rand(-3, 3), rand(-3, 3));
    c.drawImage(s.bg, 0, 0, W, H);
    c.font = '800 16px system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,' + (.6 + .35 * Math.sin(g.t * 5)) + ')'; c.fillText('GOAL ▲', W / 2, 88);
    for (const k of s.cars) { c.fillStyle = 'rgba(255,255,255,.07)'; const sx = k.dir > 0 ? k.x - 36 : k.x + k.w; c.fillRect(sx, k.y - 6, 36, 2); c.fillRect(sx, k.y + 6, 36, 2); }
    for (const k of s.cars) vehicle(c, k);
    const p = s.p;
    if (!(s.inv > 0 && Math.floor(g.t * 12) % 2)) {
      const hop = s.mv ? Math.abs(Math.sin(g.t * 16)) * 5 : 0, x = p.x, y = p.y - hop;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(p.x, p.y + 9, 11, 5, 0, 0, 7); c.fill();
      poly(c, [x + 7, y + 3, x + 15, y + 12, x + 8, y + 12], '#2f8a3a'); poly(c, [x - 7, y + 3, x - 15, y + 12, x - 8, y + 12], '#2f8a3a');
      poly(c, [x + 7, y - 6, x + 14, y - 10, x + 9, y - 2], '#3f9a48'); poly(c, [x - 7, y - 6, x - 14, y - 10, x - 9, y - 2], '#3f9a48');
      poly(c, [x, y - 12, x + 9, y - 2, x + 7, y + 9, x, y + 9], '#8be28f'); poly(c, [x, y - 12, x - 9, y - 2, x - 7, y + 9, x, y + 9], '#4cb34f');
      c.fillStyle = '#fff'; c.fillRect(x - 7, y - 11, 5, 5); c.fillRect(x + 2, y - 11, 5, 5);
      c.fillStyle = '#111'; c.fillRect(x - 5, y - 10, 2, 3); c.fillRect(x + 4, y - 10, 2, 3);
    }
    for (const f of s.fx) { c.globalAlpha = clamp(f.l * 2, 0, 1); poly(c, [f.x, f.y - 3, f.x + 3, f.y, f.x, f.y + 3, f.x - 3, f.y], f.col); }
    c.globalAlpha = 1; c.textAlign = 'left'; c.restore();
  },
});
