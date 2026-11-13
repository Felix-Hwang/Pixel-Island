'use strict';
// Rotten root bridge. Wading the river is slow and crossing on a bridge is not. A bridge breaks shortly after a
// creature steps on it, slows whoever was on it for a few seconds, and comes back later.
// cfg: bridges [{ y }], river (speed factor in the water), hold (s before it breaks), soak (s slowed after falling in),
//      slow (speed factor while soaked), restore (s until the bridge is back)
PI.registerInteraction('mangrove', 'rotten-bridge', {
  init(cfg, st) {
    const map = PI.world.map;
    st.bridges = cfg.bridges.map(b => ({ x: map.riverX(b.y), y: b.y, hx: map.riverWidth + 1, hy: .6, timer: 0, down: 0 }));
  },
  update(cfg, st, dt) {
    const Wd = PI.world, all = Wd.creatures();
    for (const c of all) if (c.fx.bridge && c.fx.bridge.soak > 0) c.fx.bridge.soak -= dt;
    for (const b of st.bridges) {
      if (b.down > 0) { b.down -= dt; continue; }
      const on = all.filter(c => Wd.inRect(c, b));
      if (on.length || b.timer > 0) b.timer += dt; // once the timer starts it keeps running, even if everyone steps off
      if (b.timer < cfg.hold) continue;
      b.timer = 0; b.down = cfg.restore;
      for (const c of on) Wd.fx(c, 'bridge').soak = cfg.soak;
    }
  },
  modify(cfg, st, c, m) {
    if (c.fx.bridge && c.fx.bridge.soak > 0) { m.speed *= cfg.slow; return; }
    if (!PI.world.map.inRiver(c.x, c.y)) return;
    if (st.bridges.some(b => !(b.down > 0) && PI.world.inRect(c, b))) return; // standing on an intact bridge
    m.speed *= cfg.river;
  },
  drawGround(cfg, st) {
    const G = PI.gfx, plank = [G.pack(104, 82, 70), G.pack(124, 98, 80)], rim = G.pack(60, 48, 52), t = PI.state.time;
    for (const b of st.bridges) {
      if (b.down > 0) { // only the broken ends are left on the banks
        for (const end of [-1, 1]) G.groundRect(b.x + end * (b.hx - .25), b.y, .25, b.hy, i => { G.col[i] = rim; });
        continue;
      }
      const shake = b.timer > 0 ? (Math.floor(t * 14) % 2 ? .08 : -.08) : 0; // the bridge shakes while its timer runs
      G.groundRect(b.x, b.y + shake, b.hx, b.hy, (i, wx, wy, u, v) => {
        G.col[i] = Math.abs(v) > .8 ? rim : plank[Math.floor((u + 1) * 5) % 2];
      });
    }
  },
});
