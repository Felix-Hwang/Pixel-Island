'use strict';
// Parasol. A creature under a parasol is hidden, and hunters stop chasing it. A hunter within cfg.reveal units still sees it.
// cfg: spots [{ x, y, a, b }] (position and the two cloth colours), reveal (units)
PI.registerInteraction('tanjung-aru', 'parasol', {
  bake(cfg) {
    for (const s of cfg.spots) {
      s.r = 1.5;
      PI.props.parasol(s.x, s.y, s.a, s.b, s.r);
      PI.island.addCover(s.x, s.y, 1);
    }
  },
  modify(cfg, st, c, m) {
    for (const s of cfg.spots) if (PI.world.inCircle(c, s, -.2)) { m.hidden = true; m.reveal = cfg.reveal; return; }
  },
});
