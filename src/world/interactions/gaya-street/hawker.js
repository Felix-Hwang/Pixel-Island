'use strict';
// Hawker. Walk too close to a vendor and you are held in place for a moment.
// Afterwards they leave you alone for a few seconds.
// cfg: spots [{ x, y, yaw }], radius (units), hold (s), immune (s)
PI.registerInteraction('gaya-street', 'hawker', {
  bake(cfg) {
    const looks = [
      { shirt: [226, 84, 76], legs: [58, 60, 84], skin: [222, 172, 132], hair: [40, 30, 28], hat: [222, 196, 130] },
      { shirt: [64, 140, 200], legs: [84, 72, 60], skin: [196, 146, 110], hair: [36, 30, 30] },
      { shirt: [244, 190, 66], legs: [60, 80, 70], skin: [214, 164, 124], hair: [70, 50, 40], hat: [222, 196, 130] },
    ];
    cfg.spots.forEach((s, n) => {
      PI.props.person(s.x, s.y, s.yaw, looks[n % looks.length], { wave: 1 });
      PI.island.addSolid({ x: s.x, y: s.y, r: .25 });
    });
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    for (const c of Wd.creatures()) {
      if (Wd.cooling(c, 'hawker', dt)) continue;
      if (!cfg.spots.some(s => Math.hypot(c.x - s.x, c.y - s.y) < cfg.radius + c.r * .4)) continue;
      Wd.stun(c, cfg.hold);
      c.vx = 0; c.vy = 0;
      Wd.cooldown(c, 'hawker', cfg.hold + cfg.immune);
    }
  },
  // the reach of each hawker, as a faint ring on the pavement
  drawGround(cfg) {
    const G = PI.gfx, color = G.pack(170, 120, 110), phase = Math.floor(PI.state.time * 3);
    for (const s of cfg.spots) G.groundRing(s.x, s.y, cfg.radius, color, 1, phase);
  },
});
