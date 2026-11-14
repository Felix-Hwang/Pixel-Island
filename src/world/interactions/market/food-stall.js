'use strict';
// Street-food stall. Wait in front of one and get fed. Then the cooks need time before they serve you again.
// cfg: stalls [{ x, y }], wait (s), food (gauge gained), cooldown (s)
PI.registerInteraction('market', 'food-stall', {
  init(cfg) { for (const s of cfg.stalls) s.zone = { x: s.x, y: s.y + 2, r: 1.3 }; }, // the waiting spot in front of the counter
  bake(cfg) {
    const G = PI.gfx, P = PI.props, pot = G.ramp([88, 88, 100]);
    cfg.stalls.forEach((s, n) => {
      PI.island.addSolid(P.stall(s.x, s.y, 1.6, .75, [170, 120, 76], [250, 240, 226], 0, 21 + n));
      P.box({ x: s.x, y: s.y, z0: 2.45, z1: 2.6, hx: .9, hy: .55, yaw: 0 }, [226, 70, 64], { grain: .4, seed: 2 }); // red stripe on the roof
      G.ball(s.x - .6, s.y - .1, 1.1, .32, pot, G.STYLE.GLOSS, G.KIND.PROP, .7);
      for (const dx of [.3, .8]) G.ball(s.x + dx, s.y - .1, 1.02, .16, G.ramp([232, 170, 80]), G.STYLE.GLOSS, G.KIND.PROP); // buns on the counter
    });
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    for (const c of Wd.creatures()) {
      const f = Wd.fx(c, 'food');
      if (Wd.cooling(c, 'food', dt)) { f.dwell = 0; continue; }
      if (Wd.dwell(c, 'food', cfg.stalls.some(s => Wd.inCircle(c, s.zone)), dt) >= cfg.wait) { f.dwell = 0; Wd.cooldown(c, 'food', cfg.cooldown); Wd.feed(c, cfg.food); }
    }
  },
  drawGround(cfg) {
    const p = PI.state.player, G = PI.gfx, f = p && p.fx.food;
    if (f && f.cool > 0) return; // still cooking
    for (const s of cfg.stalls) G.groundRing(s.zone.x, s.zone.y, s.zone.r, 0xffffffff, f && f.dwell > 0 ? 0 : 2, Math.floor(PI.state.time * 4));
  },
  // steam rises from the pots while a portion is ready
  drawOver(cfg) {
    const p = PI.state.player, G = PI.gfx;
    if (p && p.fx.food && p.fx.food.cool > 0) return;
    const t = Math.floor(PI.state.time * 6);
    for (const s of cfg.stalls) {
      const x = G.sx(s.x - .6), y = G.sy(s.y - .1, 1.5);
      for (let k = 0; k < 3; k++) G.stamp(['X'], x + ((t + k) % 3) - 1, y - ((t + k * 2) % 6), { X: 0xffffffff }, false);
    }
  },
});
