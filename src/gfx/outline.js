'use strict';
// Pixel-art edges read from the kind and depth buffers. Ground pixels are never changed, so no shape gets a halo.
// A shape's own rim pixels are darkened where they meet the ground, and warmed where the shape overlaps another shape.
(() => {
  const G = PI.gfx, { KIND } = G;
  const STEP = .3, WARM = [255, 234, 178];
  G.outline = target => {
    const kinds = G.kind, dep = G.dep, W = G.W, H = G.H;
    for (let py = 1; py < H - 1; py++) for (let px = 1; px < W - 1; px++) {
      const i = py * W + px;
      if (kinds[i] !== target) continue;
      const up = i - W, down = i + W, left = i - 1, right = i + 1;
      if (kinds[up] < KIND.PROP || kinds[down] < KIND.PROP || kinds[left] < KIND.PROP || kinds[right] < KIND.PROP) {
        G.mul(i, .64, .62, .76);
        continue;
      }
      const d = dep[i];
      if (d - dep[up] > STEP || d - dep[left] > STEP) G.blend(i, WARM, .26);
      else if (dep[right] - d > STEP || dep[down] - d > STEP) G.mul(i, .72, .7, .82);
    }
  };
})();
