'use strict';
// Boat ride. Wait on a jetty and the boat carries you to the other jetty. While aboard you cannot steer,
// and nothing can touch you.
// cfg: docks [{ x, y, out: [dx, dy] }] (jetty and the direction out to sea), via { x, y } (the route bends through here), wait (s), time (s)
PI.registerInteraction('islands', 'boat-ride', {
  init(cfg, st) { st.at = 0; st.t = 0; st.rider = null; },
  bake(cfg) {
    for (const d of cfg.docks) {
      const yaw = Math.atan2(d.out[1], d.out[0]);
      PI.props.box({ x: d.x + d.out[0] * .9, y: d.y + d.out[1] * .9, z0: 0, z1: .22, hx: 1.3, hy: .45, yaw }, [150, 112, 74], { grain: .9, seed: 8 });
      PI.props.post(d.x + d.out[0] * 2, d.y + d.out[1] * 2 + .4, 1, [226, 84, 76]);
    }
  },
  // where the boat is: moored beside its jetty, or somewhere along the curved route
  place(cfg, st) {
    const a = cfg.docks[st.at], b = cfg.docks[1 - st.at];
    const moor = d => ({ x: d.x + d.out[0] * 2.6, y: d.y + d.out[1] * 2.6 });
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
        Wd.cooldown(c, 'boat', 3);
      }
      return;
    }
    const dock = cfg.docks[st.at];
    for (const c of Wd.creatures()) {
      if (Wd.cooling(c, 'boat', dt)) { Wd.fx(c, 'boat').dwell = 0; continue; }
      if (Wd.dwell(c, 'boat', Math.hypot(c.x - dock.x, c.y - dock.y) < 1.1, dt) < cfg.wait) continue;
      Wd.fx(c, 'boat').dwell = 0;
      st.rider = c; st.t = 0; c.ride = st;
      return;
    }
  },
  drawGround(cfg, st) {
    if (st.rider) return;
    const G = PI.gfx, d = cfg.docks[st.at], p = PI.state.player;
    G.groundRing(d.x, d.y, 1.1, G.pack(255, 255, 255), p && p.fx.boat && p.fx.boat.dwell > 0 ? 0 : 2, Math.floor(PI.state.time * 4));
  },
  draw(cfg, st) {
    const at = this.place(cfg, st);
    PI.props.boat(at.x, at.y, at.yaw, [226, 84, 76], PI.gfx.KIND.BODY, true);
  },
});
