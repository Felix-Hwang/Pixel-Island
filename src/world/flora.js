'use strict';
// Plants. Trunks and rocks are baked into the static frame; leaves are recorded once and swayed by the wind.
(() => {
  const G = PI.gfx, S = G.STYLE, K = G.KIND;
  const F = PI.flora = {};
  const BARK = [112, 88, 66], PALM = [74, 132, 76], PALM_DARK = [48, 96, 70];

  // h: trunk height. lean: how far the top drifts sideways. Returns the crown position (coconuts fall from it).
  F.palm = (x, y, h = 4.4, lean = .7, seed = 0, tint = null) => {
    const bark = G.ramp(tint ? tint.bark : BARK), n = 6;
    let px = x, pz = 0;
    for (let i = 1; i <= n; i++) {
      const t = i / n, qx = x + lean * t * t, qz = h * t;
      G.capsule(px, y, pz, qx, y, qz, .3 - t * .12, .28 - t * .12, bark, S.ROUGH, K.PROP);
      G.shadowCapsule(px, y, pz, qx, y, qz, .26 - t * .1, .24 - t * .1);
      px = qx; pz = qz;
    }
    const cx = x + lean, cz = h, fronds = 8;
    for (let f = 0; f < fronds; f++) {
      const a = f / fronds * Math.PI * 2 + seed, reach = 1.9 + G.rand2(seed * 7 + f, 3) * .5;
      const dx = Math.cos(a), dy = Math.sin(a) * .9;
      const ramp = G.ramp(tint ? tint.leaf : (f % 3 === 0 ? PALM_DARK : PALM));
      const mx = cx + dx * reach * .55, my = y + dy * reach * .55, mz = cz + .35;
      const tx = cx + dx * reach, ty = y + dy * reach, tz = cz - .75;
      G.leaf(mx, my, mz, .5, () => {
        G.capsule(cx, y, cz, mx, my, mz, .17, .15, ramp, S.DITHER, K.PROP);
        G.capsule(mx, my, mz, tx, ty, tz, .15, .07, ramp, S.DITHER, K.PROP);
      }, .8, false);
      G.shadowCapsule(cx, y, cz, mx, my, mz, .2, .18); // the shadow of each frond is baked into the map
      G.shadowCapsule(mx, my, mz, tx, ty, tz, .18, .1);
    }
    G.ball(cx - .15, y + .12, cz - .2, .2, G.ramp([116, 84, 52]), S.GLOSS, K.PROP);
    G.ball(cx + .18, y + .1, cz - .28, .2, G.ramp([104, 76, 48]), S.GLOSS, K.PROP);
    return { x: cx, y, z: cz };
  };

  // a broadleaf tree: forked trunk under a crown of leaf clumps. colors: [deep, mid, light] base RGBs.
  F.tree = (x, y, scale = 1, seed = 0, colors = [[52, 92, 60], [84, 132, 72], [128, 164, 92]], count = 150) => {
    const bark = G.ramp(BARK), s = scale;
    const limb = (a, b, ra, rb) => { G.capsule(a[0], a[1], a[2], b[0], b[1], b[2], ra * s, rb * s, bark, S.ROUGH, K.PROP); G.shadowCapsule(a[0], a[1], a[2], b[0], b[1], b[2], ra * s, rb * s); };
    const fork = [x + .2 * s, y, 2 * s];
    limb([x, y, 0], fork, .34, .22);
    limb(fork, [x - .9 * s, y - .2 * s, 3.1 * s], .2, .13);
    limb(fork, [x + 1.1 * s, y + .2 * s, 3.2 * s], .2, .13);
    const clumps = [[.1, 0, 3.6, 1.5], [-1.3, -.3, 3.2, 1.1], [1.5, .3, 3.3, 1.2], [-.5, .5, 4, 1.1], [.8, -.4, 4.2, 1.1], [.2, 0, 4.9, .95]];
    for (let n = 0; n < count; n++) {
      const k = n + seed * 31, [cx, cy, cz, spread] = clumps[n % clumps.length];
      const a = G.rand2(k, 7) * 6.283, tilt = G.rand2(k, 8) * 2 - 1, d = Math.cbrt(G.rand2(k, 9)) * spread, flat = Math.sqrt(1 - tilt * tilt);
      const lx = x + (cx + Math.cos(a) * flat * d) * s, ly = y + (cy + Math.sin(a) * flat * d * .7) * s, lz = (cz + tilt * d * .75) * s;
      const tone = G.rand2(k, 10) + (lz / s - 4.1) * .22 + (d / spread - .5) * .3;
      const ramp = G.ramp(tone > .72 ? colors[2] : tone > .3 ? colors[1] : colors[0]), r = (.26 + G.rand2(k, 11) * .22) * s;
      G.leaf(lx, ly, lz, .42 * s, () => G.ball(lx, ly, lz, r, ramp, S.ROUGH, K.PROP), 1, n % 2 === 0);
    }
    PI.island.addCover(x, y + .6, 1.6 * s);
  };

  // mangrove: a short trunk standing on arched stilt roots, with a low dark crown
  F.mangrove = (x, y, scale = 1, seed = 0, colors = [[30, 70, 66], [44, 98, 80], [72, 128, 92]]) => {
    const bark = G.ramp([84, 70, 62]), s = scale, top = 1.5 * s;
    for (let r = 0; r < 6; r++) {
      const a = r / 6 * Math.PI * 2 + seed, reach = (1 + G.rand2(seed * 5 + r, 2) * .5) * s;
      const ex = x + Math.cos(a) * reach, ey = y + Math.sin(a) * reach * .8;
      const kx = x + Math.cos(a) * reach * .6, ky = y + Math.sin(a) * reach * .5, kz = top * .75;
      G.capsule(x, y, top, kx, ky, kz, .11 * s, .1 * s, bark, S.ROUGH, K.PROP);
      G.capsule(kx, ky, kz, ex, ey, 0, .1 * s, .08 * s, bark, S.ROUGH, K.PROP);
      G.shadowCapsule(kx, ky, kz, ex, ey, 0, .09 * s, .08 * s);
    }
    G.capsule(x, y, top, x + .1 * s, y, top + 1.2 * s, .22 * s, .16 * s, bark, S.ROUGH, K.PROP);
    G.shadowCapsule(x, y, top, x + .1 * s, y, top + 1.2 * s, .2 * s, .15 * s);
    for (let n = 0; n < 70; n++) {
      const k = n + seed * 17, a = G.rand2(k, 3) * 6.283, d = Math.sqrt(G.rand2(k, 4)) * 1.5 * s;
      const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .7, lz = top + (1.4 + G.rand2(k, 5) * .9) * s - d * .25;
      const tone = G.rand2(k, 6) + (lz - top - 1.8 * s) * .3;
      const ramp = G.ramp(tone > .7 ? colors[2] : tone > .3 ? colors[1] : colors[0]), r = (.26 + G.rand2(k, 7) * .2) * s;
      G.leaf(lx, ly, lz, .4 * s, () => G.ball(lx, ly, lz, r, ramp, S.ROUGH, K.PROP), .8, n % 2 === 0);
    }
    PI.island.addCover(x, y + .4, 1.4 * s);
  };

  // a low bush. It is registered as cover for the lurk behaviour.
  F.bush = (x, y, r = .8, seed = 0, colors = [[52, 96, 58], [86, 138, 70], [134, 170, 88]]) => {
    for (let n = 0; n < 9; n++) {
      const k = n + seed * 13, a = G.rand2(k, 1) * 6.283, d = G.rand2(k, 2) * r * .7;
      const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .6, lz = .3 + G.rand2(k, 3) * r * .55;
      const ramp = G.ramp(colors[n % 3]), br = r * (.35 + G.rand2(k, 4) * .2);
      G.leaf(lx, ly, lz, br, () => G.ball(lx, ly, lz, br, ramp, S.ROUGH, K.PROP), .5, n < 4);
    }
    PI.island.addCover(x, y, r + .5);
  };

  F.rock = (x, y, r = .6, rgb = [150, 146, 150], seed = 0) => {
    const ramp = G.ramp(rgb);
    G.ball(x, y, r * .45, r, ramp, S.DITHER, K.PROP, .7);
    G.ball(x + r * .55, y + r * .2, r * .3, r * .6, ramp, S.DITHER, K.PROP, .7);
    if (seed % 2) G.ball(x - r * .5, y + r * .3, r * .22, r * .45, ramp, S.DITHER, K.PROP, .7);
    G.shadowBlob(x, y, r * .5, r, 1);
    G.shadowBlob(x + r * .55, y + r * .2, r * .3, r * .6, 1);
  };

  // a tuft of tall reeds or coral fingers: thin leaf blades that sway
  F.reeds = (x, y, h = 1.1, rgb = [96, 142, 82], count = 5, seed = 0) => {
    const ramp = G.ramp(rgb);
    for (let n = 0; n < count; n++) {
      const ox = (G.rand2(seed + n, 1) - .5) * .7, oy = (G.rand2(seed + n, 2) - .5) * .4, hh = h * (.7 + G.rand2(seed + n, 3) * .5);
      G.leaf(x + ox, y + oy, hh * .7, .1, () => G.capsule(x + ox, y + oy, 0, x + ox + .15, y + oy, hh, .09, .06, ramp, S.DITHER, K.PROP), .7, false);
    }
  };
})();
