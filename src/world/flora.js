'use strict';
// Plants. Trunks and rocks are baked into the static frame; leaves are recorded once and swayed by the wind.
(() => {
  const G = PI.gfx, S = G.STYLE, K = G.KIND;
  const F = PI.flora = {};
  const BARK = [112, 88, 66], PALM = [74, 132, 76], PALM_DARK = [48, 96, 70], PALM_LIGHT = [112, 168, 84];

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
    // The crown: feathered fronds that arch up out of the top and bend down toward their tips. Each frond is a
    // thin spine with pairs of leaflets hanging from it, longest in the middle. Older fronds hang lower.
    const cx = x + lean, cz = h, fronds = 11;
    const tones = tint ? [tint.leaf.map(v => v * .78), tint.leaf, tint.leaf.map(v => Math.min(255, v * 1.28 + 8))] : [PALM_DARK, PALM, PALM_LIGHT];
    for (let f = 0; f < fronds; f++) {
      const a = f / fronds * Math.PI * 2 + seed + G.rand2(seed * 3 + f, 1) * .4, reach = 2.1 + G.rand2(seed * 7 + f, 3) * .7;
      const droop = .5 + G.rand2(seed * 5 + f, 4) * 1.1;
      const dx = Math.cos(a), dy = Math.sin(a) * .85, ax = -Math.sin(a), ay = Math.cos(a) * .85; // along and across the frond
      const spine = G.ramp(tones[0]), blade = G.ramp(tones[1 + f % 2]);
      const at = t => [cx + dx * reach * t, y + dy * reach * t, cz + .2 + Math.sin(t * Math.PI * .85) * .9 - t * t * droop];
      const mid = at(.55);
      G.leaf(mid[0], mid[1], mid[2], .5, () => {
        for (let k = 0; k < 7; k++) {
          const from = at(k / 7), to = at((k + 1) / 7), w = .38 * Math.sin(Math.min(1, (k + 1) / 7 * 1.25) * Math.PI) + .07;
          G.capsule(from[0], from[1], from[2], to[0], to[1], to[2], .1, .08, spine, S.DITHER, K.PROP);
          for (const side of [1, -1]) {
            G.capsule(to[0], to[1], to[2], to[0] + ax * w * side - dx * .12, to[1] + ay * w * side - dy * .12, to[2] - w * .5, .14, .06, blade, S.DITHER, K.PROP);
          }
          G.ball(to[0], to[1], to[2] + .03, .1 + w * .3, blade, S.DITHER, K.PROP); // the body of the frond
        }
      }, .8, false);
      for (let k = 0; k < 3; k++) { // the shadow of each frond is baked into the map
        const from = at(k / 3), to = at((k + 1) / 3);
        G.shadowCapsule(from[0], from[1], from[2], to[0], to[1], to[2], .32, .2);
      }
    }
    G.ball(cx, y, cz + .12, .3, G.ramp(tones[1]), S.DITHER, K.PROP);
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
  // ---------- small decoration: none of it is cover, and only logs, stumps and cairns are solid ----------
  // a patch of small flowers
  F.flowers = (x, y, rgb = [250, 220, 90], n = 6, seed = 0) => {
    const bloom = G.ramp(rgb), stem = G.ramp([70, 130, 70]);
    for (let k = 0; k < n; k++) {
      const fx = x + (G.rand2(seed + k, 21) - .5) * 1.5, fy = y + (G.rand2(seed + k, 22) - .5) * 1, h = .16 + G.rand2(seed + k, 23) * .14;
      G.capsule(fx, fy, 0, fx, fy, h, .05, .05, stem, S.FLAT, K.PROP);
      G.ball(fx, fy, h + .06, .1, bloom, S.FLAT, K.PROP);
    }
  };
  F.mushrooms = (x, y, rgb = [222, 86, 76], n = 3, seed = 0) => {
    const cap = G.ramp(rgb), stem = G.ramp([236, 226, 204]);
    for (let k = 0; k < n; k++) {
      const mx = x + (G.rand2(seed + k, 31) - .5) * .9, my = y + (G.rand2(seed + k, 32) - .5) * .6, h = .16 + G.rand2(seed + k, 33) * .16;
      G.capsule(mx, my, 0, mx, my, h, .07, .06, stem, S.FLAT, K.PROP);
      G.ball(mx, my, h + .05, .17 + h * .3, cap, S.DITHER, K.PROP, .6);
    }
    G.shadowBlob(x, y, .1, .4, 1);
  };
  // a fallen log lying at yaw, with a pale cut end
  F.log = (x, y, len = 2.4, yaw = .2, rgb = [118, 88, 68]) => {
    const dx = Math.cos(yaw) * len / 2, dy = Math.sin(yaw) * len / 2;
    G.capsule(x - dx, y - dy, .24, x + dx, y + dy, .24, .26, .23, G.ramp(rgb), S.ROUGH, K.PROP);
    G.ball(x + dx * 1.04, y + dy * 1.04, .24, .19, G.ramp(rgb.map(v => v + 60)), S.FLAT, K.PROP);
    G.shadowCapsule(x - dx, y - dy, .24, x + dx, y + dy, .24, .24, .22);
    PI.island.addSolid({ x, y, z0: 0, z1: .5, hx: len / 2, hy: .24, yaw });
  };
  F.stump = (x, y, r = .34, rgb = [112, 86, 66]) => {
    G.capsule(x, y, 0, x, y, .3, r, r * .92, G.ramp(rgb), S.ROUGH, K.PROP);
    G.ball(x, y, .36, r * .8, G.ramp(rgb.map(v => v + 62)), S.DITHER, K.PROP, .35);
    G.shadowBlob(x, y, .2, r, 1);
    PI.island.addSolid({ x, y, r: r * .9 });
  };
  // a pile of balanced stones, as hikers leave on bare rock
  F.cairn = (x, y, rgb = [156, 156, 166]) => {
    const ramp = G.ramp(rgb);
    for (const [z, r] of [[.22, .34], [.58, .25], [.86, .17]]) G.ball(x + (z > .5 ? .04 : 0), y, z, r, ramp, S.DITHER, K.PROP, .75);
    G.shadowBlob(x, y, .3, .34, 1);
    PI.island.addSolid({ x, y, r: .3 });
  };
  // shells and a starfish lying on sand
  F.shells = (x, y, seed = 0) => {
    const tones = [[250, 238, 224], [244, 176, 168], [236, 208, 150]];
    for (let k = 0; k < 3; k++) G.ball(x + (G.rand2(seed + k, 41) - .5) * 1.2, y + (G.rand2(seed + k, 42) - .5) * .8, .05, .09, G.ramp(tones[(seed + k) % 3]), S.GLOSS, K.PROP, .6);
    if (seed % 3 === 0) {
      const star = G.ramp([240, 128, 70]);
      for (let k = 0; k < 5; k++) G.ball(x + Math.cos(k * 1.257 + seed) * .16, y + .5 + Math.sin(k * 1.257 + seed) * .16, .04, .08, star, S.FLAT, K.PROP, .5);
      G.ball(x, y + .5, .05, .09, star, S.FLAT, K.PROP, .6);
    }
  };
  // a lily pad on water, sometimes with a flower
  F.lily = (x, y, r = .5, seed = 0) => {
    const pad = [G.pack(34, 92, 70), G.pack(48, 116, 82)];
    G.groundDisc(x, y, r, r * .8, (i, wx, wy, t) => { if (t < .92) G.col[i] = pad[t < .55 ? 1 : 0]; });
    if (seed % 2) G.ball(x + .1, y, .12, .13, G.ramp([244, 190, 214]), S.GLOSS, K.PROP);
  };
})();
