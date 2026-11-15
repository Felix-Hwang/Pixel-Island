'use strict';
// Falling coconut. A shadow appears under a palm, then the nut drops. Whoever stands there is stunned.
// cfg: every [min, max] (s between drops), warn (s of shadow before the drop), stun (s), radius (units)
PI.registerInteraction('beach', 'coconut-fall', {
  init(cfg, st) { st.next = 2; st.nuts = []; },
  update(cfg, st, dt) {
    const Wd = PI.world, crowns = Wd.map.crowns;
    st.next -= dt;
    if (st.next <= 0 && crowns.length) {
      st.next = cfg.every[0] + Math.random() * (cfg.every[1] - cfg.every[0]);
      const c = crowns[Math.random() * crowns.length | 0];
      st.nuts.push({ x: c.x + (Math.random() - .5) * 1.6, y: c.y + .5 + Math.random() * 1.2, z: c.z - .3, vz: 0, t: -cfg.warn, done: 0 });
    }
    for (let n = st.nuts.length - 1; n >= 0; n--) {
      const nut = st.nuts[n];
      nut.t += dt;
      if (nut.t < 0) continue;       // still only a shadow
      if (nut.done) { nut.done += dt; if (nut.done > 1.2) st.nuts.splice(n, 1); continue; }
      nut.vz -= 22 * dt; nut.z += nut.vz * dt;
      if (nut.z > .22) continue;
      nut.z = .22; nut.done = .001;
      for (const c of Wd.creatures()) if (Math.hypot(c.x - nut.x, c.y - nut.y) < cfg.radius + c.r * .5) Wd.stun(c, cfg.stun);
    }
  },
  draw(cfg, st) {
    const G = PI.gfx, ramp = G.ramp([112, 78, 50]);
    for (const nut of st.nuts) {
      if (nut.t < 0) { G.shadowBlob(nut.x, nut.y, 0, .4 + (1 + nut.t / cfg.warn) * .7, 2); continue; } // the warning shadow grows
      G.ball(nut.x, nut.y, nut.z + .2, .46, ramp, G.STYLE.GLOSS, G.KIND.BODY);
      G.shadowBlob(nut.x, nut.y, 0, .5, 2);
    }
  },
});
