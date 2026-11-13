'use strict';
// Summit flag. A flag stands somewhere in the high zone. Touching it fills the gauge by cfg.food,
// and a new flag appears somewhere else later.
// cfg: food (gauge gained), respawn (s until the next flag)
PI.registerInteraction('kinabalu', 'summit-flag', {
  init(cfg, st) { st.flag = null; st.wait = 0; },
  update(cfg, st, dt) {
    const I = PI.island, map = PI.world.map, p = PI.ai.player();
    if (!st.flag) {
      st.wait -= dt;
      if (st.wait > 0) return;
      const at = I.randomPoint((x, y) => map.high(x, y) && I.edge(x, y) < .78 && (!p || Math.hypot(x - p.x, y - p.y) > 5));
      if (map.high(at.x, at.y)) st.flag = at;
      return;
    }
    if (!p || Math.hypot(p.x - st.flag.x, p.y - st.flag.y) > .6 + p.r * .5) return;
    st.flag = null; st.wait = cfg.respawn;
    PI.world.feed(p, cfg.food);
  },
  draw(cfg, st) {
    const f = st.flag, G = PI.gfx;
    if (!f || !G.visible(f.x, f.y, 30)) return;
    const K = G.KIND.BODY, flap = Math.floor(PI.state.time * 6) % 2 ? .08 : 0;
    G.capsule(f.x, f.y, 0, f.x, f.y, 1.9, .07, .07, G.ramp([230, 226, 216]), G.STYLE.FLAT, K);
    G.shadowCapsule(f.x, f.y, 0, f.x, f.y, 1.9, .08, .08);
    const cloth = { x: f.x + .45, y: f.y, z0: 1.35 + flap, z1: 1.9 + flap, hx: .42, hy: .05, yaw: 0 };
    G.box(cloth, G.ramp([226, 60, 52]), { kind: K, grain: .3 });
    G.shadowBlob(f.x + .45, f.y, 1.6, .35, 1);
  },
});
