// Shared base: input, drawing helpers and the game contract (makeGame).
export const W = 360, H = 640;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const hash = (i, j, k = 0) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };

/* ---------- input: one scheme for every game ----------
   touch/mouse: tap = action, drag = steer.  keys: space/W/Up = action, A/D/arrows/WASD = move. */
export class Input {
  constructor(canvas) {
    this.canvas = canvas; this.on = false; this.keys = new Set(); this.taps = 0;
    this.ptr = { x: W / 2, y: H / 2, down: false };
    this._kd = e => {
      if (!this.on) return;
      const k = e.key.toLowerCase();
      if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
      if (!e.repeat && (k === ' ' || k === 'arrowup' || k === 'w')) this.taps++;
      this.keys.add(k);
    };
    this._ku = e => this.keys.delete(e.key.toLowerCase());
    this._pd = e => { if (!this.on) return; this._pos(e); this.ptr.down = true; this.taps++; try { canvas.setPointerCapture(e.pointerId); } catch {} };
    this._pm = e => { if (this.on) this._pos(e); };
    this._pu = () => { this.ptr.down = false; };
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    canvas.addEventListener('pointerdown', this._pd);
    canvas.addEventListener('pointermove', this._pm);
    canvas.addEventListener('pointerup', this._pu);
    canvas.addEventListener('pointercancel', this._pu);
  }
  _pos(e) { const r = this.canvas.getBoundingClientRect(); this.ptr.x = (e.clientX - r.left) / r.width * W; this.ptr.y = (e.clientY - r.top) / r.height * H; }
  setOn(v) { this.on = v; if (!v) { this.keys.clear(); this.ptr.down = false; } this.taps = 0; }
  consumeTap() { if (this.taps > 0) { this.taps--; return true; } return false; }
  axisX() { return (this.keys.has('arrowright') || this.keys.has('d') ? 1 : 0) - (this.keys.has('arrowleft') || this.keys.has('a') ? 1 : 0); }
  axisY() { return (this.keys.has('arrowdown') || this.keys.has('s') ? 1 : 0) - (this.keys.has('arrowup') || this.keys.has('w') ? 1 : 0); }
  destroy() {
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
    const c = this.canvas;
    c.removeEventListener('pointerdown', this._pd); c.removeEventListener('pointermove', this._pm);
    c.removeEventListener('pointerup', this._pu); c.removeEventListener('pointercancel', this._pu);
    this.canvas = null;
  }
}

// Top-down movement: keys, or follow the finger (offset up so the finger doesn't cover the player).
export function steer(p, speed, dt, input) {
  const ax = input.axisX(), ay = input.axisY();
  if (ax || ay) { const m = Math.hypot(ax, ay); p.x += ax / m * speed * dt; p.y += ay / m * speed * dt; }
  else if (input.ptr.down) {
    const dx = input.ptr.x - p.x, dy = input.ptr.y - 36 - p.y, d = Math.hypot(dx, dy);
    if (d > 1) { const m = Math.min(speed * dt, d); p.x += dx / d * m; p.y += dy / d * m; }
  }
}

/* ---------- low-poly drawing helpers ---------- */
export function poly(c, pts, fill, stroke) {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
}
export function sky(c, top, bot) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
export function polyField(c, x0, y0, w, h, size, hue, sat, light, vary, seed = 0) {
  const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = x0 + i * size, y = y0 + j * size;
    const a = `hsl(${hue} ${sat}% ${light + (hash(i, j, seed) - .5) * vary}%)`;
    const b = `hsl(${hue} ${sat}% ${light + (hash(i, j, seed + 9) - .5) * vary}%)`;
    poly(c, [x, y, x + size, y, x, y + size], a, a);
    poly(c, [x + size, y, x + size, y + size, x, y + size], b, b);
  }
}
export function makeBg(drawFn, scale = 2) {
  const cv = document.createElement('canvas'); cv.width = W * scale; cv.height = H * scale;
  const x = cv.getContext('2d'); x.scale(scale, scale); drawFn(x); return cv;
}
export function makeHills(n, spacing, wmin, wmax, hmin, hmax) {
  return { total: n * spacing, items: Array.from({ length: n }, (_, i) => ({ x: i * spacing + rand(-20, 20), w: rand(wmin, wmax), h: rand(hmin, hmax) })) };
}
export function moveHills(h, dx) { for (const m of h.items) { m.x -= dx; if (m.x + m.w < -10) m.x += h.total; } }
export function drawHills(c, h, baseY, light, dark) {
  for (const m of h.items) {
    poly(c, [m.x, baseY, m.x + m.w / 2, baseY - m.h, m.x + m.w / 2, baseY], light);
    poly(c, [m.x + m.w / 2, baseY, m.x + m.w / 2, baseY - m.h, m.x + m.w, baseY], dark);
  }
}

