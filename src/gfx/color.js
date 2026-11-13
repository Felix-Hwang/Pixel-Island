'use strict';
// Colour: packing, five-tone ramps with a hue shift, ordered dither, and value noise.
(() => {
  const G = PI.gfx;
  const VIOLET = [50, 38, 92], WARM = [255, 234, 178];
  const BRIGHT = [.42, .62, .83, 1, 1.12];
  const TO_VIOLET = [.36, .2, .07, 0, 0], TO_WARM = [0, 0, 0, 0, .24];
  const ramps = new Map();
  const byte = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;

  G.pack = (r, g, b) => (0xff000000 | byte(b) << 16 | byte(g) << 8 | byte(r)) >>> 0;
  G.unpack = c => [c & 255, c >> 8 & 255, c >> 16 & 255];
  // Returns five tones of one base colour: deep, shade, mid, base, light. The dark tones are shifted toward violet
  // and the light tone toward warm yellow.
  G.ramp = rgb => {
    const key = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
    let ramp = ramps.get(key);
    if (ramp) return ramp;
    ramp = new Uint32Array(5);
    for (let t = 0; t < 5; t++) {
      const tone = [0, 1, 2].map(k => {
        let v = rgb[k] * BRIGHT[t];
        v += (VIOLET[k] - v) * TO_VIOLET[t];
        v += (WARM[k] - v) * TO_WARM[t];
        return v;
      });
      ramp[t] = G.pack(tone[0], tone[1], tone[2]);
    }
    ramps.set(key, ramp);
    return ramp;
  };
  G.mul = (i, r, g, b) => {
    const c = G.col[i];
    G.col[i] = G.pack((c & 255) * r, (c >> 8 & 255) * g, (c >> 16 & 255) * b);
  };
  G.blend = (i, rgb, t) => {
    const c = G.col[i], r = c & 255, g = c >> 8 & 255, b = c >> 16 & 255;
    G.col[i] = G.pack(r + (rgb[0] - r) * t, g + (rgb[1] - g) * t, b + (rgb[2] - b) * t);
  };
  // 4x4 ordered dither threshold in 0..1
  const ORDER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  G.dither = (px, py) => (ORDER[(py & 3) << 2 | px & 3] + .5) / 16;
  // integer hash of (x, y), returned as a number from 0 to 1
  G.rand2 = (x, y) => {
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0;
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return ((n ^ n >>> 16) >>> 0) / 4294967296;
  };
  // value noise over a 256 x 256 lattice of random values (it repeats every 256 units, far beyond any map)
  const LATTICE = new Float32Array(65536);
  for (let i = 0; i < 65536; i++) LATTICE[i] = G.rand2(i & 255, i >> 8);
  const smooth = t => t * t * (3 - 2 * t);
  G.noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    const x0 = ix & 255, x1 = (ix + 1) & 255, r0 = (iy & 255) << 8, r1 = ((iy + 1) & 255) << 8;
    const a = LATTICE[r0 | x0], b = LATTICE[r0 | x1], c = LATTICE[r1 | x0], d = LATTICE[r1 | x1];
    return a + (b - a) * fx + (c - a + (a - b + d - c) * fx) * fy;
  };
  G.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  G.lerp = (a, b, t) => a + (b - a) * t;
  // pick one of a list of flat tones with dither between neighbours
  G.pick = (tones, v, px, py, spread = .7) => tones[G.clamp(Math.floor(v * tones.length + (G.dither(px, py) - .5) * spread), 0, tones.length - 1)];
})();
