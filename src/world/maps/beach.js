'use strict';
// Map: the beach at sunset. Dunes with needle trees along the back, warm sand, palms with long shadows, a
// jetty, fishing boats, and a shallow glowing sea along the front that can be waded to the edge.
(() => {
  const G = PI.gfx, F = PI.flora, P = PI.props, I = PI.island, M = PI.landmarks;
  const pack = c => G.pack(c[0], c[1], c[2]);
  const JETTY = { x: -14, y: 50.5, hx: 1, hy: 7.5 }, SUN_X = 12; // the sun sets straight out from x = 12
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
  const parasols = I.spread(15, 77, 10, (x, y) => y > -40 && y < shoreAt(x) - 9 && clearOf(bars, 7)(x, y) && clearOf(palms, 4)(x, y));
  const pools = I.spread(11, 55, 7, (x, y) => y > shoreAt(x) - 8 && y < shoreAt(x) - 2.5 && clearOf(palms, 3)(x, y), 5);

  const map = PI.registerMap({
    id: 'beach',
    scene: { shadowX: 2.1, shadowY: -.28, shadowTint: [.62, .45, .64], deepTint: [.44, .3, .5] }, // the sun is low, so shadows are long
    start: { x: 0, y: -2 },
    grass: [150, 138, 80], grassDensity: .2,
    shoreAt, crowns: [],
    steady: .3, // AI creatures push back against this share of the waves
    styles: { passive: { pace: .75, fear: 1.4 }, aggressive: { roam: 1.5 } },

    ground(x, y, wx, wy, cell) {
      const shore = shoreAt(x) + (G.noise(x * .5, 3) - .5) * .9;
      if (y > shore) {
        const depth = y - shore;
        if (depth < .45 && G.rand2(wx, wy) > .3) return FOAM;
        const sun = Math.max(0, 1 - Math.abs(x - SUN_X) / 13) * .2; // more glitter in the path of the sun
        if (G.noise(x * 1.1 + 5, y * 3.2) > .69 - sun) return GLINT[G.rand2(wx, wy) > .6 - sun ? 1 : 0]; // the low sun on the water
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
      M.planks(JETTY.x, JETTY.y, JETTY.hx, JETTY.hy, [150, 108, 88], false, 2.5);
      for (const side of [-1, 1]) M.lamp(JETTY.x + side * 1.25, JETTY.y + JETTY.hy - .4);
      [[21, 0, .25, [70, 130, 190]], [27.5, .6, -.2, [226, 92, 84]], [-31, .2, .15, [240, 232, 214]]].forEach(([x, dy, yaw, rgb]) =>
        I.addSolid(P.boat(x, shoreAt(x) - 3 + dy, yaw, rgb))); // fishing boats pulled up on the sand
      I.scatter(18, 140, 7, (x, y) => y < duneAt(x) + 5, (x, y, n) => M.casuarina(x, y, 5.4 + (n % 3) * .7, n));
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
      const onSand = (x, y) => y > duneAt(x) + 3 && y < shoreAt(x) - 4;
      I.scatter(9, 610, 12, onSand, (x, y, n) => { // young palms
        map.crowns.push(F.palm(x, y, 2.3 + G.rand2(n, 13) * .8, (n % 2 ? .4 : -.4), n * 2.9 + 4, SUNSET_PALM));
        I.addSolid({ x, y, r: .28 });
      });
      I.scatter(7, 640, 14, onSand, (x, y) => P.sandcastle(x, y));
      I.scatter(8, 670, 12, onSand, (x, y, n) => P.surfboard(x, y, CLOTH[n % CLOTH.length]));
      I.scatter(7, 700, 13, onSand, (x, y, n) => P.beachBall(x, y, CLOTH[(n + 1) % CLOTH.length]));
      I.scatter(40, 730, 4.5, (x, y) => y > duneAt(x) + 2 && y < shoreAt(x) - 1.8, (x, y, n) => F.shells(x, y, n));
      I.scatter(26, 760, 5, (x, y) => y < duneAt(x), (x, y, n) => F.flowers(x, y, [[250, 214, 120], [244, 150, 130], [240, 236, 220]][n % 3], 5, n * 7));
    },

    // The numbers for the five interactions of this map. Change them here.
    interactions: {
      wave: { period: 6, reach: 10, push: 3, runUp: .9, runBack: 1.3 },
      'coconut-fall': { every: [.7, 1.6], warn: .8, stun: 1.5, radius: 1.4 },
      parasol: { reveal: 2.5, spots: parasols.map((p, n) => ({ x: p.x, y: p.y, a: CLOTH[n % CLOTH.length], b: n % 3 ? CREAM : CLOTH[(n + 2) % CLOTH.length] })) },
      'beach-bar': { wait: 1.5, boost: 1.3, time: 5, cooldown: 20, bars },
      'tide-pool': { speed: .6, sea: .75, pools: pools.map((p, n) => ({ x: p.x, y: p.y, rx: 3 + (n % 3) * .4, ry: 2 + (n % 2) * .3 })) },
    },
  });
})();
