'use strict';
// Wander. It walks slowly in random directions and pauses often.
PI.behaviors.wander = {
  steer(self, dt) { return PI.ai.react(self) || PI.ai.wander(self, dt, .4, 1.2, 3.2, .35); },
};
