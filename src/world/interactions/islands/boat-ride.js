'use strict';
// Boat ride. Wait on a jetty and the boat carries you to the other jetty. While aboard you cannot steer,
// and nothing can touch you. A jetty stands in the sea, but the current does not reach whoever is on it.
// cfg: docks [{ x, y, out: [dx, dy] }] (jetty and the direction out to sea), reach (units around a jetty that count
//      as standing on it), via { x, y } (the route bends through here), wait (s), time (s)
PI.registerInteraction('islands', 'boat-ride', {
  init(cfg, st) { st.at = 0; st.t = 0; st.rider = null; },
  bake(cfg) {
    for (const d of cfg.docks) {
      const yaw = Math.atan2(d.out[1], d.out[0]);
      PI.props.box({ x: d.x + d.out[0] * .9, y: d.y + d.out[1] * .9, z0: 0, z1: .22, hx: 1.8, hy: .7, yaw }, [150, 112, 74], { grain: .9, seed: 8 });
      PI.props.post(d.x + d.out[0] * 2, d.y + d.out[1] * 2 + .4, 1, [226, 84, 76]);
    }
  },
  // where the boat is: moored beside its jetty, or somewhere along the curved route
  place(cfg, st) {
    const a = cfg.docks[st.at], b = cfg.docks[1 - st.at];
    const moor = d => ({ x: d.x + d.out[0] * 3.4, y: d.y + d.out[1] * 3.4 });
    if (!st.rider) { const m = moor(a); return { x: m.x, y: m.y, yaw: Math.atan2(a.out[1], a.out[0]) }; }
    const p0 = moor(a), p2 = moor(b), k = st.t * st.t * (3 - 2 * st.t), u = 1 - k;
    const x = u * u * p0.x + 2 * u * k * cfg.via.x + k * k * p2.x, y = u * u * p0.y + 2 * u * k * cfg.via.y + k * k * p2.y;
    const tx = 2 * u * (cfg.via.x - p0.x) + 2 * k * (p2.x - cfg.via.x), ty = 2 * u * (cfg.via.y - p0.y) + 2 * k * (p2.y - cfg.via.y);
    return { x, y, yaw: Math.atan2(ty, tx) };
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    if (st.rider) {
      st.t = Math.min(1, st.t + dt / cfg.time);
      const at = this.place(cfg, st), c = st.rider;
      c.x = at.x; c.y = at.y; c.vx = 0; c.vy = 0; c.kx = 0; c.ky = 0;
      if (st.t >= 1) { // on arrival, put the rider on the other jetty
        st.at = 1 - st.at;
        const d = cfg.docks[st.at];
        c.x = d.x; c.y = d.y; c.ride = null; st.rider = null;
        c.invuln = Math.max(c.invuln, 1.2); // a moment to step off before anything waiting at the jetty can bite
        Wd.fx(c, 'boat').landed = true;
      }
      return;
    }
    const dock = cfg.docks[st.at];
    for (const c of Wd.creatures()) {
      const f = Wd.fx(c, 'boat'), on = Math.hypot(c.x - dock.x, c.y - dock.y) < cfg.reach;
      if (f.landed) { f.landed = on; f.dwell = 0; continue; } // it has to step off before it can ride back
      if (Wd.dwell(c, 'boat', on, dt) < cfg.wait) continue;
      f.dwell = 0;
      st.rider = c; st.t = 0; c.ride = st;
      if (c.isPlayer) PI.audio.play('sfx_boat_ride');
      return;
    }
  },
  // boat-ride is listed after the current in the map file, so this takes the current's push off again
  modify(cfg, st, c, m) {
    if (cfg.docks.some(d => Math.hypot(c.x - d.x, c.y - d.y) < cfg.reach)) { m.driftX = 0; m.driftY = 0; m.ground = ''; }
  },
  drawGround(cfg, st) {
    if (st.rider) return;
    const G = PI.gfx, d = cfg.docks[st.at], p = PI.state.player;
    G.groundRing(d.x, d.y, cfg.reach, G.pack(255, 255, 255), p && p.fx.boat && p.fx.boat.dwell > 0 ? 0 : 2, Math.floor(PI.state.time * 4));
  },
  draw(cfg, st) {
    const at = this.place(cfg, st);
    PI.props.boat(at.x, at.y, at.yaw, [226, 84, 76], PI.gfx.KIND.BODY, true, 1.7);
  },
});
