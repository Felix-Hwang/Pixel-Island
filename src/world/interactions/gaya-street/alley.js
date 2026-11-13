'use strict';
// Narrow alley between the shophouses. Only creatures up to the level limit can enter, so a small player is
// safe from larger hunters inside it.
// cfg: zone { x, y, hx, hy }, maxLevel
PI.registerInteraction('gaya-street', 'alley', {
  bake(cfg) {
    const G = PI.gfx, z = cfg.zone, floor = [[96, 92, 108], [110, 106, 120], [124, 120, 130]].map(c => G.pack(c[0], c[1], c[2]));
    G.groundRect(z.x, z.y, z.hx, z.hy + .6, (i, wx, wy) => { G.col[i] = G.pick(floor, G.noise(wx * .4, wy * .6), wx, wy); });
    PI.island.addCover(z.x, z.y, 1);
    // a low bar across each mouth marks the size limit
    for (const end of [-1, 1]) PI.props.box({ x: z.x, y: z.y + end * (z.hy + .2), z0: 1.15, z1: 1.3, hx: z.hx, hy: .06, yaw: 0 }, [244, 190, 66], { grain: .3 });
  },
  blocks(cfg, st, c, x, y) {
    const z = cfg.zone;
    return c.lv > cfg.maxLevel && Math.abs(x - z.x) < z.hx + .3 && Math.abs(y - z.y) < z.hy + .4;
  },
});