/* ---------- the game contract ----------
   A game module default-exports makeGame({ id, name, caption, duration, init, update, draw, status?, timeoutWin? }).
   def.create({ canvas, input, onEnd }) -> { start, pause, resume, destroy }.
   Inside update: g.win() / g.lose() end the game. onEnd receives { outcome: 'win' | 'lose' }. */
export function makeGame(spec) {
  return { id: spec.id, name: spec.name, caption: spec.caption, how: spec.how || spec.caption, create: ctx => new Runtime(spec, ctx) };
}

class Runtime {
  constructor(spec, ctx) {
    this.spec = spec; this.canvas = ctx.canvas; this.input = ctx.input; this.onEnd = ctx.onEnd;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = W * dpr; this.canvas.height = H * dpr;
    this.c = this.canvas.getContext('2d'); this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.t = 0; this.dur = spec.duration; this.state = 'ready'; this.grace = 0.9; this.raf = 0; this.last = 0;
    this.W = W; this.H = H;
    this.s = spec.init(this);
    this._render(false);
  }
  start() { if (this.state !== 'ready') return; this.state = 'running'; this.input.setOn(true); this._go(); }
  pause() { if (this.state !== 'running') return; this.state = 'paused'; this.input.setOn(false); cancelAnimationFrame(this.raf); }
  resume() { if (this.state !== 'paused') return; this.state = 'running'; this.input.setOn(true); this._go(); }
  win() { this._finish('win'); }
  lose() { this._finish('lose'); }
  destroy() {
    this.state = 'destroyed'; cancelAnimationFrame(this.raf);
    this.s = null; this.spec = null; this.onEnd = null; this.c = null;
    if (this.canvas) { this.canvas.width = 0; this.canvas.height = 0; this.canvas = null; }
  }
  _go() { this.last = performance.now(); this.raf = requestAnimationFrame(this._tick); }
  _tick = now => {
    if (this.state !== 'running') return;
    const dt = Math.max(0, Math.min((now - this.last) / 1000, 0.05)); this.last = now;
    if (this.grace > 0) { this.grace -= dt; this._render(true); this.raf = requestAnimationFrame(this._tick); return; }
    this.t += dt;
    this.spec.update(this, this.s, dt);
    if (this.state === 'running' && this.t >= this.dur) this._finish((this.spec.timeoutWin ? this.spec.timeoutWin(this.s) : true) ? 'win' : 'lose');
    if (this.state === 'running') { this._render(false); this.raf = requestAnimationFrame(this._tick); }
  };
  _finish(outcome) {
    if (this.state !== 'running') return;
    this.state = 'ended'; this.input.setOn(false); cancelAnimationFrame(this.raf);
    this._render(false);
    const cb = this.onEnd; if (cb) cb({ outcome });
  }
  _render(grace) {
    const c = this.c; if (!c) return;
    this.spec.draw(this, this.s, c);
    const p = clamp(this.t / this.dur, 0, 1);
    c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(16, 16, W - 84, 6);
    c.fillStyle = '#ffd166'; c.fillRect(16, 16, (W - 84) * p, 6);
    if (this.spec.status) { c.font = '600 14px system-ui,sans-serif'; c.textAlign = 'left'; c.fillStyle = '#fff'; c.fillText(this.spec.status(this.s), 16, 44); }
    if (grace) { c.font = '800 34px system-ui,sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText('GET READY', W / 2, H / 2 - 40); c.textAlign = 'left'; }
  }
}
