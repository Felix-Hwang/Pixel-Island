'use strict';
// Map 3: Tunku Abdul Rahman Marine Park. A white sand island and four islets in shallow emerald water.
// The renderer has no transparency, so the water is all colour and dither. The whole sea is shallow, so every part
// of the map can be waded. Two sandbars join the big island to its nearest islets at low tide.
(() => {
  const G = PI.gfx, F = PI.flora, P = PI.props, I = PI.island;
  const pack = c => G.pack(c[0], c[1], c[2]);
  const SAND = [[230, 222, 198], [240, 233, 210], [247, 242, 224], [253, 250, 238]].map(pack);
  const DAMP = [[206, 204, 178], [218, 214, 188], [228, 224, 198]].map(pack);
  const SEA = [[30, 132, 156], [40, 154, 166], [52, 174, 174], [74, 194, 184], [106, 214, 198], [150, 228, 210]].map(pack);
  const SPARK = pack([214, 246, 232]);
  const ISLES = [{ x: 0, y: -6, rx: 22, ry: 26 }, { x: 34, y: 37, rx: 7, ry: 6 }, { x: -34, y: 33, rx: 6, ry: 5.5 }, { x: -33, y: -43, rx: 6, ry: 5 }, { x: 33, y: -39, rx: 5.5, ry: 5 }];
  const BARS = [{ ax: 14, ay: 15, bx: 29, by: 32.5, w: 1.3 }, { ax: -14, ay: 14.5, bx: -29.5, by: 29, w: 1.3 }];

  // < 1 on dry sand
  function sandAt(x, y) {
    const wobble = (G.noise(x * .17 + 5, y * .15) - .5) * .2;
    let best = 9;
    for (const s of ISLES) best = Math.min(best, Math.hypot((x - s.x) / s.rx, (y - s.y) / s.ry) + wobble * (s.rx > 10 ? 1 : .5));
    return best;
  }
  // 0 on the centre line of a sandbar .. 1 at its edge, or 2 when not on one
  function barAt(x, y) {
    for (const b of BARS) {
      const dx = b.bx - b.ax, dy = b.by - b.ay, t = G.clamp(((x - b.ax) * dx + (y - b.ay) * dy) / (dx * dx + dy * dy), 0, 1);
      const raw = Math.hypot(x - b.ax - dx * t, y - b.ay - dy * t);
      if (raw > b.w + .3) continue; // nowhere near this bar
      const d = raw / (b.w + (G.noise(x * .8, y * .8) - .5) * .4);
      if (d < 1) return d;
    }
    return 2;
  }
  const terrain = (x, y) => sandAt(x, y) < 1 ? 'sand' : barAt(x, y) < 1 ? 'bar' : 'sea';
  const clams = I.spread(16, 61, 9, (x, y) => { const s = sandAt(x, y); return s > .86 && s < 1.12; });

  const map = PI.registerMap({
    id: 'marine-park', order: 3, seed: 37,
    scene: { shadowX: 1.2, shadowY: -.1, shadowTint: [.6, .62, .8] },
    start: { x: 0, y: -6 },
    centre: ISLES[0], bars: BARS, sandAt, barAt, terrain,

    ground(x, y, wx, wy) {
      const s = sandAt(x, y);
      if (s < 1) {
        if (s > .92) return G.pick(DAMP, G.noise(x * .9, y * 1.1) + (s - .92) * 4, wx, wy);
        if (G.rand2(wx * 5, wy * 3) > .99) return SAND[0]; // shells and pebbles
        return G.pick(SAND, .55 + (G.noise(x * .5, y * .7) - .5) * .7 + Math.sin(x * 3 + y * 1.5) * .04, wx, wy, .6);
      }
      if (barAt(x, y) < 1) return G.pick(DAMP, G.noise(x * .9, y * 1.1), wx, wy);
      if (s < 1.04 && G.rand2(wx, wy) > .4) return SPARK; // a line of foam on the beach
      if (G.noise(x * 1.3 + 2, y * 3.4) > .74) return SPARK;
      const depth = G.clamp((s - 1) * .55, 0, 1); // paler near the sand, deeper out between the islands
      return G.pick(SEA, .95 - depth * .8 + (G.noise(x * .45, y * 1.3 + 4) - .5) * .3, wx, wy, .9);
    },

    props() {
      I.scatter(11, 70, 9, (x, y) => sandAt(x, y) < .75, (x, y, n) => {
        F.palm(x, y, 3.9 + G.rand2(n, 3) * .7, (n % 2 ? 1 : -1) * (.5 + G.rand2(n, 5) * .4), n * 1.3 + 1);
        I.addSolid({ x, y, r: .3 });
      });
      I.scatter(16, 100, 5, (x, y) => sandAt(x, y) < .8, (x, y, n) => F.bush(x, y, .7 + (n % 2) * .15, n * 3));
      I.scatter(20, 240, 9, (x, y) => terrain(x, y) === 'sea' && sandAt(x, y) > 1.2, (x, y, n) => F.rock(x, y, .55 + (n % 3) * .12, [146, 150, 156], n));
      // coral gardens in the shallows
      const coral = [[240, 116, 124], [250, 164, 96], [226, 120, 190], [250, 210, 110]];
      I.scatter(60, 400, 5, (x, y) => terrain(x, y) === 'sea' && sandAt(x, y) > 1.15, (x, y, n) => {
        F.reeds(x, y, .7, coral[n % coral.length], 5, n * 3);
        I.addCover(x, y, 1);
      });
      I.scatter(6, 800, 8, (x, y) => sandAt(x, y) < .7, (x, y, n) => // beach towels
        P.box({ x, y, z0: 0, z1: .06, hx: .9, hy: .5, yaw: (n % 5 - 2) * .2 }, [[240, 116, 124], [70, 150, 190], [246, 186, 70]][n % 3], { grain: .3, topTone: 3.2 }));
    },

    interactions: {
      current: { strength: .4, turn: 1 },
      tide: { period: 15, slow: .5 },
      'pearl-clam': { cycle: 4, closed: 12, food: 1, clams },
      jellyfish: { count: 18, speed: .9, stun: 1.5, radius: .7 },
      'boat-ride': { wait: 1, time: 4, docks: [{ x: 22.6, y: -10, out: [1, 0] }, { x: 33, y: -33.2, out: [0, 1] }], via: { x: 42, y: -18 } },
    },
  });
})();
