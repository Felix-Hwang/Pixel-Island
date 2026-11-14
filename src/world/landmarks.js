'use strict';
// Things that belong to the real places in Kota Kinabalu the maps are named after: the casuarina trees and
// fishing jetty of Tanjung Aru, the arch, lanterns, shophouse fronts and Atkinson Clock Tower of Gaya Street,
// the jetty, beach pavilions and swim buoys of the marine park, the boardwalk and nipah palms of the mangrove,
// and the rest house, trail gate, summit rope and rafflesia of Mount Kinabalu. Map files call these while baking.
(() => {
  const G = PI.gfx, S = G.STYLE, K = G.KIND, I = PI.island, P = PI.props;
  const M = PI.landmarks = {};
  const POST = [98, 80, 64];
  const post = (x, y, h, r = .09, rgb = POST) => {
    G.capsule(x, y, 0, x, y, h, r, r * .9, G.ramp(rgb), S.ROUGH, K.PROP);
    G.shadowCapsule(x, y, 0, x, y, h, r, r * .9);
  };

  // A walkway of planks painted onto the ground, so it can be walked over and shadows fall on it.
  // alongX: the walkway runs left to right; otherwise front to back. rail: posts along both sides every `rail` units.
  M.planks = (x, y, hx, hy, rgb = [150, 114, 80], alongX = true, rail = 0) => {
    const tones = [0, 1, 2].map(k => G.pack(rgb[0] - 20 + k * 15, rgb[1] - 18 + k * 13, rgb[2] - 14 + k * 9));
    const gap = G.pack(rgb[0] * .52, rgb[1] * .5, rgb[2] * .55);
    G.groundRect(x, y, hx, hy, (i, wx, wy, u, v) => {
      const along = alongX ? (u + 1) * hx : (v + 1) * hy, board = Math.floor(along / .55);
      if (along / .55 - board < .16 || Math.abs(alongX ? v : u) > .9) { G.col[i] = gap; return; }
      G.col[i] = tones[(board * 7 + (G.rand2(wx >> 2, board) > .75 ? 1 : 0)) % 3];
    });
    if (rail) for (let d = -(alongX ? hx : hy); d <= (alongX ? hx : hy) + .01; d += rail) for (const side of [1, -1]) {
      post(alongX ? x + d : x + side * hx, alongX ? y + side * hy : y + d, .75);
    }
  };
  // a lamp on a post: a warm point of light for the night map and the jetties
  M.lamp = (x, y, h = 1.9) => {
    post(x, y, h, .07);
    G.ball(x, y, h + .16, .2, G.ramp([255, 208, 120]), S.GLOSS, K.PROP);
  };

  // Casuarina, the tree Tanjung Aru is named after (aru). A tall straight trunk with thin drooping needles.
  M.casuarina = (x, y, h = 6, seed = 0, colors = [[58, 78, 76], [80, 104, 88], [112, 130, 100]]) => {
    post(x, y, h, .22, [96, 72, 70]);
    for (let n = 0; n < 60; n++) {
      const k = n + seed * 19, t = .32 + G.rand2(k, 1) * .68, a = G.rand2(k, 2) * 6.283, d = (1 - t) * 1.5 + .25;
      const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .6, lz = h * t + .4;
      const ramp = G.ramp(colors[n % 3]);
      G.leaf(lx, ly, lz, .3, () => G.capsule(lx, ly, lz, lx + Math.cos(a) * .3, ly, lz - .7, .16, .07, ramp, S.DITHER, K.PROP), .9, n % 3 === 0);
    }
    I.addSolid({ x, y, r: .28 });
  };
  // Nipah palm of the river banks: no trunk, long fronds rising straight out of the mud.
  M.nipah = (x, y, scale = 1, seed = 0, colors = [[28, 72, 62], [42, 100, 76], [66, 126, 88]]) => {
    for (let f = 0; f < 7; f++) {
      const a = f / 7 * 6.283 + seed, reach = (1.1 + G.rand2(seed * 3 + f, 5) * .5) * scale, dx = Math.cos(a), dy = Math.sin(a) * .7;
      const mx = x + dx * reach * .45, my = y + dy * reach * .45, mz = 1.7 * scale, tx = x + dx * reach, ty = y + dy * reach, tz = 2 * scale;
      const ramp = G.ramp(colors[f % 3]);
      G.leaf(mx, my, mz, .35, () => {
        G.capsule(x, y, .1, mx, my, mz, .14, .13, ramp, S.DITHER, K.PROP);
        G.capsule(mx, my, mz, tx, ty, tz, .13, .06, ramp, S.DITHER, K.PROP);
      }, .6, f % 2 === 0);
    }
    I.addCover(x, y, 1.2 * scale);
  };
  // Rafflesia, the giant flower of the Kinabalu foothills: five fat red petals with pale warts around a dark bowl.
  M.rafflesia = (x, y, r = .7) => {
    const petal = G.ramp([196, 64, 44]), bowl = G.ramp([104, 34, 40]), wart = G.ramp([240, 196, 160]);
    for (let p = 0; p < 5; p++) {
      const a = p / 5 * 6.283 + .3, px = x + Math.cos(a) * r * .7, py = y + Math.sin(a) * r * .7;
      G.ball(px, py, .1, r * .52, petal, S.ROUGH, K.PROP, .4);
      G.ball(px + Math.cos(a) * r * .15, py, .24, .07, wart, S.FLAT, K.PROP);
    }
    G.ball(x, y, .14, r * .42, bowl, S.DITHER, K.PROP, .6);
    G.shadowBlob(x, y, .1, r, 1);
    I.addSolid({ x, y, r: r * .5 });
  };

  // A gate over a lane that runs front to back: two pillars and a tiled roof beam. Only the pillars are solid.
  M.gate = (x, y, span, h, pillar, beam, roof) => {
    for (const side of [-1, 1]) I.addSolid(P.box({ x: x + side * span, y, z0: 0, z1: h, hx: .34, hy: .34, yaw: 0 }, pillar, { grain: .5 }));
    P.box({ x, y, z0: h, z1: h + .55, hx: span + .5, hy: .3, yaw: 0 }, beam, { grain: .4, seed: 3 });
    P.box({ x, y, z0: h + .55, z1: h + .8, hx: span + 1, hy: .62, yaw: 0 }, roof, { grain: .7, seed: 5 });
    P.box({ x, y, z0: h + .8, z1: h + 1.05, hx: span * .62, hy: .42, yaw: 0 }, roof, { grain: .7, seed: 7 });
  };
  // a string of paper lanterns hanging over a street, from x0 to x1
  M.lanterns = (x0, x1, y, z = 2.9, rgb = [226, 52, 48]) => {
    const ramp = G.ramp(rgb), tassel = G.ramp([250, 200, 80]), n = Math.round(Math.abs(x1 - x0) / 2.1);
    for (let k = 0; k <= n; k++) {
      const x = x0 + (x1 - x0) * k / n, sag = Math.sin(k / n * Math.PI * (n / 4)) * .12;
      G.ball(x, y, z + sag, .2, ramp, S.GLOSS, K.PROP);
      G.ball(x, y, z + sag - .26, .06, tassel, S.FLAT, K.PROP);
      G.shadowBlob(x, y, z, .16, 1);
    }
  };
  // the front of a shophouse: shuttered windows upstairs, a door, and the awning over the covered walkway
  M.shopfront = (h, shutter, awning) => {
    const front = h.y + h.hy, n = Math.max(2, Math.round(h.hx / 1.1));
    for (let k = 0; k < n; k++) {
      const x = h.x - h.hx + (k + .5) * h.hx * 2 / n;
      P.box({ x, y: front + .04, z0: h.z1 * .55, z1: h.z1 * .86, hx: .26, hy: .04, yaw: 0 }, shutter, { grain: .2 });
      if (k % 2 === 0) P.box({ x, y: front + .04, z0: 0, z1: h.z1 * .36, hx: .3, hy: .04, yaw: 0 }, [96, 70, 56], { grain: .3 });
    }
    P.box({ x: h.x, y: front + .4, z0: h.z1 * .42, z1: h.z1 * .47, hx: h.hx, hy: .4, yaw: 0 }, awning, { grain: .5, seed: 2 });
  };
  // Atkinson Clock Tower: a white timber tower with a clock face and a pointed grey roof.
  M.clockTower = (x, y) => {
    const white = [255, 250, 232], slate = [98, 106, 124];
    I.addSolid(P.box({ x, y, z0: 0, z1: 3.4, hx: .95, hy: .95, yaw: 0 }, white, { grain: .5, seed: 1 }));
    P.box({ x, y, z0: 3.4, z1: 3.6, hx: 1.1, hy: 1.1, yaw: 0 }, slate, { grain: .4 });
    P.box({ x, y, z0: 3.6, z1: 5, hx: .72, hy: .72, yaw: 0 }, white, { grain: .5, seed: 4 });
    for (const [z, half] of [[5, .95], [5.3, .68], [5.6, .42], [5.9, .2]]) P.box({ x, y, z0: z, z1: z + .3, hx: half, hy: half, yaw: 0 }, slate, { grain: .4, seed: z });
    post(x, y, 7, .05, [70, 74, 90]);
    G.ball(x, y + .74, 4.3, .36, G.ramp([250, 246, 230]), S.FLAT, K.PROP); // the clock face
    G.ball(x, y + .9, 4.3, .09, G.ramp([40, 40, 52]), S.FLAT, K.PROP);
    P.box({ x, y: y + .97, z0: 0, z1: 1.3, hx: .3, hy: .03, yaw: 0 }, [96, 70, 56], { grain: .3 });
  };

  // a beach pavilion: four posts under a thatched roof, with a bench inside
  M.pavilion = (x, y, thatch = [200, 168, 100]) => {
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) post(x + a * 1.15, y + c * .8, 1.9, .09);
    I.addSolid(P.box({ x, y, z0: 0, z1: .45, hx: .8, hy: .3, yaw: 0 }, [150, 112, 76], { grain: .8 }));
    for (const [z, hx, hy] of [[1.9, 1.65, 1.25], [2.15, 1.2, .9], [2.4, .7, .5]]) P.box({ x, y, z0: z, z1: z + .26, hx, hy, yaw: 0 }, thatch, { grain: 1.4, seed: z * 3 });
    I.addCover(x, y + 1.6, 1.2);
  };
  // a line of swim-zone floats on the water around part of an ellipse (angles in radians, 0 = screen right)
  M.buoys = (cx, cy, rx, ry, from, to, ok) => {
    const n = Math.round((to - from) * Math.max(rx, ry) / 1.5), a = G.ramp([240, 120, 50]), b = G.ramp([250, 250, 244]);
    for (let k = 0; k <= n; k++) {
      const t = from + (to - from) * k / n, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry;
      if (ok && !ok(x, y)) continue;
      G.ball(x, y, .1, .17, k % 2 ? a : b, S.GLOSS, K.PROP);
    }
  };

  // a mountain rest house: pale walls, a row of windows and a green pitched roof
  M.restHouse = (x, y, hx = 3, hy = 1.5) => {
    const wall = [228, 224, 208], roof = [72, 124, 88];
    const b = I.addSolid(P.box({ x, y, z0: 0, z1: 2.1, hx, hy, yaw: 0 }, wall, { grain: .5, seed: 2 }));
    P.box({ x, y, z0: 2.1, z1: 2.4, hx: hx + .3, hy: hy + .3, yaw: 0 }, roof, { grain: .7, seed: 4 });
    P.box({ x, y, z0: 2.4, z1: 2.75, hx: hx + .1, hy: hy * .55, yaw: 0 }, roof, { grain: .7, seed: 6 });
    P.box({ x, y: y + hy + .03, z0: .25, z1: .5, hx, hy: .03, yaw: 0 }, [236, 190, 70], { grain: .2 }); // the yellow band along the wall
    for (let k = 0; k < 5; k++) P.box({ x: x - hx + (k + .5) * hx * .4, y: y + hy + .04, z0: 1, z1: 1.6, hx: .26, hy: .04, yaw: 0 }, [84, 110, 136], { grain: .2 });
    I.addCover(x, y + hy + 1.2, 1.3);
    return b;
  };
  // A rope laid on the rock from point to point, as on the summit trail. It is painted on the ground.
  M.rope = (points, rgb = [244, 244, 236]) => {
    const color = G.pack(rgb[0], rgb[1], rgb[2]);
    for (let s = 1; s < points.length; s++) {
      const a = points[s - 1], b = points[s], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let d = 0; d < len; d += .08) {
        if (Math.floor(d / .45) % 4 === 3) continue; // gaps make it read as a rope and not a road line
        const i = G.index(a[0] + (b[0] - a[0]) * d / len, a[1] + (b[1] - a[1]) * d / len, 0);
        if (i >= 0 && (G.kind[i] === K.GROUND || G.kind[i] === K.GRASS)) G.col[i] = color;
      }
      post(b[0], b[1], .55, .06, [150, 150, 160]); // an anchor stake at every bend
    }
  };
  // two leaning rock horns side by side, like the Donkey's Ears peak
  M.twinPeak = (x, y, h = 6) => {
    const rock = G.ramp([150, 150, 162]), dark = G.ramp([124, 124, 140]);
    G.capsule(x - .9, y, 0, x - 1.5, y, h, 1.2, .22, rock, S.DITHER, K.PROP);
    G.capsule(x + .9, y, 0, x + 1.6, y, h * .92, 1.1, .2, dark, S.DITHER, K.PROP);
    G.shadowCapsule(x - .9, y, 0, x - 1.5, y, h, 1.1, .22);
    G.shadowCapsule(x + .9, y, 0, x + 1.6, y, h * .92, 1, .2);
    I.addSolid({ x, y, r: 1.9 });
  };
})();
