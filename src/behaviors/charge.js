'use strict';
// Charge. It detects the player from further away and runs straight at them. Close in, it lunges: for a moment
// it is faster than the player, and then it has to slow down.
PI.behaviors.charge = {
  steer(self, dt) {
    const A = PI.ai, cfg = PI.config.lunge, s = self.ai, p = A.player();
    const v = A.react(self, { range: 1.25, chase: 1.07 });
    if (!v) return A.wander(self, dt, .45, 1.5, 3.5, .25);
    if (!p || A.relation(self) !== 'hunter') return v;
    const now = PI.state.time, d = A.dist(self, p);
    if (now > (s.lungeRest || 0) && d < cfg.range && now > (s.lungeUntil || 0)) { s.lungeUntil = now + cfg.time; s.lungeRest = now + cfg.time + cfg.rest; self.sqv += 4; }
    if (now < (s.lungeUntil || 0)) {
      const pace = p.speed * cfg.pace / (self.speed * self.mods.speed || 1), len = Math.hypot(v.x, v.y) || 1;
      v.x = v.x / len * pace; v.y = v.y / len * pace;
    }
    return v;
  },
};
