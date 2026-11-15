'use strict';
// Current. The shallow sea flows around the big island in one fixed direction and pushes every creature in it.
// Moving with the flow is faster and moving against it is slower.
// cfg: strength (drift as a fraction of the creature's own speed), turn (1 = clockwise on screen, -1 = the other way)
PI.registerInteraction('islands', 'current', {
  // the direction of the flow at a point: along the shore, circling the island
  flow(cfg, x, y) {
    const c = PI.world.map.centre, dx = -(y - c.y) * .9 * cfg.turn, dy = (x - c.x) * 1.1 * cfg.turn, len = Math.hypot(dx, dy) || 1;
    return [dx / len, dy / len];
  },
  init(cfg, st) {
    st.flecks = [];
    for (let n = 0; n < 220; n++) st.flecks.push({ x: 0, y: 0, v: 1.5 + Math.random() * 1.4, life: 0 });
  },
  update(cfg, st, dt) {
    const I = PI.island, map = PI.world.map;
    for (const f of st.flecks) { // drifting flecks show which way the water runs
      f.life -= dt;
      if (f.life <= 0) { const at = I.randomPoint((x, y) => map.terrain(x, y) === 'sea', 8); f.x = at.x; f.y = at.y; f.life = 2 + Math.random() * 4; }
      const [ux, uy] = this.flow(cfg, f.x, f.y);
      f.x += ux * f.v * dt; f.y += uy * f.v * dt; f.ux = ux; f.uy = uy;
    }
  },
  modify(cfg, st, c, m) {
    if (PI.world.map.terrain(c.x, c.y) !== 'sea') return;
    const [ux, uy] = this.flow(cfg, c.x, c.y);
    m.ground = 'water';
    m.driftX += ux * cfg.strength * c.speed;
    m.driftY += uy * cfg.strength * c.speed;
  },
  drawGround(cfg, st) {
    const G = PI.gfx, map = PI.world.map, light = G.pack(220, 248, 236);
    for (const f of st.flecks) {
      if (!G.visible(f.x, f.y, 4) || map.terrain(f.x, f.y) !== 'sea') continue;
      for (let k = 0; k < 3; k++) {
        const i = G.index(f.x - (f.ux || 0) * k * .13, f.y - (f.uy || 0) * k * .26, 0);
        if (i >= 0 && G.kind[i] === G.KIND.GROUND) G.col[i] = light;
      }
    }
  },
});
