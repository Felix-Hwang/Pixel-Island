'use strict';
// Tide pool. Shallow water left on the wet sand. Wading through it is slow, and so is wading in the sea itself.
// cfg: pools [{ x, y, rx, ry }], speed (factor in a pool), sea (factor in the sea)
PI.registerInteraction('tanjung-aru', 'tide-pool', {
  bake(cfg) {
    const G = PI.gfx, water = [[96, 116, 168], [116, 138, 182], [142, 160, 196]].map(c => G.pack(c[0], c[1], c[2])), rim = G.pack(150, 104, 104);
    for (const p of cfg.pools) {
      G.groundDisc(p.x, p.y, p.rx, p.ry, (i, wx, wy, t) => {
        const edge = t + (G.noise(wx * .3, wy * .5) - .5) * .25;
        if (edge > 1) return;
        G.col[i] = edge > .86 ? rim : G.pick(water, .9 - edge * .7 + (G.noise(wx * .2, wy * .6) - .5) * .3, wx, wy);
      });
    }
  },
  modify(cfg, st, c, m) {
    if (c.y > PI.world.map.shoreAt(c.x) + .4) { m.speed *= cfg.sea; return; }
    for (const p of cfg.pools) {
      const dx = (c.x - p.x) / p.rx, dy = (c.y - p.y) / p.ry;
      if (dx * dx + dy * dy < .8) { m.speed *= cfg.speed; return; }
    }
  },
});
