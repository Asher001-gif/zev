// Feed shell: shuffle, preload-one-ahead, lock/unlock, swipe + arrow navigation, votes.
import { Input } from './core.js';
import { REGISTRY } from './games/index.js';

const $ = s => document.querySelector(s);
const frame = $('#frame'), feed = $('#feed'), loadingEl = $('#loading'), hintEl = $('#hint');

const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function shuffle(ids, last) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.length > 1 && a[0] === last) { const j = 1 + Math.floor(Math.random() * (a.length - 1)); [a[0], a[j]] = [a[j], a[0]]; }
  return a;
}

const sessionId = Date.now().toString(36);
const order = shuffle(REGISTRY.map(g => g.id), store.get('zev.last', null));
const byId = Object.fromEntries(REGISTRY.map(g => [g.id, g]));
const prepared = [], ready = [];
let idx = 0, cur = null, busy = false;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------- build slides ---------- */
function buildGame(id, def) {
  const el = document.createElement('section');
  el.className = 'slide'; el.dataset.state = 'ready'; el.style.transform = 'translateY(100%)';
  el.innerHTML = `<canvas></canvas>
    <div class="caption"></div>
    <button class="pause" aria-label="Pause">❚❚</button>
    <div class="panel"><h2></h2>
      <div class="votes"><button data-v="like" aria-label="Like">👍</button><button data-v="dislike" aria-label="Dislike">👎</button></div>
      <button class="resume">Resume</button>
      <p class="sub">${coarse ? 'Swipe up for the next game' : 'Press ↓ for the next game'}</p></div>`;
  el.querySelector('.caption').textContent = `${def.name} — ${def.caption}`;
  feed.appendChild(el);
  const canvas = el.querySelector('canvas'), input = new Input(canvas);
  const rec = { type: 'game', id, el, input, state: 'ready', outcome: null, vote: null, game: null };
  rec.game = def.create({ canvas, input, onEnd: r => { rec.outcome = r.outcome; el.querySelector('h2').textContent = r.outcome === 'win' ? 'You won!' : 'You lost'; setState(rec, 'ended'); } });
  el.querySelector('.pause').onclick = () => pauseRec(rec);
  el.querySelector('.resume').onclick = () => { rec.game.resume(); setState(rec, 'playing'); };
  el.querySelectorAll('.votes button').forEach(b => b.onclick = () => {
    rec.vote = b.dataset.v;
    el.querySelectorAll('.votes button').forEach(x => x.classList.toggle('on', x === b));
    logVote(rec);
  });
  return rec;
}

function buildEnd() {
  const el = document.createElement('section');
  el.className = 'slide'; el.style.transform = 'translateY(100%)';
  el.innerHTML = `<div class="end"><h2>You’ve played everything.</h2><p>New games coming soon.</p>
    <a class="follow" href="https://shadow-av.itch.io/" target="_blank" rel="noopener noreferrer">Follow on itch.io to get new games</a></div>`;
  feed.appendChild(el);
  return { type: 'end', el };
}

/* ---------- preload: always one ahead ---------- */
function prepare(i) {
  if (prepared[i]) return prepared[i];
  const p = i >= order.length ? Promise.resolve(buildEnd())
    : byId[order[i]].load().then(m => buildGame(order[i], m.default));
  prepared[i] = p.then(r => { ready[i] = true; return r; }, err => { prepared[i] = null; throw err; });
  return prepared[i];
}
async function getReady(i) {
  for (;;) { try { return await prepare(i); } catch { await new Promise(r => setTimeout(r, 1500)); } }
}

/* ---------- state, lock, chrome ---------- */
const locked = () => !!cur && cur.type === 'game' && (cur.state === 'playing' || cur.state === 'ready');
function setState(rec, st) { rec.state = st; rec.el.dataset.state = st; if (rec === cur) refreshChrome(); }
function refreshChrome() {
  const show = !busy && cur && cur.type === 'game' && !locked();
  hintEl.classList.toggle('hidden', !show);
  if (show) hintEl.textContent = coarse ? '▲ Swipe up' : '↓ Next game';
}
function pauseRec(rec) {
  if (rec.state !== 'playing') return;
  rec.game.pause(); rec.el.querySelector('h2').textContent = 'Paused'; setState(rec, 'paused');
}
function logVote(rec) {
  const votes = store.get('zev.votes', []);
  const entry = { session: sessionId, game: rec.id, vote: rec.vote, outcome: rec.outcome || (rec.state === 'paused' ? 'paused' : null), ts: Date.now() };
  const k = votes.findIndex(x => x.session === sessionId && x.game === rec.id);
  if (k >= 0) votes[k] = entry; else votes.push(entry);
  store.set('zev.votes', votes.slice(-500));
}
function startRec(rec) { store.set('zev.last', rec.id); setState(rec, 'playing'); rec.game.start(); }
function destroyRec(rec) {
  if (rec.game) { rec.game.destroy(); rec.game = null; }   // frees canvas + loop
  if (rec.input) rec.input.destroy();
  rec.el.remove();
}

/* ---------- navigation ---------- */
function transition(a, b) {
  return new Promise(res => {
    void b.el.offsetHeight;
    a.el.style.transform = 'translateY(-100%)'; b.el.style.transform = 'translateY(0)';
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    b.el.addEventListener('transitionend', fin, { once: true }); setTimeout(fin, 500);
  });
}
async function advance() {
  if (busy || !cur || cur.type === 'end' || locked()) return;
  busy = true; refreshChrome();
  const next = idx + 1;
  if (!ready[next]) loadingEl.classList.remove('hidden');   // only if the next game isn't ready
  const nextRec = await getReady(next);
  loadingEl.classList.add('hidden');
  await transition(cur, nextRec);
  destroyRec(cur); cur = nextRec; idx = next;
  if (cur.type === 'game') startRec(cur);
  else store.set('zev.completed', (store.get('zev.completed', 0) || 0) + 1);
  if (idx < order.length) prepare(idx + 1).catch(() => {});
  busy = false; refreshChrome();
}

let sx = 0, sy = 0;
frame.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
frame.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (dy < -60 && Math.abs(dy) > Math.abs(dx) * 1.3) advance(); });
frame.addEventListener('wheel', e => { if (e.deltaY > 40) advance(); }, { passive: true });
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') advance();   // ignored while locked
});
document.addEventListener('visibilitychange', () => { if (document.hidden && cur && cur.type === 'game') pauseRec(cur); });

/* ---------- boot ---------- */
(async function boot() {
  loadingEl.classList.remove('hidden');
  cur = await getReady(0);
  cur.el.style.transition = 'none'; cur.el.style.transform = 'translateY(0)';
  void cur.el.offsetHeight; cur.el.style.transition = '';
  loadingEl.classList.add('hidden');
  startRec(cur);
  prepare(1).catch(() => {});
})();
