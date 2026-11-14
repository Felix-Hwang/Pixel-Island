'use strict';
// Lurk. It stays around cover such as bushes, roots and stalls. A lurking hunter only chases when the player is close.
PI.behaviors.lurk = {
  steer(self, dt) {
    const A = PI.ai, s = self.ai, cover = PI.island.cover;
    const reaction = A.react(self, { range: .65, fear: .8 });
    if (reaction) return reaction;
    s.stay = (s.stay || 0) - dt;
    if (!s.spot || s.stay <= 0) {
      // Pick a hiding place inside its own range, at random, and skip one that another lurker already took.
      // Choosing the nearest one sent every lurker of an area to the same bush.
      const now = PI.state.time;
      s.stay = (8 + Math.random() * 12) / self.temper;
      const free = cover.filter(c => !(c.until > now) && Math.hypot(c.x - self.home.x, c.y - self.home.y) < self.roam + 6);
      s.spot = free.length ? free[Math.random() * free.length | 0] : null;
      if (s.spot) s.spot.until = now + s.stay; // the claim ends by itself, also when this creature is gone
    }
    if (!s.spot) return A.wander(self, dt, .3, 2, 5, .6);
    if (A.dist(self, s.spot) > s.spot.r) return A.home(self, A.toward(self, s.spot.x, s.spot.y, .45 * self.temper));
    return A.wander(self, dt, .12, 1.5, 4, .7); // shuffles about inside the cover
  },
};
