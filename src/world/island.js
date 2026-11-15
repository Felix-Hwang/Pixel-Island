'use strict';
// The land: a rectangle of terrain much larger than the screen, which the camera scrolls over.
// Every part of it can be reached; only solid props (trunks, stalls, houses, rocks) stand in the way.
// This file knows where creatures may stand, scatters decoration, and bakes a map into the big static frame.
(() => {
  const G = PI.gfx, { KIND } = G;
  const I = PI.island = { map: null, cover: [], solids: [] };
  const WORLD = { hx: 48, hy: 64 }; // half-size of a map in world units: 960 x 752 pixels on screen
  const bounds = () => (I.map && I.map.world) || WORLD;

  // How close a point is to the border of the map: 1 on the border, .92 where walking stops, 0 or less deep inside.
  I.edge = (x, y) => { const w = bounds(); return 1 - Math.min(w.hx - Math.abs(x), w.hy - Math.abs(y)) / 15; };
  // Solid things nobody can walk through: { x, y, r } circles or { x, y, hx, hy, yaw } boxes. Props add them while
  // baking. They are also filed in a coarse grid, so a lookup only tests the few solids near the point.
  const CELL = 4, REACH = 1.6, grid = new Map();
  const cellKey = (cx, cy) => (cx + 512) * 1024 + cy + 512;
  I.addSolid = s => {
    I.solids.push(s);
    const ext = (s.r != null ? s.r : Math.hypot(s.hx, s.hy)) + REACH;
    for (let cx = Math.floor((s.x - ext) / CELL); cx <= Math.floor((s.x + ext) / CELL); cx++) {
      for (let cy = Math.floor((s.y - ext) / CELL); cy <= Math.floor((s.y + ext) / CELL); cy++) {
        const k = cellKey(cx, cy);
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(s);
      }
    }
    return s;
  };
  I.clearSolids = () => { I.solids.length = 0; grid.clear(); };
  // pad (at most 1.6) grows every solid by that much
  I.hitsSolid = (x, y, pad = .25) => {
    const near = grid.get(cellKey(Math.floor(x / CELL), Math.floor(y / CELL)));
    if (!near) return false;
    for (const s of near) {
      if (s.r != null) { if (Math.hypot(x - s.x, y - s.y) < s.r + pad) return true; }
      else if (G.inBox(s, x, y, pad)) return true;
    }
    return false;
  };
  // where a creature may stand: inside the map and not inside something solid
  I.walkable = (x, y) => I.edge(x, y) < .92 && !(I.map.solid && I.map.solid(x, y)) && !I.hitsSolid(x, y);
  I.randomPoint = (test, tries = 80) => {
    const w = bounds();
    for (let n = 0; n < tries; n++) {
      const x = (Math.random() * 2 - 1) * w.hx, y = (Math.random() * 2 - 1) * w.hy;
      if (I.walkable(x, y) && (!test || test(x, y))) return { x, y };
    }
    return { x: I.map.start ? I.map.start.x : 0, y: I.map.start ? I.map.start.y : 0 };
  };
  // places where a hiding creature likes to sit; props and maps add to this while baking
  I.addCover = (x, y, r) => I.cover.push({ x, y, r });
  // Up to count points spread over the map, the same every time for the same seed. Points keep gap apart,
  // stay margin away from the border and must pass ok(x, y). Map files use this to lay out their features.
  I.spread = (count, seed, gap, ok, margin = 4, world = WORLD) => {
    const out = [];
    for (let n = 0; out.length < count && n < count * 60; n++) {
      const x = (G.rand2(seed + n, 17) * 2 - 1) * (world.hx - margin), y = (G.rand2(seed + n, 91) * 2 - 1) * (world.hy - margin);
      if ((ok && !ok(x, y)) || out.some(p => Math.hypot(p.x - x, p.y - y) < gap)) continue;
      out.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
    return out;
  };
  // The same for decoration while baking. It also keeps clear of every solid already placed, and calls place(x, y, n).
  I.scatter = (count, seed, gap, ok, place) => {
    const m = I.map;
    I.spread(count, seed, gap, (x, y) => !(m.solid && m.solid(x, y)) && !I.hitsSolid(x, y, 1.4) && (!ok || ok(x, y)), 4, bounds())
      .forEach((p, n) => place(p.x, p.y, n));
  };

  I.bake = map => {
    const world = map.world || WORLD;
    I.map = map;
    I.cover.length = 0;
    I.clearSolids();
    G.setScene(map.scene || {});
    G.setMap(world.hx * 2 * G.U, Math.round(world.hy * 2 * G.U * G.SIN));
    G.toMap();
    G.clear();
    G.clearWind();
    const cell = { kind: KIND.GROUND }, W = G.W, H = G.H;
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const g = G.toGround(px + .5, py + .5);
      cell.kind = KIND.GROUND;
      const i = py * W + px;
      G.col[i] = map.ground(g.x, g.y, px, py, cell); // px, py: the pixel on the map, for noise and dither
      G.kind[i] = cell.kind; G.dep[i] = G.depthOf(g.y, 0);
    }
    if (map.grass) G.growGrass(G.ramp(map.grass), map.grassDensity);
    if (map.props) map.props();
    PI.world.bake();
    G.contactShade();
    G.bakeShadows();
    G.outline(KIND.PROP);
    G.toView();
  };
})();
