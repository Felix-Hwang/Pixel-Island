'use strict';
// Skittish. It detects the player from 1.7 times the usual distance and runs early.
PI.behaviors.skittish = {
  steer(self, dt) { return PI.ai.react(self, { fear: 1.7 }) || PI.ai.wander(self, dt, .5, .6, 1.8, .4); },
};
