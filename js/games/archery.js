// Archery. Tap / Space to shoot at the moving target. 6 arrows, score 40+ of 60 to win.
import { makeGame, W, H, poly, sky, makeHills, drawHills, clamp } from '../core.js';
const AY = 340, TX = 300, ARROWS = 6, NEED = 40;
const pts = d => d < 9 ? 10 : d < 22 ? 7 : d < 38 ? 4 : d < 54 ? 2 : 0;
export default makeGame({
  id: 'archery', name: 'Archery', caption: 'Time your shot. Score 40+ with 6 arrows.', duration: 40,
  how: 'Tap (or press Space) to shoot when the target crosses your aim line. 6 arrows; bullseye = 10 points. Score 40 or more to win.',
  init() { return { ty: AY, ph: 0, left: ARROWS, score: 0, ar: null, stuck: [], end: 0, msg: '', mt: 0, hills: makeHills(6, 100, 140, 200, 60, 110) }; },
  status: s => `Score ${s.score}/${NEED}   Arrows ${s.left}`,
  timeoutWin: s => s.score >= NEED,
  update(g, s, dt) {
    s.ph += dt * (1.6 + (ARROWS - s.left) * .35); s.ty = AY + Math.sin(s.ph) * 190 * Math.cos(s.ph * .37 + .5 * 0);
    s.mt = Math.max(0, s.mt - dt);
    if (s.end) { s.end -= dt; if (s.end <= 0) return s.score >= NEED ? g.win() : g.lose(); g.input.consumeTap(); return; }
    if (g.input.consumeTap() && !s.ar && s.left > 0) { s.ar = { x: 60 }; s.left--; }
    if (s.ar) {
      s.ar.x += 1000 * dt;
      if (s.ar.x >= TX) { const d = Math.abs(AY - s.ty), p = pts(d); s.score += p; s.stuck.push({ off: AY - s.ty }); s.msg = p ? '+' + p : 'Miss'; s.mt = .8; s.ar = null; if (s.left === 0) s.end = 1; }
    }
  },
  draw(g, s, c) {
    sky(c, '#7ec8ff', '#e8f6ff'); drawHills(c, s.hills, 520, '#7fc77f', '#5fa85f'); poly(c, [0, 520, W, 520, W, H, 0, H], '#4a9a4a'); poly(c, [0, 520, W, 520, W, 540, 0, 540], '#3f8a3f');
    c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 70; x < TX; x += 24) c.fillRect(x, AY - 1, 12, 2);
    const y = s.ty, rs = [[56, '#f4f1ea', '#c7c2b6'], [40, '#3f86c9', '#2a5f94'], [26, '#e8202a', '#a8141c'], [12, '#ffd166', '#d4a03a']];
    c.fillStyle = '#5b3a24'; c.fillRect(TX - 3, y, 6, 600 - y > 0 ? 600 - y : 0); c.fillRect(TX - 3, 0, 6, y - 60 > 0 ? y - 60 : 0);
    for (const r of rs) { const w = r[0] * .55, h = r[0]; poly(c, [TX, y - h, TX + w, y - h * .5, TX + w, y + h * .5, TX, y + h, TX, y - h], r[1]); poly(c, [TX, y - h, TX - w, y - h * .5, TX - w, y + h * .5, TX, y + h], r[2]); }
    for (const a of s.stuck) { const ay = y + a.off; c.fillStyle = '#7a5230'; c.fillRect(TX - 46, ay - 1, 46, 3); poly(c, [TX - 52, ay - 5, TX - 44, ay, TX - 52, ay + 5], '#e8202a'); }
    poly(c, [20, AY - 28, 38, AY - 28, 38, AY + 6, 20, AY + 6], '#f28c28'); poly(c, [20, AY - 28, 38, AY - 28, 29, AY - 14], '#ffb054'); poly(c, [22, AY + 6, 36, AY + 6, 36, AY + 30, 22, AY + 30], '#3f86c9'); poly(c, [24, AY - 46, 36, AY - 46, 38, AY - 28, 22, AY - 28], '#f6d6b0');
    c.strokeStyle = '#5b3a24'; c.lineWidth = 3; c.beginPath(); c.arc(48, AY - 10, 22, -1.2, 1.2); c.stroke();
    if (s.ar) { c.fillStyle = '#7a5230'; c.fillRect(s.ar.x - 46, AY - 1, 46, 3); poly(c, [s.ar.x, AY - 5, s.ar.x + 9, AY, s.ar.x, AY + 5], '#ddd'); poly(c, [s.ar.x - 52, AY - 5, s.ar.x - 44, AY, s.ar.x - 52, AY + 5], '#e8202a'); }
    else if (!s.end && s.left > 0) { c.fillStyle = '#7a5230'; c.fillRect(42, AY - 1, 40, 3); }
    if (s.mt > 0) { c.font = '800 34px system-ui,sans-serif'; c.textAlign = 'center'; c.globalAlpha = clamp(s.mt * 2, 0, 1); c.fillStyle = s.msg === 'Miss' ? '#ff6b6b' : '#ffd166'; c.fillText(s.msg, W / 2, 230); c.globalAlpha = 1; c.textAlign = 'left'; }
  },
});
