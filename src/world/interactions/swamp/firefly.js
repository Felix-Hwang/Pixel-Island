'use strict';
// Fireflies. At night the player sees clearly only inside a circle of light. Outside it, creatures are dark
// shapes with no stars. Collect enough fireflies and the circle widens for a few seconds.
// cfg: count, need (fireflies to collect), radius / bright (units of light), time (s the wide light lasts)
PI.registerInteraction('swamp', 'firefly', {
  init(cfg, st) { st.flies = []; st.have = 0; st.bright = 0; st.r = cfg.radius; },
  update(cfg, st, dt) {
    const I = PI.island, p = PI.ai.player();
    while (st.flies.length < cfg.count) {
      const at = I.randomPoint((x, y) => I.edge(x, y) < .8);
      st.flies.push({ x: at.x, y: at.y, seed: Math.random() * 9, wait: 0 });
    }
    if (st.bright > 0) st.bright -= dt;
    const want = st.bright > 0 ? cfg.bright : cfg.radius;
    st.r += (want - st.r) * Math.min(1, dt * 4); // the light grows and shrinks smoothly
    const t = PI.state.time;
    for (const f of st.flies) {
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.x += Math.cos(t * .7 + f.seed) * .5 * dt; f.y += Math.sin(t * .9 + f.seed * 2) * .4 * dt;
      if (!p || Math.hypot(p.x - f.x, p.y - f.y) > 1.3 + p.r * .5) continue;
      const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && Math.hypot(x - p.x, y - p.y) > 6);
      f.x = at.x; f.y = at.y; f.wait = 3; // it is caught, and a new one appears elsewhere 3 seconds later
      if (++st.have >= cfg.need) { st.have = 0; st.bright = cfg.time; PI.audio.play('sfx_light_grow'); }
      else PI.audio.play('sfx_firefly', { rate: 1 + (st.have - 1) * .1, gap: 0 }); // each one a little higher than the last
    }
  },
  dim(cfg, st, c) {
    const p = PI.ai.player();
    return !!p && !c.isPlayer && Math.hypot(c.x - p.x, c.y - p.y) > st.r;
  },
  drawOver(cfg, st) {
    const G = PI.gfx, p = PI.ai.player(), t = PI.state.time;
    if (p) { // darken every pixel outside the light
      const cx = G.sx(p.x), cy = G.sy(p.y, 0), rx = st.r * G.U, ry = rx * G.SIN;
      for (let py = 0; py < G.H; py++) {
        const ny = (py + .5 - cy) / ry, row = py * G.W;
        for (let px = 0; px < G.W; px++) {
          if (!G.kind[row + px]) continue;
          const nx = (px + .5 - cx) / rx, q = nx * nx + ny * ny;
          if (q > 1.12 || (q > .82 && G.dither(px + G.offX, py + G.offY) < (q - .82) / .3)) G.mul(row + px, .46, .5, .68);
        }
      }
    }
    const glow = G.pack(196, 240, 110), core = G.pack(250, 255, 200);
    for (const f of st.flies) {
      if (f.wait > 0 || !G.visible(f.x, f.y, 6)) continue;
      const on = Math.sin(t * 5 + f.seed * 3) > -.3, z = 1 + Math.sin(t * 1.3 + f.seed) * .3;
      G.stamp(on ? ['..X..', '.XoX.', 'XoooX', '.XoX.', '..X..'] : ['.X.', 'XoX', '.X.'], G.sx(f.x) - (on ? 2 : 1), G.sy(f.y, z) - (on ? 2 : 1), { X: glow, o: core }, false);
    }
    if (p) for (let k = 0; k < st.have; k++) { // one pixel above the player for each firefly collected
      G.stamp(['X'], G.sx(p.x) - st.have + k * 2, G.sy(p.y, PI.builder.headHeight(p)) - 12, { X: core }, false);
    }
  },
});
