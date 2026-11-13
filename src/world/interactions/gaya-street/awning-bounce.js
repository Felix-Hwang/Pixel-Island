'use strict';
// Bounce awning. A striped cloth on the ground throws whoever steps on it forward in the direction they were
// moving. It works for escaping and for chasing.
// cfg: pads [{ x, y, hx, hy }], distance (units thrown), cooldown (s)
PI.registerInteraction('gaya-street', 'awning-bounce', {
  bake(cfg) {
    const G = PI.gfx, A = G.pack(232, 92, 84), B = G.pack(250, 240, 226), RIM = G.pack(120, 60, 66);
    for (const p of cfg.pads) {
      G.groundRect(p.x, p.y, p.hx, p.hy, (i, wx, wy, u, v) => {
        G.col[i] = Math.abs(u) > .9 || Math.abs(v) > .84 ? RIM : Math.floor((u + 1) * 2.5) % 2 ? B : A; // stripes at least 3px wide
      });
    }
  },
  update(cfg, st, dt) {
    const Wd = PI.world;
    for (const c of Wd.creatures()) {
      if (Wd.cooling(c, 'bounce', dt)) continue;
      const speed = Math.hypot(c.vx, c.vy);
      if (speed < .6 || !cfg.pads.some(p => Wd.inRect(c, p))) continue;
      Wd.knock(c, c.vx / speed * cfg.distance * 6, c.vy / speed * cfg.distance * 6);
      c.pop = Math.max(c.pop, .5); // squash the body briefly at take-off
      Wd.cooldown(c, 'bounce', cfg.cooldown);
    }
  },
});
