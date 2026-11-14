'use strict';
// Pixel-art edges read from the kind and depth buffers. Ground pixels are never changed, so no shape gets a halo.
// A shape's own rim pixels are darkened where they meet the ground, and warmed where the shape overlaps another shape.
// A creature on dark ground gets a pale rim instead: a dark rim would vanish into the night map or deep water.
(() => {
  const G = PI.gfx, { KIND } = G;
  const STEP = .3, WARM = [255, 234, 178], PALE = [206, 216, 250], DARK_GROUND = 74;
  const light = c => ((c & 255) * 3 + (c >> 8 & 255) * 6 + (c >> 16 & 255)) / 10;
  G.outline = target => {
    const kinds = G.kind, dep = G.dep, W = G.W, H = G.H;
    for (let py = 1; py < H - 1; py++) for (let px = 1; px < W - 1; px++) {
      const i = py * W + px;
      if (kinds[i] !== target) continue;
      const up = i - W, down = i + W, left = i - 1, right = i + 1;
      const ground = kinds[up] < KIND.PROP ? up : kinds[down] < KIND.PROP ? down : kinds[left] < KIND.PROP ? left : kinds[right] < KIND.PROP ? right : -1;
      if (ground >= 0) {
        if (target === KIND.BODY && light(G.col[ground]) < DARK_GROUND) G.blend(i, PALE, .5);
        else G.mul(i, .64, .62, .76);
        continue;
      }
      const d = dep[i];
      if (d - dep[up] > STEP || d - dep[left] > STEP) G.blend(i, WARM, .26);
      else if (dep[right] - d > STEP || dep[down] - d > STEP) G.mul(i, .72, .7, .82);
    }
  };
})();
