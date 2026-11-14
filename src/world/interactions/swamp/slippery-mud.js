'use strict';
// Slippery mud. On the wet slopes a creature speeds up slowly and cannot stop or turn quickly.
// cfg: zones [{ x, y, rx, ry }], accel (factor on how fast velocity changes)
PI.registerInteraction('swamp', 'slippery-mud', {
  bake(cfg) {
    const G = PI.gfx, tone = [[70, 84, 100], [84, 100, 114], [104, 120, 132]].map(c => G.pack(c[0], c[1], c[2])), gloss = G.pack(150, 172, 196);
    for (const z of cfg.zones) {
      G.groundDisc(z.x, z.y, z.rx, z.ry, (i, wx, wy, t) => {
        const edge = t + (G.noise(wx * .25, wy * .4) - .5) * .35;
        if (edge > 1) return;
        const streak = G.noise(wx * .12 + wy * .5, wy * .08) > .7; // long wet streaks running down the slope
        G.col[i] = streak ? gloss : G.pick(tone, G.noise(wx * .15, wy * .5), wx, wy);
      });
    }
  },
  modify(cfg, st, c, m) {
    for (const z of cfg.zones) {
      const dx = (c.x - z.x) / z.rx, dy = (c.y - z.y) / z.ry;
      if (dx * dx + dy * dy < .85) { m.accel *= cfg.accel; return; }
    }
  },
});
