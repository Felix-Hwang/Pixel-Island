'use strict';
// Ambush. A hunter stands still until the player comes close, then dashes in a straight line and has to rest.
PI.behaviors.ambush = {
  steer(self, dt) {
    const A = PI.ai, s = self.ai, p = A.player();
    if (p && A.relation(self) === 'hunter' && A.hunts()) {
      if (s.rest > 0) { s.rest -= dt; return { x: 0, y: 0 }; }
      if (s.dash > 0) {
        s.dash -= dt;
        if (s.dash <= 0) s.rest = 1.6;
        const burst = Math.min(1.25, p.speed * 1.12 / (self.speed * self.mods.speed || 1)); // briefly faster than the player
        return A.home(self, { x: s.dx * burst, y: s.dy * burst });
      }
      if (A.spots(self, .6) && A.mayJoin(p)) {
        const v = A.toward(self, p.x, p.y);
        s.dx = v.x; s.dy = v.y; s.dash = .9;
        return v;
      }
      return A.wander(self, dt, .15, 2, 5, .7);
    }
    return A.react(self) || A.wander(self, dt, .25, 2, 5, .6);
  },
};
