'use strict';
// Summit flag. A flag of a random colour stands somewhere in the high zone. Touching it fills the gauge by cfg.food,
// and a new flag appears somewhere else later.
// cfg: food (gauge gained), respawn (s until the next flag)
PI.registerInteraction('mountain', 'summit-flag', {
  init(cfg, st) { st.flag = null; st.wait = 0; },
  update(cfg, st, dt) {
    const I = PI.island, map = PI.world.map, p = PI.ai.player();
    if (!st.flag) {
      st.wait -= dt;
      if (st.wait > 0) return;
      const at = I.randomPoint((x, y) => map.high(x, y) && I.edge(x, y) < .78 && (!p || Math.hypot(x - p.x, y - p.y) > 5));
      if (map.high(at.x, at.y)) st.flag = { x: at.x, y: at.y, rgb: PI.palette.rgb[PI.palette.random()] };
      return;
    }
    if (!p || Math.hypot(p.x - st.flag.x, p.y - st.flag.y) > 1.1 + p.r * .5) return;
    st.flag = null; st.wait = cfg.respawn;
    PI.world.feed(p, cfg.food);
    PI.audio.play('sfx_flag');
  },
  draw(cfg, st) {
    const f = st.flag, G = PI.gfx;
    if (!f || !G.visible(f.x, f.y, 30)) return;
    const K = G.KIND.BODY, flap = Math.floor(PI.state.time * 6) % 2 ? .08 : 0;
    G.capsule(f.x, f.y, 0, f.x, f.y, 3.6, .11, .1, G.ramp([230, 226, 216]), G.STYLE.FLAT, K);
    G.ball(f.x, f.y, 3.72, .16, G.ramp([250, 214, 90]), G.STYLE.GLOSS, K);
    G.shadowCapsule(f.x, f.y, 0, f.x, f.y, 3.6, .11, .1);
    const cloth = { x: f.x + .9, y: f.y, z0: 2.5 + flap, z1: 3.55 + flap, hx: .82, hy: .06, yaw: 0 };
    G.box(cloth, G.ramp(f.rgb), { kind: K, grain: .3 });
    G.shadowBlob(f.x + .9, f.y, 3, .7, 1);
  },
});
