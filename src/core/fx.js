'use strict';
// Effects that make a hit feel like a hit: bursts, sparks, rings, floating numbers, light, flashes and screen shake. Nothing here changes the rules of the game.
(() => {
  const G = PI.gfx, cfg = PI.config;
  const Fx = PI.fx = {};
  const GRAVITY = 15, WHITE = [255, 252, 236], INK = G.pack(28, 27, 25);
  const GLYPH = {
    '+': ['.....', '..X..', '..X..', 'XXXXX', '..X..', '..X..', '.....'],
    1: ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
    2: ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
    3: ['XXXX.', '....X', '....X', '.XXX.', '....X', '....X', 'XXXX.'],
  };
  let parts = [], rings = [], texts = [], glows = [], beams = [];
  let shakeFor = 0, shakeLen = 1, shakeBy = 0, flashFor = 0, flashLen = 1, flashBy = 0;
  const calm = () => G.still();
  const rich = () => !calm();
  const pack = rgb => G.pack(rgb[0], rgb[1], rgb[2]);

  // A screen transition covers the view in black: amount 0 shows everything and 1 covers it all.
  // fade: a dither pattern fills in. iris: a circle closes on the centre. blinds: rows of bars thicken.
  const curtain = { kind: 'fade', amount: 0 };
  Fx.curtain = (kind, amount) => { curtain.kind = kind; curtain.amount = amount; };
  function drawCurtain() {
    const W = G.W, H = G.H, a = curtain.amount, col = G.col;
    if (a >= 1) { col.fill(INK); return; }
    if (curtain.kind === 'iris') {
      const cx = W / 2, cy = H / 2, r = (1 - a) * Math.hypot(cx, cy), rr = r * r;
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if ((px - cx) * (px - cx) + (py - cy) * (py - cy) > rr) col[py * W + px] = INK;
    } else if (curtain.kind === 'blinds') {
      const band = 12, fill = a * band;
      for (let py = 0; py < H; py++) if (py % band < fill) col.fill(INK, py * W, py * W + W);
    } else {
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if (G.dither(px, py) < a) col[py * W + px] = INK;
    }
  }
  Fx.reset = () => { parts = []; rings = []; texts = []; glows = []; beams = []; shakeFor = 0; flashFor = 0; };
  // n pixels thrown out of (x, y, z); power is their speed in units per second
  Fx.burst = (x, y, z, rgb, n = 10, power = 5) => {
    if (!rich()) n = Math.ceil(n / 3);
    const color = pack(rgb), pale = pack(rgb.map(v => v + (255 - v) * .6));
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = power * (.35 + Math.random() * .65);
      parts.push({
        x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .7, vz: 2 + Math.random() * power, g: 1,
        life: .4 + Math.random() * .45, color: k % 4 === 0 ? pale : color, size: Math.random() < .45 ? 2 : 1,
      });
    }
  };
  // twinkling sparks that drift upward
  Fx.sparks = (x, y, z, rgb, n = 6, spread = 1) => {
    if (!rich()) n = Math.ceil(n / 3);
    const color = pack(rgb);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * spread;
      parts.push({
        x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * .6, z: z + Math.random() * spread, vx: Math.cos(a) * .6, vy: 0, vz: 1.5 + Math.random() * 2.5, g: -.08,
        life: .5 + Math.random() * .6, color, size: 0, // size 0: drawn as a small cross that blinks
      });
    }
  };
  // a ring on the ground that grows from r0 to r1 units
  Fx.ring = (x, y, r0, r1, rgb = WHITE, seconds = .4) => rings.push({ x, y, r0, r1, t: 0, life: seconds, color: pack(rgb) });
  // a short text such as '+1' that pops up and floats away from a world point
  Fx.text = (x, y, z, text, rgb = [255, 214, 64]) => texts.push({ x, y, z, text: String(text), t: 0, color: pack(rgb) });
  // one frame of light around a world point: radius in game pixels, strength 0..1
  Fx.glow = (x, y, z, radius, strength) => glows.push({ x, y, z, radius, strength });
  // one frame of a pillar of light standing on a ground point: half-width in game pixels
  Fx.beam = (x, y, half, strength) => { if (rich()) beams.push({ x, y, half, strength }); };
  // the whole screen flashes white and fades
  Fx.flash = (amount, seconds = .25) => { if (rich()) { flashBy = amount; flashFor = flashLen = seconds; } };
  Fx.shake = (amount, seconds = .25) => {
    if (calm()) return;
    if (amount >= shakeBy * (shakeFor / shakeLen || 0)) { shakeBy = amount; shakeFor = shakeLen = seconds; }
  };
  // the camera offset of this frame, in game pixels
  Fx.offset = () => {
    if (shakeFor <= 0) return { x: 0, y: 0 };
    const k = shakeBy * shakeFor / shakeLen;
    return { x: Math.round((Math.random() * 2 - 1) * k), y: Math.round((Math.random() * 2 - 1) * k) };
  };
  Fx.update = dt => {
    if (shakeFor > 0) shakeFor -= dt;
    if (flashFor > 0) flashFor -= dt;
    for (const p of parts) {
      p.life -= dt; p.vz -= GRAVITY * p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z < 0) { p.z = 0; p.vz *= -.35; p.vx *= .5; p.vy *= .5; }
    }
    for (const r of rings) r.t += dt;
    for (const t of texts) t.t += dt;
    parts = parts.filter(p => p.life > 0);
    rings = rings.filter(r => r.t < r.life);
    texts = texts.filter(t => t.t < 1);
  };
  const put = (px, py, c) => { if (px >= 0 && py >= 0 && px < G.W && py < G.H) G.col[py * G.W + px] = c; };
  const light = (px, py, amount) => {
    if (amount > G.dither(px + G.offX, py + G.offY)) G.blend(py * G.W + px, WHITE, Math.min(.85, amount));
  };
  // light is drawn before the white bodies, so they stay crisp on top of it
  Fx.drawGlow = () => {
    for (const b of beams) {
      const cx = Math.round(G.sx(b.x)), base = Math.min(G.H - 1, Math.round(G.sy(b.y, 0)));
      for (let px = Math.max(0, cx - b.half); px <= Math.min(G.W - 1, cx + b.half); px++) {
        const side = 1 - Math.abs(px - cx) / (b.half + 1);
        for (let py = 0; py <= base; py++) light(px, py, side * b.strength * (.55 + .45 * py / (base + 1)));
      }
    }
    for (const g of glows) {
      const cx = Math.round(G.sx(g.x)), cy = Math.round(G.sy(g.y, g.z)), r = g.radius;
      for (let py = Math.max(0, Math.floor(cy - r * .8)); py <= Math.min(G.H - 1, Math.ceil(cy + r * .8)); py++) {
        for (let px = Math.max(0, Math.floor(cx - r)); px <= Math.min(G.W - 1, Math.ceil(cx + r)); px++) {
          const dx = (px - cx) / r, dy = (py - cy) / (r * .8), q = dx * dx + dy * dy;
          if (q < 1) light(px, py, (1 - q) * g.strength * 1.3);
        }
      }
    }
    glows = []; beams = [];
  };
  function drawText(t) {
    const big = t.t < .12 ? 2 : 1, rise = Math.round(8 + Math.min(1, t.t * 2.2) * 12 + (t.t < .25 ? Math.sin(t.t / .25 * Math.PI) * 4 : 0));
    const width = t.text.length * 6 * big;
    let left = Math.round(G.sx(t.x) - width / 2);
    const top = Math.round(G.sy(t.y, t.z)) - rise - 7 * big;
    if (t.t > .8 && Math.floor(t.t * 30) % 2) return; // blinks out
    for (const pass of [INK, t.color]) {
      let x0 = left;
      for (const ch of t.text) {
        const rows = GLYPH[ch];
        if (rows) for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) {
          if (rows[y][x] !== 'X') continue;
          for (let a = 0; a < big; a++) for (let b = 0; b < big; b++) {
            const px = x0 + x * big + a, py = top + y * big + b;
            if (pass === INK) { put(px - 1, py, INK); put(px + 1, py, INK); put(px, py - 1, INK); put(px, py + 1, INK); }
            else put(px, py, pass);
          }
        }
        x0 += 6 * big;
      }
    }
  }
  Fx.draw = () => {
    for (const r of rings) {
      const u = r.t / r.life;
      G.groundRing(r.x, r.y, r.r0 + (r.r1 - r.r0) * (1 - (1 - u) * (1 - u)), r.color, u > .6 ? 2 : 0, 0);
    }
    for (const p of parts) {
      const px = Math.round(G.sx(p.x)), py = Math.round(G.sy(p.y, p.z));
      if (p.size === 0) { // a spark: a dot, or a cross on every other beat
        put(px, py, p.color);
        if (Math.floor(p.life * 14) % 2) { put(px - 1, py, p.color); put(px + 1, py, p.color); put(px, py - 1, p.color); put(px, py + 1, p.color); }
        continue;
      }
      put(px, py, p.color);
      if (p.size === 2 && p.life > .2) { put(px + 1, py, p.color); put(px, py + 1, p.color); put(px + 1, py + 1, p.color); }
    }
    for (const t of texts) drawText(t);
    if (flashFor > 0) {
      const amount = flashBy * flashFor / flashLen * .8;
      for (let i = 0; i < G.W * G.H; i++) G.blend(i, WHITE, amount);
    }
    if (curtain.amount > 0) drawCurtain();
  };
})();
