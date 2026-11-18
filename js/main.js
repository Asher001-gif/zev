// Feed shell: shuffle, preload-one-ahead, lock/unlock, swipe + arrow navigation, reviews, tutorial.
import { Input } from './core.js';
import { REGISTRY } from './games/index.js';

const $ = s => document.querySelector(s);
const frame = $('#frame'), feed = $('#feed'), loadingEl = $('#loading'), hintEl = $('#hint');

const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';
const DOWN = UP.replace('<svg ', '<svg class="down" ');

function shuffle(ids, last) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.length > 1 && a[0] === last) { const j = 1 + Math.floor(Math.random() * (a.length - 1)); [a[0], a[j]] = [a[j], a[0]]; }
  return a;
}

const order = shuffle(REGISTRY.map(g => g.id), store.get('zev.last', null));
const byId = Object.fromEntries(REGISTRY.map(g => [g.id, g]));
const prepared = [], ready = [];
let idx = 0, cur = null, busy = false;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------- reviews: like (green) / neutral (yellow) / dislike (red), kept on this device ----------
   zev.reviews = { gameId: { like, neutral, dislike, last, ts } }  -- used later to pick games.
   Moving on without voting counts as neutral. */
function saveReview(id, val, prev) {
  const all = store.get('zev.reviews', {});
  const r = all[id] || { like: 0, neutral: 0, dislike: 0 };
  if (prev) r[prev] = Math.max(0, (r[prev] || 0) - 1);
  r[val] = (r[val] || 0) + 1; r.last = val; r.ts = Date.now();
  all[id] = r; store.set('zev.reviews', all);
}

/* ---------- build slides ---------- */
function buildGame(id, def) {
  const el = document.createElement('section');
  el.className = 'slide'; el.dataset.state = 'ready'; el.dataset.help = '0'; el.style.transform = 'translateY(100%)';
  el.innerHTML = `<canvas></canvas>
    <div class="caption"><b></b><span></span></div>
    <button class="pause" aria-label="Pause">❚❚</button>
    <div class="panel"><h2></h2><button class="resume">Resume</button>
      <p class="sub">${coarse ? 'Swipe up for the next game' : 'Press ↓ for the next game'}</p></div>
    <div class="rail">
      <div class="pair"><button class="rb like" aria-label="Like">${UP}</button><button class="rb dislike" aria-label="Dislike">${DOWN}</button></div>
      <button class="rb q" aria-label="How to play">?</button>
    </div>
    <div class="help"><h3>How to play</h3><p></p><button>Got it</button></div>`;
  el.querySelector('.caption b').textContent = def.name;
  el.querySelector('.caption span').textContent = def.caption;
  el.querySelector('.help p').textContent = def.how;
  feed.appendChild(el);
  const canvas = el.querySelector('canvas'), input = new Input(canvas);
  const rec = { type: 'game', id, el, input, state: 'ready', outcome: null, vote: null, saved: null, game: null };
  rec.game = def.create({ canvas, input, onEnd: r => { rec.outcome = r.outcome; el.querySelector('h2').textContent = r.outcome === 'win' ? 'You won!' : 'You lost'; setState(rec, 'ended'); } });
  el.querySelector('.pause').onclick = () => pauseRec(rec);
  el.querySelector('.resume').onclick = () => { rec.game.resume(); setState(rec, 'playing'); };
  el.querySelector('.q').onclick = () => {
    if (rec.state === 'ready') return;
    if (rec.state === 'playing') pauseRec(rec);   // reading the rules pauses the game
    el.dataset.help = '1';
  };
  el.querySelector('.help button').onclick = () => { el.dataset.help = '0'; };
  const likeB = el.querySelector('.like'), disB = el.querySelector('.dislike');
  const vote = v => {
    const nv = rec.vote === v ? null : v;           // tap again to undo
    saveReview(id, nv || 'neutral', rec.saved);
    rec.saved = nv || 'neutral'; rec.vote = nv;
    likeB.classList.toggle('on', nv === 'like'); disB.classList.toggle('on', nv === 'dislike');
  };
  likeB.onclick = () => vote('like'); disB.onclick = () => vote('dislike');
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
  const show = !busy && cur && cur.type === 'game' && !locked() && cur.el.dataset.help !== '1';
  hintEl.classList.toggle('hidden', !show);
  if (show) hintEl.textContent = coarse ? '▲ Swipe up' : '↓ Next game';
}
function pauseRec(rec) {
  if (rec.state !== 'playing') return;
  rec.game.pause(); rec.el.querySelector('h2').textContent = 'Paused'; setState(rec, 'paused');
}
function startRec(rec) { store.set('zev.last', rec.id); setState(rec, 'playing'); rec.game.start(); }
function destroyRec(rec) {
  if (rec.type === 'game' && !rec.saved) saveReview(rec.id, 'neutral', null);   // left without voting
  if (rec.game) { rec.game.destroy(); rec.game = null; }   // frees canvas + loop
  if (rec.input) rec.input.destroy();
  rec.el.remove();
}

/* ---------- first-visit tutorial ---------- */
function showTutorial() {
  return new Promise(resolve => {
    const t = document.createElement('div'); t.id = 'tutorial';
    t.innerHTML = `<div class="rail"><div class="pair"><button class="rb" tabindex="-1">${UP}</button><button class="rb" tabindex="-1">${DOWN}</button></div><div class="hw"><button class="rb q" tabindex="-1">?</button></div></div><div class="tmid"></div><button class="tnext"></button>`;
    frame.appendChild(t);
    const pair = t.querySelector('.pair'), hw = t.querySelector('.hw'), mid = t.querySelector('.tmid'), next = t.querySelector('.tnext');
    const steps = [
      { text: 'Like or dislike each game here. These buttons appear when a game is paused or ends.', at: pair },
      { text: 'Not sure how to play? Tap ? any time to see how.', at: hw },
      { text: coarse ? 'Swipe up for the next game. Every game plays once, so make it count!' : 'Press ↓ for the next game. Every game plays once, so make it count!', at: null },
    ];
    let i = 0, tip = null;
    const render = () => {
      const s = steps[i];
      if (tip) tip.remove();
      mid.textContent = '';
      pair.classList.toggle('dim', s.at !== pair); hw.classList.toggle('dim', s.at !== hw);
      if (s.at) { tip = document.createElement('div'); tip.className = 'tip'; tip.textContent = s.text; s.at.appendChild(tip); }
      else { tip = null; mid.textContent = s.text; }
      next.textContent = i < steps.length - 1 ? 'Next' : 'Let’s play';
    };
    next.onclick = () => {
      if (i < steps.length - 1) { i++; render(); return; }
      store.set('zev.tutorial', 1);
      t.classList.remove('on'); setTimeout(() => { t.remove(); resolve(); }, 450);
    };
    render();
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('on')));   // fade the screen to black
  });
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
  if (busy || !cur || cur.type === 'end' || locked() || cur.el.dataset.help === '1') return;
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
  prepare(1).catch(() => {});
  if (!store.get('zev.tutorial', 0)) await showTutorial();   // new player: explain the buttons first
  startRec(cur);
})();
