// Memory pattern. Watch the tiles, repeat them. Tap tiles (or keys 1-4). Clear 5 rounds in 50s.
import { makeGame, W, H, poly, polyField, makeBg, clamp } from '../core.js';
const GOAL = 5, TX = i => 20 + (i % 2) * 160, TY = i => 200 + Math.floor(i / 2) * 170, TS = 160;
const COL = [['#4cb34f', '#8be28f', '#2f8a3a'], ['#e8202a', '#ff7a80', '#a8141c'], ['#ffd113', '#fff08a', '#c9a000'], ['#3f86c9', '#8cc4ff', '#2a5f94']];
const cellAt = (x, y) => { for (let i = 0; i < 4; i++) if (x >= TX(i) && x <= TX(i) + TS && y >= TY(i) && y <= TY(i) + TS) return i; return -1; };
function seqUp(s) { s.seq.push(Math.floor(Math.random() * 4)); s.ph = 'show'; s.si = 0; s.t = .8; s.lit = -1; s.pi = 0; }
export default makeGame({
  id: 'simon', name: 'Memory', caption: 'Watch the pattern, then repeat it.', duration: 50,
  how: 'Watch the tiles light up, then tap them in the same order (or press keys 1-4). Clear 5 rounds in 50 seconds. One wrong tile ends the game.',
  init() {
    const s = { seq: [], ph: 'show', si: 0, t: .8, lit: -1, pi: 0, lastK: '', fx: [], pop: 0, bg: makeBg(x => polyField(x, 0, 0, W, H, 40, 240, 30, 16, 7)) };
    seqUp(s); seqUp(s); s.seq.pop(); s.seq.length = 2; s.round = 1; s.seq = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)]; s.ph = 'show'; s.si = 0; s.t = .8; return s;
  },
  status: s => `Round ${Math.min(s.round, GOAL)}/${GOAL}`,
  timeoutWin: () => false,
  update(g, s, dt) {
    s.t -= dt; s.pop = Math.max(0, s.pop - dt);
    if (s.ph === 'show') {
      if (s.t <= 0) { if (s.lit >= 0) { s.lit = -1; s.t = .18; s.si++; } else if (s.si >= s.seq.length) { s.ph = 'input'; s.pi = 0; s.t = 0; } else { s.lit = s.seq[s.si]; s.t = .42; } }
      g.input.consumeTap(); return;
    }
    let k = -1;
    for (let i = 0; i < 4; i++) if (g.input.keys.has(String(i + 1))) k = i;
    const kk = k >= 0 ? String(k) : ''; if (kk && kk === s.lastK) k = -1; s.lastK = kk;
    while (g.input.consumeTap()) { if (k < 0) k = cellAt(g.input.ptr.x, g.input.ptr.y); }
    if (s.lit >= 0 && s.t <= 0) s.lit = -1;
    if (k >= 0) {
      s.lit = k; s.t = .2; s.pop = .2;
      if (k !== s.seq[s.pi]) return g.lose();
      if (++s.pi >= s.seq.length) { if (++s.round > GOAL) return g.win(); s.seq.push(Math.floor(Math.random() * 4)); s.ph = 'show'; s.si = 0; s.t = 1; s.lit = -1; }
    }
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (let i = 0; i < 4; i++) {
      const x = TX(i), y = TY(i), on = s.lit === i, k = COL[i], sc = on ? 1.04 : 1, w = TS * sc, o = (TS - w) / 2;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 4, y + 7, TS, TS);
      const a = on ? k[1] : k[0], b = on ? k[0] : k[2];
      poly(c, [x + o, y + o, x + o + w, y + o, x + o + w, y + o + w, x + o, y + o + w], b); poly(c, [x + o, y + o, x + o + w, y + o, x + o, y + o + w], a);
      c.fillStyle = 'rgba(255,255,255,' + (on ? .9 : .4) + ')'; c.font = '800 26px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), x + TS / 2, y + TS / 2 + 9);
    }
    c.font = '800 24px system-ui,sans-serif'; c.fillStyle = s.ph === 'show' ? '#ffd166' : '#8be28f'; c.fillText(s.ph === 'show' ? 'WATCH…' : 'YOUR TURN', W / 2, 160); c.textAlign = 'left';
  },
});
