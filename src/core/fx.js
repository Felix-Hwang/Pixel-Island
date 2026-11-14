'use strict';
// Short effects that make a hit feel like a hit: bursts of pixels, rings, a number that floats up, a glow of
// light and screen shake. Nothing here changes the rules of the game.
(() => {
  const G = PI.gfx, S = PI.state;
  const Fx = PI.fx = {};
  const GRAVITY = 15, WHITE = [255, 252, 236];
  const GLYPH = {
    '+': ['...', '.X.', 'XXX', '.X.', '...'],
    1: ['.X.', 'XX.', '.X.', '.X.', 'XXX'],
    2: ['XX.', '..X', '.X.', 'X..', 'XXX'],
    3: ['XX.', '..X', '.X.', '..X', 'XX.'],
  };
  const INK = G.pack(28, 27, 25);
  let parts = [], rings = [], texts = [], glows = [], shakeFor = 0, shakeLen = 1, shakeBy = 0;
  const calm = () => G.still();

  Fx.reset = () => { parts = []; rings = []; texts = []; glows = []; shakeFor = 0; };
  // n pixels flying out of (x, y, z) in the colour rgb; power is their speed in units per second
  Fx.burst = (x, y, z, rgb, n = 10, power = 5) => {
    if (calm()) n = Math.ceil(n / 3);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = power * (.4 + Math.random() * .6);
      parts.push({
        x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .7, vz: 2 + Math.random() * power * .9,
        life: .35 + Math.random() * .35, color: G.pack(rgb[0], rgb[1], rgb[2]), big: Math.random() < .4,
      });
    }
  };
  // a ring on the ground that grows from r0 to r1 units
  Fx.ring = (x, y, r0, r1, rgb = WHITE, seconds = .4) => rings.push({ x, y, r0, r1, t: 0, life: seconds, color: G.pack(rgb[0], rgb[1], rgb[2]) });
  // a short text such as '+1' that floats up from a world point
  Fx.text = (x, y, z, text, rgb = [255, 220, 60]) => texts.push({ x, y, z, text: String(text), t: 0, color: G.pack(rgb[0], rgb[1], rgb[2]) });
  // one frame of light around a world point: radius in game pixels, strength 0..1
  Fx.glow = (x, y, z, radius, strength) => glows.push({ x, y, z, radius, strength });
  // shake the screen by up to amount game pixels. Off in the settings, and for people who asked for less motion.
  Fx.shake = (amount, seconds = .25) => {
    if (!PI.settings.on('shake') || calm()) return;
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
    for (const p of parts) {
      p.life -= dt; p.vz -= GRAVITY * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z < 0) { p.z = 0; p.vz *= -.35; p.vx *= .5; p.vy *= .5; }
    }
    for (const r of rings) r.t += dt;
    for (const t of texts) t.t += dt;
    parts = parts.filter(p => p.life > 0);
    rings = rings.filter(r => r.t < r.life);
    texts = texts.filter(t => t.t < .8);
  };
  const put = (px, py, c) => { if (px >= 0 && py >= 0 && px < G.W && py < G.H) G.col[py * G.W + px] = c; };
  // light first, so bodies drawn white stay crisp on top of it
  Fx.drawGlow = () => {
    for (const g of glows) {
      const cx = Math.round(G.sx(g.x)), cy = Math.round(G.sy(g.y, g.z)), r = g.radius;
      for (let py = Math.max(0, Math.floor(cy - r * .8)); py <= Math.min(G.H - 1, Math.ceil(cy + r * .8)); py++) {
        for (let px = Math.max(0, Math.floor(cx - r)); px <= Math.min(G.W - 1, Math.ceil(cx + r)); px++) {
          const dx = (px - cx) / r, dy = (py - cy) / (r * .8), q = dx * dx + dy * dy;
          if (q >= 1) continue;
          const amount = (1 - q) * g.strength * 1.3;
          if (amount > G.dither(px + G.offX, py + G.offY)) G.blend(py * G.W + px, WHITE, Math.min(.85, amount));
        }
      }
    }
    glows = [];
  };
  Fx.draw = () => {
    for (const r of rings) {
      const u = r.t / r.life;
      G.groundRing(r.x, r.y, r.r0 + (r.r1 - r.r0) * (1 - (1 - u) * (1 - u)), r.color, u > .6 ? 2 : 0, 0);
    }
    for (const p of parts) {
      const px = Math.round(G.sx(p.x)), py = Math.round(G.sy(p.y, p.z));
      put(px, py, p.color);
      if (p.big && p.life > .2) { put(px + 1, py, p.color); put(px, py + 1, p.color); put(px + 1, py + 1, p.color); }
    }
    for (const t of texts) {
      let left = Math.round(G.sx(t.x)) - t.text.length * 2, top = Math.round(G.sy(t.y, t.z) - 6 - Math.min(1, t.t * 3) * 9);
      for (const ch of t.text) {
        if (GLYPH[ch]) G.stamp(GLYPH[ch], left, top, { X: t.t > .6 ? INK : t.color });
        left += 4;
      }
    }
  };
})();
