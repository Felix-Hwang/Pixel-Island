'use strict';
// Lurk. It stays around cover such as bushes, roots and stalls. A lurking hunter only chases when the player is close.
PI.behaviors.lurk = {
  steer(self, dt) {
    const A = PI.ai, s = self.ai, cover = PI.island.cover;
    const reaction = A.react(self, { range: .65, fear: .8 });
    if (reaction) return reaction;
    s.stay = (s.stay || 0) - dt;
    if (!s.spot || s.stay <= 0) { // pick a hiding place, mostly a near one
      s.stay = 10 + Math.random() * 12;
      const near = cover.slice().sort((a, b) => A.dist(self, a) - A.dist(self, b));
      s.spot = near.length ? near[Math.min(near.length - 1, Math.random() * 3 | 0)] : null;
    }
    if (!s.spot) return A.wander(self, dt, .3, 2, 5, .6);
    if (A.dist(self, s.spot) > s.spot.r) return A.home(self, A.toward(self, s.spot.x, s.spot.y, .45));
    return A.wander(self, dt, .12, 1.5, 4, .7); // shuffles about inside the cover
  },
};
