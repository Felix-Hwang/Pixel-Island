'use strict';
// Fog bank. Inside one, every creature's detection range is cut. This applies to hunters and prey.
// cfg: zones [{ x, y, rx, ry }], detect (factor on detection range)
PI.registerInteraction('mountain', 'fog', {
  inside(z, x, y) { const dx = (x - z.x) / z.rx, dy = (y - z.y) / z.ry; return dx * dx + dy * dy < 1; },
  bake(cfg) { // blend the ground under the fog toward white
    const G = PI.gfx, pale = [226, 230, 236];
    for (const z of cfg.zones) {
      G.groundDisc(z.x, z.y, z.rx, z.ry, (i, wx, wy, t) => {
        const edge = t + (G.noise(wx * .12, wy * .25) - .5) * .4;
        if (edge < 1 && G.dither(wx, wy) > edge * edge * .8) G.blend(i, pale, .6);
      });
    }
  },
  modify(cfg, st, c, m) { if (cfg.zones.some(z => this.inside(z, c.x, c.y))) m.detect *= cfg.detect; },
  // bodies inside the fog are partly covered with moving dithered white
  drawOver(cfg) {
    const G = PI.gfx, t = Math.floor(PI.state.time * 4) / 4, veil = [236, 238, 244];
    for (const z of cfg.zones) {
      const x0 = Math.max(0, Math.floor(G.sx(z.x - z.rx))), x1 = Math.min(G.W - 1, Math.ceil(G.sx(z.x + z.rx)));
      const y0 = Math.max(0, Math.floor(G.sy(z.y - z.ry, 2))), y1 = Math.min(G.H - 1, Math.ceil(G.sy(z.y + z.ry, 0)));
      for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
        const i = py * G.W + px, wx = px + G.offX, wy = py + G.offY;
        if (G.kind[i] !== G.KIND.BODY) continue;
        if (G.noise(wx * .08 + t * .6, wy * .3) > .45 && G.dither(wx, wy) > .35) G.blend(i, veil, .7);
      }
    }
  },
});
