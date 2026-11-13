'use strict';
// Tree shelter. A deck among the roots of a large mangrove. For a few seconds inside it nothing can eat you.
// Then you have to stay away for a while before it works again.
// cfg: spots [{ x, y, r }], safe (s of protection), cooldown (s)
PI.registerInteraction('mangrove', 'tree-rest', {
  bake(cfg) {
    const G = PI.gfx, deck = [G.pack(92, 76, 70), G.pack(112, 92, 80)], rim = G.pack(56, 46, 54);
    for (const s of cfg.spots) {
      G.groundDisc(s.x, s.y, s.r, s.r, (i, wx, wy, t) => { G.col[i] = t > .86 ? rim : deck[(wy >> 1) % 2]; }); // a round plank deck
      PI.flora.mangrove(s.x - s.r - .6, s.y - .8, 1.25, s.x * 3, [[22, 58, 60], [34, 84, 72], [58, 112, 86]]);
      PI.island.addSolid({ x: s.x - s.r - .6, y: s.y - .8, r: .3 });
    }
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    for (const c of Wd.creatures()) {
      const f = Wd.fx(c, 'rest'), inside = cfg.spots.some(s => Wd.inCircle(c, s));
      f.safe = false;
      if (Wd.cooling(c, 'rest', dt)) continue;
      if (!inside) { if (f.used > 0) { f.used = 0; Wd.cooldown(c, 'rest', cfg.cooldown); } continue; } // leaving early still uses it up
      f.used = (f.used || 0) + dt;
      if (f.used >= cfg.safe) { f.used = 0; Wd.cooldown(c, 'rest', cfg.cooldown); } else f.safe = true;
    }
  },
  modify(cfg, st, c, m) { if (c.fx.rest && c.fx.rest.safe) m.safe = true; },
  // A dashed ring means the shelter will protect the player. A solid ring means it is protecting them now.
  // No ring means it is on cooldown.
  drawGround(cfg) {
    const G = PI.gfx, p = PI.state.player, f = p && p.fx.rest;
    if (f && f.cool > 0) return;
    for (const s of cfg.spots) G.groundRing(s.x, s.y, s.r, G.pack(220, 236, 255), f && f.safe ? 0 : 2, Math.floor(PI.state.time * 4));
  },
});
