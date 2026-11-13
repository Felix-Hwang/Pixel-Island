'use strict';
// Erratic. It changes direction every .25 to .8 seconds.
PI.behaviors.erratic = {
  steer(self, dt) { return PI.ai.react(self) || PI.ai.wander(self, dt, .7, .25, .8, .15); },
};
