'use strict';
// Map 5: Mount Kinabalu. Rainforest green across the front of the map, bare granite across the back, with the
// summit spires along the far edge. The camera scrolls over it; there is no climbing or jumping.
// From the real mountain: the trail gate in the forest, the rest house at the treeline, the white rope of the
// summit trail, the twin horns of the Donkey's Ears, and rafflesia flowers in the foothills.
(() => {
  const G = PI.gfx, F = PI.flora, S = G.STYLE, K = G.KIND, I = PI.island, P = PI.props, M = PI.landmarks;
  const HUT = { x: 16, y: -15.5 }, EARS = { x: -24, y: -57 }, GATE = { x: 0, y: 34 };
  const ROPE = [[2, -11], [7, -20], [-3, -29], [4, -38], [-2, -47], [3, -55]]; // the summit trail
  const pack = c => G.pack(c[0], c[1], c[2]);
  const FOREST = [[38, 86, 56], [56, 110, 62], [82, 136, 70], [116, 158, 82]].map(pack);
  const SCREE = [[110, 116, 104], [130, 134, 120], [150, 152, 138]].map(pack);
  const GRANITE = [[126, 126, 138], [144, 144, 154], [162, 162, 170], [182, 182, 188]].map(pack);
  const CRACK = pack([92, 90, 108]), LICHEN = pack([170, 172, 120]);

  const treeline = x => -12 + Math.sin(x * .11) * 5;
  const high = (x, y) => y < treeline(x) - .8; // the high zone: bare rock above the treeline
  const clearOf = (list, d) => (x, y) => list.every(p => Math.hypot(p.x - x, p.y - y) > d);
  // the layout: summit spires, then walls on the rock and fog banks in the forest
  const spires = I.spread(9, 21, 9, (x, y) => y < -52 && clearOf([EARS], 6)(x, y), 5).concat(I.spread(12, 29, 14, (x, y) => high(x, y) && y > -50 && clearOf([HUT], 8)(x, y), 6));
  const walls = I.spread(16, 43, 11, (x, y) => high(x, y) && clearOf(spires, 5)(x, y) && clearOf([HUT], 8)(x, y), 7).map((p, n) => n % 2 ? { x: p.x, y: p.y, hx: 2 + (n % 3) * .3, hy: .45 } : { x: p.x, y: p.y, hx: .45, hy: 2 + (n % 3) * .2 });
  const fogs = I.spread(5, 67, 24, (x, y) => y > treeline(x) + 8, 10).map((p, n) => ({ x: p.x, y: p.y, rx: 5.5 + (n % 2), ry: 3.6 + (n % 2) * .5 }));

  PI.registerMap({
    id: 'kinabalu', order: 5, seed: 71,
    scene: { shadowX: 1.1, shadowY: -.12 },
    start: { x: 0, y: 18 },
    grass: [84, 138, 70], grassDensity: .17,
    treeline, high,

    ground(x, y, wx, wy, cell) {
      const line = treeline(x) + (G.noise(x * .5, y * .5) - .5) * 2.4, d = y - line;
      if (d > 1.4 || (d > 0 && G.dither(wx, wy) < d / 1.4)) {
        cell.kind = K.GRASS;
        return G.pick(FOREST, G.noise(x * .8, y * .9) + (G.rand2(wx, wy) - .5) * .35, wx, wy, .5);
      }
      if (d > -1.8) return G.pick(SCREE, G.noise(x * 1.5, y * 1.8), wx, wy); // loose stones between forest and rock
      const vein = G.noise(x * .4 + 11, y * .7);
      if (Math.abs(vein - .5) < .014) return CRACK;                // cracks run across the slabs
      if (G.rand2(wx * 3, wy * 7) > .992) return LICHEN;
      return G.pick(GRANITE, .5 + (G.noise(x * .25, y * .35) - .5) * .9 + (vein - .5) * .4, wx, wy, .6);
    },

    props() {
      const rock = G.ramp([150, 150, 162]), dark = G.ramp([120, 120, 136]);
      spires.forEach((p, n) => { // granite spires: the tallest stand along the far edge
        const far = p.y < -52, h = (far ? 4 : 2.2) + G.rand2(n, 7) * 1.4, r = (far ? 1.4 : .95) + G.rand2(n, 9) * .3;
        G.capsule(p.x, p.y, 0, p.x + (n % 2 ? .4 : -.3), p.y, h, r, r * .25, n % 2 ? rock : dark, S.DITHER, K.PROP);
        G.capsule(p.x + r * .9, p.y + .3, 0, p.x + r * .9, p.y + .3, h * .55, r * .6, r * .18, rock, S.DITHER, K.PROP);
        G.shadowCapsule(p.x, p.y, 0, p.x, p.y, h, r, r * .25);
        I.addSolid({ x: p.x, y: p.y, r: r * .9 });
        I.addCover(p.x, p.y + r + .8, 1.2);
      });
      M.rope(ROPE);
      P.post(ROPE[5][0] + 1.2, ROPE[5][1], 1.6, [236, 190, 70], { w: .55, h: .3 }); // the sign at the top of the trail
      M.restHouse(HUT.x, HUT.y);
      M.twinPeak(EARS.x, EARS.y);
      M.gate(GATE.x, GATE.y, 2.8, 3, [120, 90, 62], [156, 118, 82], [70, 122, 86]);
      I.scatter(7, 1200, 16, (x, y) => y > treeline(x) + 6, (x, y, n) => M.rafflesia(x, y, .65 + (n % 2) * .12));
      const offWalls = (x, y) => walls.every(w => Math.abs(x - w.x) > w.hx + 1.5 || Math.abs(y - w.y) > w.hy + 1.5);
      I.scatter(30, 150, 7, (x, y) => high(x, y) && offWalls(x, y), (x, y, n) => F.rock(x, y, .55 + (n % 3) * .12, [150, 150, 162], n));
      I.scatter(24, 330, 9, (x, y) => y > treeline(x) + 4, (x, y, n) => { F.tree(x, y, .8 + (n % 3) * .1, n * 3 + 2); I.addSolid({ x, y, r: .32 }); });
      I.scatter(36, 610, 5, (x, y) => y > treeline(x) + 3, (x, y, n) => F.bush(x, y, .7 + (n % 2) * .2, n * 2 + 3));
      I.scatter(36, 840, 5, (x, y) => y > treeline(x) + 2, (x, y, n) => F.reeds(x, y, .9, [74, 140, 78], 5, n * 5)); // ferns
    },

    interactions: {
      'cloud-platform': { clouds: [
        { y: -46, from: -38, to: 38, speed: 1.5, r: 2.2 }, { y: -30, from: 36, to: -36, speed: 1.3, r: 2.4 }, { y: -18, from: -30, to: 30, speed: 1.6, r: 2.1 },
        { y: 4, from: 38, to: -38, speed: 1.2, r: 2.4 }, { y: 22, from: -36, to: 36, speed: 1.4, r: 2.2 }, { y: 40, from: 34, to: -34, speed: 1.3, r: 2.3 }, { y: 54, from: -30, to: 30, speed: 1.5, r: 2.1 }] },
      'granite-wall': { walls },
      fog: { detect: .5, zones: fogs },
      'high-altitude': { speed: .75, food: 1 },
      'summit-flag': { food: 2, respawn: 20 },
    },
  });
})();
