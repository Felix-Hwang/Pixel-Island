'use strict';
// Pearl clam. It opens and closes on a fixed cycle. Touching it while it is open takes the pearl,
// and the clam then stays shut for a while.
// cfg: clams [{ x, y }], cycle (s open + shut), closed (s shut after its pearl is taken), food (gauge gained)
PI.registerInteraction('islands', 'pearl-clam', {
  init(cfg, st) { st.clams = cfg.clams.map((c, n) => ({ x: c.x, y: c.y, off: n * 1.3, shut: 0, open: false })); },
  update(cfg, st, dt) {
    const p = PI.state.player, t = PI.state.time;
    for (const clam of st.clams) {
      if (clam.shut > 0) { clam.shut -= dt; clam.open = false; continue; }
      clam.open = (t + clam.off) % cfg.cycle < cfg.cycle / 2;
      if (clam.open && p && !p.ride && Math.hypot(p.x - clam.x, p.y - clam.y) < .55 + p.r * .5) {
        clam.shut = cfg.closed; clam.open = false;
        PI.world.feed(p, cfg.food);
      }
    }
  },
  draw(cfg, st) {
    const G = PI.gfx, S = G.STYLE, K = G.KIND.BODY, shell = G.ramp([226, 198, 214]), inner = G.ramp([250, 232, 236]), pearl = G.ramp([255, 255, 255]);
    for (const c of st.clams) {
      G.ball(c.x, c.y, .14, .4, shell, S.FLAT, K, .45);
      if (c.open) {
        G.ball(c.x, c.y - .28, .5, .36, inner, S.FLAT, K, .9); // the lid stands up behind
        G.ball(c.x, c.y + .02, .3, .15, pearl, S.GLOSS, K);
      } else G.ball(c.x, c.y, .28, .38, shell, S.FLAT, K, .5);
      G.shadowBlob(c.x, c.y, 0, .4, 2);
    }
  },
});
