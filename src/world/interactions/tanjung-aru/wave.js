'use strict';
// Wave. Every few seconds the sea runs up the beach and pushes whatever it touches inland.
// cfg: period (s), reach (units up the beach), push (units carried), runUp / runBack (s)
PI.registerInteraction('tanjung-aru', 'wave', {
  init(cfg, st) { st.t = cfg.period * .55; st.reach = 0; st.id = 0; },
  update(cfg, st, dt) {
    st.t += dt;
    const Wd = PI.world, map = Wd.map, p = st.t % cfg.period, was = st.reach;
    let reach = 0;
    if (p < cfg.runUp) { const k = 1 - p / cfg.runUp; reach = cfg.reach * (1 - k * k); }
    else if (p < cfg.runUp + cfg.runBack) reach = cfg.reach * (1 - (p - cfg.runUp) / cfg.runBack);
    if (reach > 0 && was === 0) st.id++;
    st.reach = reach;
    if (reach <= was) return; // only the advancing water pushes
    for (const c of Wd.creatures()) {
      const shore = map.shoreAt(c.x), f = Wd.fx(c, 'wave');
      if (f.id === st.id || c.y < shore - reach || c.y > shore + 2) continue;
      f.id = st.id;
      Wd.knock(c, 0, -cfg.push * 6); // a knock of 6v travels about v units
    }
  },
  // a thin sheet of water with a foam line at its front, drawn in dither over the sand
  drawGround(cfg, st) {
    if (!st.reach) return;
    const G = PI.gfx, map = PI.world.map, FOAM = G.pack(255, 240, 226), WATER = [150, 128, 178], tick = st.t * 8 | 0;
    for (let px = 0; px < G.W; px++) {
      const x = (px + .5 - G.ox) / G.U, shore = map.shoreAt(x), wx = px + G.offX;
      const front = shore - st.reach + Math.sin(x * .9 + st.t * 2) * .25;
      const y0 = Math.max(0, Math.floor(G.sy(front, 0))), y1 = Math.min(G.H - 1, Math.ceil(G.sy(shore, 0)));
      for (let py = y0; py <= y1; py++) {
        const i = py * G.W + px, wy = py + G.offY;
        if (G.kind[i] !== G.KIND.GROUND && G.kind[i] !== G.KIND.GRASS) continue;
        if (py - y0 < 2) { if (G.rand2(wx, wy + tick) > .25) G.col[i] = FOAM; }
        else if (G.dither(wx, wy) > .3) G.blend(i, WATER, .42);
      }
    }
  },
});
