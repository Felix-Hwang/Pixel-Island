'use strict';
// Tide. The water rises and falls on a fixed cycle. At low tide the sandbars to the islets are dry and fast.
// At high tide they are under water and wading across is slow.
// cfg: period (s for a full cycle), slow (speed factor on a flooded bar)
PI.registerInteraction('islands', 'tide', {
  init(cfg, st) { st.t = 0; st.level = 0; st.high = false; st.pixels = []; },
  // remember which map pixels belong to a sandbar, and how close each is to its edge
  bake(cfg, st) {
    const G = PI.gfx, map = PI.world.map;
    st.pixels = [];
    for (const b of map.bars) { // only the pixels around each bar need looking at
      const x0 = Math.max(0, Math.floor(G.sx(Math.min(b.ax, b.bx) - b.w - 1))), x1 = Math.min(G.W - 1, Math.ceil(G.sx(Math.max(b.ax, b.bx) + b.w + 1)));
      const y0 = Math.max(0, Math.floor(G.sy(Math.min(b.ay, b.by) - b.w - 1, 0))), y1 = Math.min(G.H - 1, Math.ceil(G.sy(Math.max(b.ay, b.by) + b.w + 1, 0)));
      for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
        if (G.kind[py * G.W + px] !== G.KIND.GROUND) continue;
        const g = G.toGround(px + .5, py + .5);
        if (map.sandAt(g.x, g.y) < 1) continue;
        const d = map.barAt(g.x, g.y);
        if (d < 1) st.pixels.push(px, py, d);
      }
    }
  },
  update(cfg, st, dt) {
    st.t += dt;
    st.level = .5 - .5 * Math.cos(st.t / cfg.period * Math.PI * 2); // 0 = low tide, 1 = high tide
    if (st.level > .55 !== st.high) { // the bars flood or fall dry
      st.high = !st.high;
      if (PI.state.phase === 'play') PI.audio.play('sfx_tide_change', { volume: .7 });
    }
  },
  modify(cfg, st, c, m) {
    if (st.level > .55 && PI.world.map.terrain(c.x, c.y) === 'bar') { m.speed *= cfg.slow; m.ground = 'water'; }
  },
  // the water covers each bar from its edges inward
  drawGround(cfg, st) {
    const G = PI.gfx, px = st.pixels, dry = 1.15 - st.level * 1.3; // pixels further out than this are under water
    const sea = [G.pack(70, 192, 182), G.pack(104, 212, 196), G.pack(150, 228, 210)], foam = G.pack(232, 250, 240);
    for (let n = 0; n < px.length; n += 3) {
      const d = px[n + 2];
      if (d < dry) continue;
      const vx = px[n] - G.offX, vy = px[n + 1] - G.offY;
      if (vx < 0 || vy < 0 || vx >= G.W || vy >= G.H) continue;
      G.col[vy * G.W + vx] = d - dry < .12 ? foam : sea[G.clamp(Math.floor((1.2 - (d - dry)) * 2 + G.dither(px[n], px[n + 1])), 0, 2)];
    }
  },
});
