'use strict';
// Glide. It crosses the map in long, fast, straight runs, then rests.
PI.behaviors.glide = {
  steer(self, dt) { return PI.ai.react(self, { chase: 1.05 }) || PI.ai.wander(self, dt, .85, 1.6, 3.2, .4); },
};
