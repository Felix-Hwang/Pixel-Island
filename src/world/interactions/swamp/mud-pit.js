'use strict';
// Mud pit. Deep mud pulls a creature toward its centre and cuts its speed.
// cfg: pits [{ x, y, r }], pull (units/s toward the centre), speed (factor inside)
PI.registerInteraction('swamp', 'mud-pit', {
  bake(cfg) {
    const G = PI.gfx, mud = [[34, 34, 46], [44, 44, 54], [56, 54, 62]].map(c => G.pack(c[0], c[1], c[2])), shine = G.pack(96, 104, 122);
    for (const p of cfg.pits) {
      G.groundDisc(p.x, p.y, p.r, p.r, (i, wx, wy, t) => {
        const edge = t + (G.noise(wx * .3, wy * .5) - .5) * .3;
        if (edge > 1) return;
        const ring = Math.abs((edge * 3) % 1 - .5) < .1 && G.rand2(wx, wy) > .45; // rings of wet mud around the centre
        G.col[i] = ring ? shine : G.pick(mud, 1 - edge * .8, wx, wy);
      });
    }
  },
  modify(cfg, st, c, m) {
    for (const p of cfg.pits) {
      const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
      if (d > p.r * .92) continue;
      m.speed *= cfg.speed;
      if (d > .15) { m.driftX += dx / d * cfg.pull; m.driftY += dy / d * cfg.pull; }
      return;
    }
  },
});
