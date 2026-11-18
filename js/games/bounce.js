// Top-down brick bouncer. Drag / A-D to move the paddle. Keep the ball alive for 30s (or clear all bricks).
import { makeGame, W, H, poly, polyField, makeBg, clamp, rand } from '../core.js';
const PW = 84, PY = H - 80, PH = 14, R = 8, TOP = 56, BW = 52, BHT = 22, COLS = 6, ROWS = 3;

export default makeGame({
  id: 'bounce', name: 'Bounce', caption: 'Keep the ball alive for 30s.', duration: 30,
  how: 'Drag (or A / D, arrows) to slide the paddle. Don’t let the ball fall past it. Survive 30 seconds, or smash every brick.',
  init() {
    const bricks = [];
    for (let r = 0; r < ROWS; r++) for (let k = 0; k < COLS; k++) bricks.push({ x: 14 + k * (BW + 4), y: 90 + r * 26, hue: 190 + r * 50 + k * 6, alive: true });
    const a = rand(-0.5, 0.5);
    return { px: W / 2, ball: { x: W / 2, y: 400, vx: Math.sin(a), vy: -Math.cos(a) }, bricks, bg: makeBg(x => polyField(x, 0, 0, W, H, 40, 200, 30, 18, 8, 7)) };
  },
  status: s => `Bricks ${s.bricks.filter(b => b.alive).length}`,
  update(g, s, dt) {
    const inp = g.input, sp = 270 + g.t * 4;
    if (inp.ptr.down) s.px += clamp(inp.ptr.x - s.px, -720 * dt, 720 * dt); else s.px += inp.axisX() * 380 * dt;
    s.px = clamp(s.px, PW / 2, W - PW / 2);
    const b = s.ball, m = Math.hypot(b.vx, b.vy) || 1; b.vx = b.vx / m * sp; b.vy = b.vy / m * sp;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); } if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); }
    if (b.y < TOP + R) { b.y = TOP + R; b.vy = Math.abs(b.vy); }
    if (b.vy > 0 && b.y + R >= PY && b.y - R <= PY + PH && Math.abs(b.x - s.px) <= PW / 2 + R) {
      b.y = PY - R; const ang = clamp((b.x - s.px) / (PW / 2 + R), -1, 1) * 1.0;
      b.vx = Math.sin(ang) * sp; b.vy = -Math.cos(ang) * sp;
    }
    for (const k of s.bricks) {
      if (!k.alive) continue;
      const cx = clamp(b.x, k.x, k.x + BW), cy = clamp(b.y, k.y, k.y + BHT), dx = b.x - cx, dy = b.y - cy;
      if (dx * dx + dy * dy < R * R) {
        k.alive = false;
        if (!dx && !dy) b.vy = -b.vy; else if (Math.abs(dx) > Math.abs(dy)) b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx); else b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
        break;
      }
    }
    if (!s.bricks.some(k => k.alive)) return g.win();
    if (b.y > H + R) return g.lose();
  },
  draw(g, s, c) {
    c.drawImage(s.bg, 0, 0, W, H);
    for (const k of s.bricks) {
      if (!k.alive) continue;
      poly(c, [k.x, k.y, k.x + BW, k.y, k.x, k.y + BHT], `hsl(${k.hue} 65% 62%)`);
      poly(c, [k.x + BW, k.y, k.x + BW, k.y + BHT, k.x, k.y + BHT], `hsl(${k.hue} 60% 44%)`);
    }
    const x = s.px - PW / 2;
    poly(c, [x, PY, x + PW, PY, x + PW - 8, PY + PH, x + 8, PY + PH], '#ffd166');
    poly(c, [x, PY, x + PW / 2, PY, x + 8, PY + PH], '#ffe49a');
    const b = s.ball;
    poly(c, [b.x, b.y - R, b.x + R, b.y, b.x, b.y], '#ffffff'); poly(c, [b.x, b.y - R, b.x - R, b.y, b.x, b.y], '#cfe8ff');
    poly(c, [b.x + R, b.y, b.x, b.y + R, b.x, b.y], '#9ec7ee'); poly(c, [b.x - R, b.y, b.x, b.y + R, b.x, b.y], '#b4d6f5');
  },
});
