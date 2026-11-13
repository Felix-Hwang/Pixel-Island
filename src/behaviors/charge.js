'use strict';
// Charge. It detects the player from further away and runs straight at them, faster than other hunters.
PI.behaviors.charge = {
  steer(self, dt) { return PI.ai.react(self, { range: 1.25, chase: 1.07 }) || PI.ai.wander(self, dt, .45, 1.5, 3.5, .25); },
};
