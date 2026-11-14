'use strict';
// Beach bar. Wait in front of a bar for a drink and run faster for a few seconds. Then the bars are closed to you for a while.
// cfg: bars [{ x, y }], wait (s), boost (speed factor), time (s), cooldown (s)
PI.registerInteraction('beach', 'beach-bar', {
  init(cfg) { for (const b of cfg.bars) b.zone = { x: b.x, y: b.y + 1.9, r: 1.3 }; }, // the waiting spot in front of the counter
  bake(cfg) {
    const G = PI.gfx, P = PI.props, bottle = [[90, 160, 120], [226, 150, 60], [200, 80, 90]];
    cfg.bars.forEach((b, n) => {
      PI.island.addSolid(P.stall(b.x, b.y, 1.6, .7, [150, 104, 70], [[236, 110, 84], [84, 160, 170], [240, 180, 80]][n % 3], 0, 4 + n));
      P.crate(b.x + 2.3, b.y + .3, .35, [140, 100, 66], .4, 2 + n);
      for (let k = 0; k < 3; k++) G.capsule(b.x - .9 + k * .9, b.y + .3, .95, b.x - .9 + k * .9, b.y + .3, 1.3, .1, .06, G.ramp(bottle[k]), G.STYLE.GLOSS, G.KIND.PROP);
    });
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    for (const c of Wd.creatures()) {
      const f = Wd.fx(c, 'bar');
      if (f.boost > 0) f.boost -= dt;
      if (Wd.cooling(c, 'bar', dt)) { f.dwell = 0; continue; }
      if (Wd.dwell(c, 'bar', cfg.bars.some(b => Wd.inCircle(c, b.zone)), dt) >= cfg.wait) { f.boost = cfg.time; f.dwell = 0; Wd.cooldown(c, 'bar', cfg.cooldown); }
    }
  },
  modify(cfg, st, c, m) { if (c.fx.bar && c.fx.bar.boost > 0) m.speed *= cfg.boost; },
  // The ring at each waiting spot is dashed while a bar will serve the player and solid while the player waits.
  drawGround(cfg) {
    const p = PI.state.player, G = PI.gfx, f = p && p.fx.bar;
    if (f && f.cool > 0) return;
    for (const b of cfg.bars) G.groundRing(b.zone.x, b.zone.y, b.zone.r, G.pack(255, 244, 214), f && f.dwell > 0 ? 0 : 2, Math.floor(PI.state.time * 4));
  },
  // chevrons over a creature that is running on a drink
  drawOver() {
    const G = PI.gfx, mark = ['X.X', '.X.'], pal = { X: G.pack(255, 214, 60) };
    for (const c of PI.state.all()) if (c.seen && c.fx.bar && c.fx.bar.boost > 0 && !c.dim) {
      G.stamp(mark, G.sx(c.x) + 10, G.sy(c.y, PI.builder.headHeight(c)) - 7 - (Math.floor(PI.state.time * 6) % 2), pal);
    }
  },
});
