'use strict';
// Map 2: Gaya Street on Sunday. Three streets and two cross lanes of a market town in daylight: rows of roofed
// stalls and open tables, signboards, shophouses, hawkers, and a park along the front. The only map with people on it.
// From the real street: the arch gates at the ends of the lanes, strings of red lanterns, shophouse fronts with
// shutters and awnings, and the Atkinson Clock Tower in the park.
(() => {
  const G = PI.gfx, F = PI.flora, P = PI.props, I = PI.island, M = PI.landmarks;
  const pack = c => G.pack(c[0], c[1], c[2]);
  const SHUTTERS = [[66, 118, 126], [150, 74, 62], [84, 110, 70]], TOWER = { x: -2, y: 54 };
  const STREET = [[132, 128, 136], [146, 142, 148], [158, 154, 158], [170, 166, 168]].map(pack);
  const JOINT = pack([112, 108, 120]);
  const WALK = [[204, 186, 158], [214, 197, 168], [224, 208, 178], [232, 218, 190]].map(pack);
  const SEAM = pack([186, 168, 144]);
  const LAWN = [[70, 112, 66], [92, 134, 72], [120, 152, 80], [150, 170, 92]].map(pack);
  const ROOFS = [[226, 84, 76], [64, 140, 200], [244, 190, 66], [90, 170, 110], [236, 132, 60], [160, 96, 190]];
  const TILES = [[168, 84, 66], [150, 98, 84], [108, 120, 138], [186, 108, 74]];
  const WALLS = [[216, 190, 150], [176, 196, 204], [226, 206, 170], [198, 178, 168]];
  const WOOD = [150, 110, 72], GOODS = [[226, 84, 76], [244, 190, 66], [90, 170, 110], [236, 132, 60], [160, 96, 190]];

  const streets = [{ y: 0, w: 4.6 }, { y: -36, w: 3.4 }, { y: 36, w: 3.4 }]; // running left to right
  const lanes = [{ x: -20, w: 3.4 }, { x: 22, w: 3.4 }];                     // running front to back
  const onStreet = (x, y) => streets.some(s => Math.abs(y - s.y) < s.w) || lanes.some(l => Math.abs(x - l.x) < l.w);
  const offLane = x => lanes.every(l => Math.abs(x - l.x) > l.w + 2.2);
  const slots = []; // x positions along a street where a stall or a table can stand
  for (let x = -44; x <= 44; x += 5.4) if (offLane(x)) slots.push(Math.round(x * 10) / 10);
  const rowY = s => s.y - s.w - 3.4;   // roofed stalls stand behind each street
  const tableY = s => s.y + s.w + 4;   // open tables stand in front of it
  // the three food stalls take the place of ordinary stalls
  const foodStalls = [{ x: slots[2], y: rowY(streets[0]) }, { x: slots[7], y: rowY(streets[1]) }, { x: slots[11], y: rowY(streets[2]) }];
  const houses = [
    { x: 33, y: -19.5, hx: 2, hy: 4.5, z1: 2.7 }, { x: 38.3, y: -19.5, hx: 1.8, hy: 4.5, z1: 2.4 }, // the pair with the alley between
    { x: -36, y: -19.5, hx: 5, hy: 4, z1: 2.8 }, { x: -8.5, y: -19.5, hx: 4.5, hy: 4, z1: 2.5 }, { x: 8.5, y: -19.5, hx: 4, hy: 4, z1: 2.9 },
    { x: -36, y: 19, hx: 5, hy: 3.6, z1: 2.6 }, { x: -4, y: 19, hx: 5, hy: 3.6, z1: 2.8 }, { x: 10.5, y: 19, hx: 3.2, hy: 3.6, z1: 2.4 }, { x: 36, y: 19, hx: 5, hy: 3.6, z1: 2.7 },
    { x: -38, y: -54, hx: 5, hy: 4, z1: 2.8 }, { x: 0, y: -54.5, hx: 7, hy: 3.6, z1: 2.6 }, { x: 36, y: -54, hx: 5, hy: 4, z1: 2.9 },
  ].map(h => ({ ...h, z0: 0, yaw: 0 }));
  const inPark = (x, y) => y > 47 || (y < -47 && G.noise(x * .1 + 3, y * .1) > .45);

  const map = PI.registerMap({
    id: 'gaya-street', order: 2, seed: 23,
    scene: { shadowX: 1.15, shadowY: -.1 },
    start: { x: 2, y: 1 },
    grass: [120, 152, 80], grassDensity: .14,
    onStreet,

    ground(x, y, wx, wy, cell) {
      if (onStreet(x, y)) { // big stone slabs
        const tx = x / 1.5 + (Math.floor(y / 1.1) % 2 ? .5 : 0), ty = y / 1.1;
        if (tx - Math.floor(tx) < .07 || ty - Math.floor(ty) < .1) return JOINT;
        return G.pick(STREET, .5 + (G.rand2(Math.floor(tx) * 7, Math.floor(ty) * 13) - .5) * .7 + (G.noise(x * 2, y * 2) - .5) * .25, wx, wy, .5);
      }
      if (inPark(x, y) || G.noise(x * .12 + 30, y * .12) > .7) {
        cell.kind = G.KIND.GRASS;
        return G.pick(LAWN, G.noise(x * .8, y * .9) + (G.rand2(wx, wy) - .5) * .3, wx, wy, .5);
      }
      const ux = x / .8, uy = y / .8; // pavement: small tiles
      if (ux - Math.floor(ux) < .1 || uy - Math.floor(uy) < .16) return SEAM;
      return G.pick(WALK, .5 + (G.rand2(Math.floor(ux) * 5, Math.floor(uy) * 11) - .5) * .6, wx, wy, .5);
    },

    props() {
      let n = 0;
      for (const s of streets) {
        for (const x of slots) {
          if (!foodStalls.some(f => f.x === x && f.y === rowY(s))) {
            I.addSolid(P.stall(x, rowY(s), 1.6, .75, WOOD, ROOFS[n % ROOFS.length], 0, n));
            I.addCover(x, rowY(s) + 1.6, 1.2);
          }
          // low open tables, so nothing on the street is hidden behind them
          I.addSolid(P.table(x + 1.2, tableY(s) + (n % 2) * .4, 1.5, .6, WOOD, GOODS.slice(n % 4).concat(GOODS), n + 9));
          I.addCover(x + 1.2, tableY(s) - 1.5, 1);
          n++;
        }
      }
      houses.forEach((h, k) => {
        P.box(h, WALLS[k % WALLS.length], { seed: k * 3 + 1, grain: .7 });
        P.box({ x: h.x, y: h.y, z0: h.z1, z1: h.z1 + .25, hx: h.hx + .15, hy: h.hy + .15, yaw: 0 }, TILES[k % TILES.length], { grain: .5, seed: 5 + k });
        M.shopfront(h, SHUTTERS[k % SHUTTERS.length], ROOFS[(k + 2) % ROOFS.length]);
        I.addSolid(h);
      });
      for (const l of lanes) for (const y of [45.6, -45.6]) M.gate(l.x, y, l.w + .5, 3.3, [196, 52, 46], [232, 186, 76], [58, 122, 98]);
      for (const s of streets) M.lanterns(-45, 45, s.y - s.w + .35);
      M.clockTower(TOWER.x, TOWER.y);
      for (const s of streets) for (const l of lanes) for (const side of [-1, 1]) { // a signboard at every corner
        P.post(l.x + side * (l.w + .8), s.y - s.w - .8, 2.5, ROOFS[(n++) % ROOFS.length], { w: .6, h: .35 });
      }
      I.scatter(22, 640, 6, (x, y) => !onStreet(x, y) && !inPark(x, y), (x, y, k) => P.crate(x, y, .3 + (k % 3) * .04, [146 + (k % 4) * 4, 110, 70], k * .4, k));
      I.scatter(20, 700, 7, (x, y) => inPark(x, y) && !onStreet(x, y), (x, y, k) => { F.tree(x, y, .8 + (k % 3) * .08, k * 3 + 2); I.addSolid({ x, y, r: .3 }); });
      I.scatter(30, 900, 4.5, (x, y) => !onStreet(x, y), (x, y, k) => F.bush(x, y, .7 + (k % 2) * .15, k * 5 + 1));
    },

    interactions: {
      'food-stall': { wait: 2, food: 1, cooldown: 15, stalls: foodStalls },
      handcart: { knock: 16, stop: .5, carts: [{ y: 0, from: -44, to: 44, speed: 3.4 }, { y: 36, from: 44, to: -44, speed: 2.8 }] },
      alley: { maxLevel: 4, zone: { x: 35.75, y: -19.5, hx: .75, hy: 4.5 } },
      'awning-bounce': { distance: 4, cooldown: .9, pads: [
        { x: -34, y: 2.8, hx: 1.1, hy: .7 }, { x: -8, y: -2.9, hx: 1.1, hy: .7 }, { x: 10, y: 2.6, hx: 1.1, hy: .7 }, { x: 36, y: -2.6, hx: 1.1, hy: .7 },
        { x: -20, y: -18, hx: .9, hy: .8 }, { x: -20, y: 20, hx: .9, hy: .8 }, { x: 22, y: -18, hx: .9, hy: .8 }, { x: 22, y: 22, hx: .9, hy: .8 },
        { x: -32, y: -36, hx: 1.1, hy: .7 }, { x: 4, y: -36, hx: 1.1, hy: .7 }, { x: -6, y: 36, hx: 1.1, hy: .7 }, { x: 34, y: 36, hx: 1.1, hy: .7 }] },
      hawker: { hold: 1, immune: 3, radius: 1.25, spots: [
        { x: slots[5], y: rowY(streets[0]) + 1.9, yaw: 1.5 }, { x: slots[9], y: rowY(streets[0]) + 1.9, yaw: 1.6 }, { x: slots[13], y: rowY(streets[0]) + 1.9, yaw: 1.4 },
        { x: slots[1], y: rowY(streets[1]) + 1.9, yaw: 1.5 }, { x: slots[12], y: rowY(streets[1]) + 1.9, yaw: 1.6 },
        { x: slots[4], y: rowY(streets[2]) + 1.9, yaw: 1.5 }, { x: slots[8], y: rowY(streets[2]) + 1.9, yaw: 1.4 },
        { x: -1.5, y: tableY(streets[0]) - 2, yaw: -1.5 }, { x: 30, y: tableY(streets[0]) - 2, yaw: -1.6 }, { x: -30, y: tableY(streets[1]) - 2, yaw: -1.5 }] },
    },
  });
})();
