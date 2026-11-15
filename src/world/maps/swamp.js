'use strict';
// Map: the swamp at night. Moonlit mud, moss and stilt roots, a river winding from back to front, lamp-lit
// boardwalks and moored boats. The player only sees clearly inside a circle of light (see the firefly interaction).
(() => {
  const G = PI.gfx, F = PI.flora, I = PI.island, P = PI.props, M = PI.landmarks;
  const pack = c => G.pack(c[0], c[1], c[2]);
  const MUD = [[54, 62, 74], [66, 76, 84], [80, 90, 94], [96, 106, 104]].map(pack);
  const BANK = [[40, 48, 62], [50, 58, 70]].map(pack);
  const MOSS = [[24, 60, 60], [34, 80, 68], [50, 102, 76], [74, 124, 86]].map(pack);
  const RIVER = [[22, 38, 80], [30, 52, 98], [42, 68, 118]].map(pack);
  const MOON = pack([156, 186, 224]);
  const NIGHT_LEAF = [[22, 58, 60], [34, 84, 72], [58, 112, 86]];

  const riverX = y => 6 + Math.sin(y * .07 + .6) * 20, riverWidth = 2.4;
  // signed distance to the river: negative inside
  const riverAt = (x, y) => Math.abs(x - riverX(y)) - riverWidth - (G.noise(x * .5, y * .5) - .5) * .6;
  const clearOf = (list, d) => (x, y) => list.every(p => Math.hypot(p.x - x, p.y - y) > d);
  const WALKS = [{ x: -30.5, y: -26, hx: 13.5 }, { x: 33.5, y: 26, hx: 10.5 }]; // boardwalks, running left to right
  const offWalk = (x, y) => WALKS.every(w => Math.abs(y - w.y) > 2.4 || Math.abs(x - w.x) > w.hx + 1.5);
  const offBridge = y => Math.abs(y - Math.round(y / 17) * 17) > 2.6; // the bridges cross the river every 17 units
  const dry = (x, y) => riverAt(x, y) > 3 && offWalk(x, y);
  // the layout: shelters, then pits and slopes around them
  const shelters = I.spread(7, 41, 26, dry, 7);
  const pits = I.spread(9, 63, 20, (x, y) => dry(x, y) && clearOf(shelters, 8)(x, y), 6);
  const slopes = I.spread(9, 87, 20, (x, y) => dry(x, y) && clearOf(shelters, 9)(x, y) && clearOf(pits, 8)(x, y), 7);

  PI.registerMap({
    id: 'swamp',
    scene: { shadowX: .85, shadowY: -.05, shadowTint: [.6, .64, .86], deepTint: [.44, .48, .72] }, // short moon shadows
    start: { x: -12, y: 0 },
    grass: [50, 104, 78], grassDensity: .13,
    riverX, riverWidth, riverAt,
    inRiver: (x, y) => riverAt(x, y) < 0,
    styles: { passive: { notice: .45, fear: 1.2 }, neutral: { notice: .85 }, aggressive: { notice: 1.05, stamina: 1.3 } }, // it is dark

    ground(x, y, wx, wy, cell) {
      const r = riverAt(x, y);
      if (r < 0) {
        if (G.noise(x * 2.2, y * .9 + 3) > .76) return MOON; // moonlight on the water
        return G.pick(RIVER, .5 + (G.noise(x * .9, y * .4) - .5) * .9 - r * .08, wx, wy, .9);
      }
      if (r < .55) return BANK[G.dither(wx, wy) > r / .55 ? 0 : 1];
      if (G.noise(x * .14 + 9, y * .15) > .55) {
        cell.kind = G.KIND.GRASS;
        return G.pick(MOSS, G.noise(x * .8, y * .9) + (G.rand2(wx, wy) - .5) * .3, wx, wy, .5);
      }
      if (G.rand2(wx * 3, wy * 5) > .99) return MUD[3];
      return G.pick(MUD, .5 + (G.noise(x * .6, y * .8) - .5) * .9, wx, wy, .6);
    },

    props() {
      const open = (x, y) => riverAt(x, y) > 1.8 && offWalk(x, y) && clearOf(shelters, 6)(x, y) && clearOf(pits, 4.6)(x, y) && clearOf(slopes, 5.6)(x, y);
      for (const w of WALKS) {
        M.planks(w.x, w.y, w.hx, .9, [98, 90, 96], true);
        for (let x = w.x - w.hx + 1; x < w.x + w.hx; x += 6.3) M.lamp(x, w.y - 1.1, 1.7);
      }
      for (const y of [-8.5, 42.5]) { // river cruise boats
        const hull = I.addSolid(P.boat(riverX(y) + .3, y, 1.5, [176, 70, 64]));
        G.ball(hull.x, hull.y - .6, 1, .2, G.ramp([255, 208, 120]), G.STYLE.GLOSS, G.KIND.PROP);
      }
      I.scatter(24, 990, 6, (x, y) => riverAt(x, y) > .5 && riverAt(x, y) < 3.2 && offWalk(x, y) && offBridge(y), (x, y, n) => M.nipah(x, y, .9 + (n % 3) * .12, n * 2.1, NIGHT_LEAF));
      I.scatter(46, 120, 8, open, (x, y, n) => {
        F.mangrove(x, y, .85 + (n % 4) * .1, n * 2.3, NIGHT_LEAF);
        I.addSolid({ x, y, r: .3 });
      });
      I.scatter(26, 520, 7, open, (x, y, n) => F.rock(x, y, .5 + (n % 3) * .1, [82, 90, 104], n));
      I.scatter(44, 760, 5, (x, y) => riverAt(x, y) > .3 && riverAt(x, y) < 7, (x, y, n) => F.reeds(x, y, 1.1, [48, 100, 84], 5, n * 7));
      I.scatter(34, 1030, 5, open, (x, y, n) => F.mushrooms(x, y, [[120, 214, 196], [200, 150, 236], [236, 206, 120]][n % 3], 2 + n % 3, n * 5)); // pale caps that catch the moonlight
      I.scatter(26, 1060, 3.2, (x, y) => riverAt(x, y) < -.5 && offBridge(y), (x, y, n) => F.lily(x, y, .42 + (n % 3) * .08, n));
      I.scatter(12, 1090, 9, open, (x, y, n) => F.log(x, y, 2 + (n % 3) * .5, n * .9, [70, 62, 66]));
      I.scatter(12, 1120, 9, open, (x, y) => F.stump(x, y, .34, [78, 68, 68]));
      I.scatter(30, 1150, 5, open, (x, y, n) => F.flowers(x, y, [[170, 200, 240], [220, 220, 250]][n % 2], 4, n * 11));
    },

    interactions: {
      firefly: { count: 30, need: 5, radius: 5.5, bright: 9.5, time: 8 },
      'mud-pit': { pull: 1.1, speed: .3, pits: pits.map((p, n) => ({ x: p.x, y: p.y, r: 2.6 + (n % 3) * .2 })) },
      'rotten-bridge': { river: .4, hold: 2, soak: 3, slow: .4, restore: 10, bridges: [-51, -34, -17, 0, 17, 34, 51].map(y => ({ y })) },
      'tree-rest': { safe: 3, cooldown: 20, spots: shelters.map(p => ({ x: p.x, y: p.y, r: 2.2 })) },
      'slippery-mud': { accel: .12, zones: slopes.map((p, n) => ({ x: p.x, y: p.y, rx: 4.4 + (n % 3) * .4, ry: 2.8 + (n % 2) * .3 })) },
    },
  });
})();
