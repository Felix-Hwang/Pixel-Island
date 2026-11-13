'use strict';
// Map 1: Tanjung Aru Beach at sunset. A wide beach: dunes along the back, warm sand, palm silhouettes with
// long shadows, and the glowing sea along the front. The sea is shallow; it can be waded all the way to the edge.
(() => {
  const G = PI.gfx, F = PI.flora, P = PI.props, I = PI.island;
  const pack = c => G.pack(c[0], c[1], c[2]);
  const SAND = [[222, 160, 118], [232, 174, 126], [240, 188, 136], [248, 202, 148]].map(pack);
  const WET = [[168, 116, 110], [184, 130, 116], [198, 144, 122]].map(pack);
  const SEA = [[80, 68, 132], [96, 80, 146], [116, 94, 156], [140, 108, 162], [170, 124, 160]].map(pack);
  const GLINT = [[244, 150, 96], [252, 196, 120]].map(pack);
  const FOAM = pack([255, 236, 220]);
  const DUNE = [[112, 104, 72], [140, 128, 78], [170, 150, 84], [198, 172, 96]].map(pack);
  const SUNSET_PALM = { bark: [84, 58, 66], leaf: [52, 74, 72] };
  const DUSK_BUSH = [[70, 84, 70], [104, 112, 74], [150, 140, 84]];
  const CLOTH = [[232, 92, 84], [70, 160, 196], [246, 186, 70], [90, 170, 130], [160, 96, 190]], CREAM = [250, 232, 200];

  const shoreAt = x => 45 + Math.sin(x * .12) * 2.2;       // the surf line along the front
  const duneAt = x => -45 + G.noise(x * .09, 7) * 9;       // behind this line the dunes are grassed
  const clearOf = (list, d) => (x, y) => list.every(p => Math.hypot(p.x - x, p.y - y) > d);
  // the layout: bars first, then palms, parasols and tide pools around them
  const bars = [{ x: -31, y: -31 }, { x: 6, y: -37 }, { x: 34, y: -24 }];
  const palms = I.spread(28, 31, 9, (x, y) => y < shoreAt(x) - 6 && clearOf(bars, 6)(x, y));
  const parasols = I.spread(15, 77, 10, (x, y) => y > -40 && y < shoreAt(x) - 9 && clearOf(bars, 6)(x, y) && clearOf(palms, 3)(x, y));
  const pools = I.spread(11, 55, 7, (x, y) => y > shoreAt(x) - 8 && y < shoreAt(x) - 2.5 && clearOf(palms, 3)(x, y), 5);

  const map = PI.registerMap({
    id: 'tanjung-aru', order: 1, seed: 11,
    scene: { shadowX: 2.1, shadowY: -.28, shadowTint: [.62, .45, .64], deepTint: [.44, .3, .5] }, // the sun is low, so shadows are long
    start: { x: 0, y: -2 },
    grass: [150, 138, 80], grassDensity: .2,
    shoreAt, crowns: [],

    ground(x, y, wx, wy, cell) {
      const shore = shoreAt(x) + (G.noise(x * .5, 3) - .5) * .9;
      if (y > shore) {
        const depth = y - shore;
        if (depth < .45 && G.rand2(wx, wy) > .3) return FOAM;
        if (G.noise(x * 1.1 + 5, y * 3.2) > .69) return GLINT[G.rand2(wx, wy) > .6 ? 1 : 0]; // the low sun on the water
        return G.pick(SEA, .85 - depth * .035 + (G.noise(x * .5, y * 1.5 + 9) - .5) * .5, wx, wy);
      }
      if (y > shore - 1.6) return G.pick(WET, G.noise(x * .8, y * 1.2) + (y - shore + 1.6) * .2, wx, wy);
      if (y < duneAt(x)) {
        cell.kind = G.KIND.GRASS;
        return G.pick(DUNE, G.noise(x * .7, y * .9) + (G.rand2(wx, wy) - .5) * .3, wx, wy, .5);
      }
      if (G.rand2(wx * 3, wy * 7) > .988) return SAND[3];
      const ripple = Math.sin(y * 4 + G.noise(x * .4, y) * 3) * .06;
      return G.pick(SAND, .5 + (G.noise(x * .6, y * .8) - .5) * .8 + ripple, wx, wy, .6);
    },

    props() {
      map.crowns.length = 0;
      palms.forEach((p, n) => {
        map.crowns.push(F.palm(p.x, p.y, 4 + G.rand2(n, 3) * .9, (n % 2 ? 1 : -1) * (.5 + G.rand2(n, 5) * .4), n * 1.7, SUNSET_PALM));
        I.addSolid({ x: p.x, y: p.y, r: .3 });
      });
      I.scatter(12, 210, 8, (x, y) => y > -38 && y < shoreAt(x) - 6, (x, y, n) => // beach towels
        P.box({ x, y, z0: 0, z1: .06, hx: .9, hy: .5, yaw: (n % 5 - 2) * .2 }, CLOTH[n % CLOTH.length], { grain: .3, topTone: 3.2 }));
      const log = G.ramp([120, 86, 70]);
      I.scatter(7, 260, 10, (x, y) => Math.abs(y - shoreAt(x) + 3.5) < 2, (x, y) => { // washed-up logs
        G.capsule(x, y, .22, x + 2.7, y + .4, .22, .24, .2, log, G.STYLE.ROUGH, G.KIND.PROP);
        G.shadowCapsule(x, y, .22, x + 2.7, y + .4, .22, .22, .2);
      });
      I.scatter(16, 300, 7, (x, y) => y < shoreAt(x) - 3, (x, y, n) => F.rock(x, y, .5 + (n % 3) * .12, [150, 112, 118], n));
      I.scatter(8, 420, 9, (x, y) => y > shoreAt(x) + 3, (x, y, n) => F.rock(x, y, .6 + (n % 3) * .15, [112, 92, 128], n)); // rocks in the surf
      I.scatter(22, 500, 5, (x, y) => y < duneAt(x) + 2, (x, y, n) => F.bush(x, y, .8 + (n % 2) * .15, n * 3, DUSK_BUSH));
    },

    // The numbers for the five interactions of this map. Change them here.
    interactions: {
      wave: { period: 6, reach: 10, push: 3, runUp: .9, runBack: 1.3 },
      'coconut-fall': { every: [.7, 1.6], warn: .8, stun: 1.5, radius: .9 },
      parasol: { reveal: 2.5, spots: parasols.map((p, n) => ({ x: p.x, y: p.y, a: CLOTH[n % CLOTH.length], b: n % 3 ? CREAM : CLOTH[(n + 2) % CLOTH.length] })) },
      'beach-bar': { wait: 1.5, boost: 1.3, time: 5, cooldown: 20, bars },
      'tide-pool': { speed: .6, sea: .75, pools: pools.map((p, n) => ({ x: p.x, y: p.y, rx: 2 + (n % 3) * .35, ry: 1.3 + (n % 2) * .25 })) },
    },
  });
})();
