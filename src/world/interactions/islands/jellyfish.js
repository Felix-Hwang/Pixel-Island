'use strict';
// Jellyfish. They move slowly over the shallows. Touching one stuns a creature for a moment.
// cfg: count, speed (units/s), stun (s), radius (units)
PI.registerInteraction('islands', 'jellyfish', {
  init(cfg, st) { st.list = []; },
  update(cfg, st, dt) {
    const Wd = PI.world, map = Wd.map, I = PI.island;
    const atSea = (x, y) => map.terrain(x, y) === 'sea' && I.edge(x, y) < .85;
    while (st.list.length < cfg.count) {
      const at = I.randomPoint(atSea), a = Math.random() * Math.PI * 2;
      st.list.push({ x: at.x, y: at.y, vx: Math.cos(a), vy: Math.sin(a), seed: Math.random() * 9 });
    }
    for (const j of st.list) {
      const nx = j.x + j.vx * cfg.speed * dt, ny = j.y + j.vy * cfg.speed * dt;
      if (atSea(nx, ny)) { j.x = nx; j.y = ny; }
      else { const a = Math.random() * Math.PI * 2; j.vx = Math.cos(a); j.vy = Math.sin(a); } // pick a new direction at the sand or the border
    }
    for (const c of Wd.creatures()) {
      if (Wd.cooling(c, 'jelly', dt)) continue;
      if (!st.list.some(j => Math.hypot(c.x - j.x, c.y - j.y) < cfg.radius + c.r * .4)) continue;
      Wd.stun(c, cfg.stun);
      Wd.cooldown(c, 'jelly', cfg.stun + 1.5);
    }
  },
  draw(cfg, st) {
    const G = PI.gfx, S = G.STYLE, K = G.KIND.BODY, bell = G.ramp([238, 156, 206]), arm = G.ramp([200, 130, 196]);
    const t = Math.floor(PI.state.time * 5) / 5;
    for (const j of st.list) {
      const pulse = Math.round(Math.sin(t * 2.4 + j.seed)) * .06, z = .75 + pulse;
      for (const dx of [-.2, 0, .2]) G.capsule(j.x + dx, j.y, z - .1, j.x + dx + Math.sin(t * 3 + dx * 9 + j.seed) * .1, j.y, .12, .07, .06, arm, S.FLAT, K);
      G.ball(j.x, j.y, z, .44, bell, S.FLAT, K, .75 - pulse);
      G.shadowBlob(j.x, j.y, .5, .4, 1);
    }
  },
});
