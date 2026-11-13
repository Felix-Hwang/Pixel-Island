'use strict';
// Game constants. Numbers that belong to one map live in that map's file instead.
PI.config = {
  viewShort: 200,          // game pixels shown along the shorter side of the screen; smaller is closer
  population: 150,         // AI creatures on the map at once (only the ones on screen are drawn)
  morsels: [0, 44, 22],    // pieces of level-0 food on the ground while the player is level 1 and level 2. There is none after that.
  invincible: 1.5,         // seconds after evolving
  minFood: 2,
  foodBase: lv => lv + 2,  // food needed per level before speed correction
  fastBonus: 1, slowBonus: -1,
  fastRatio: 1.08, slowRatio: .92, // a species this much faster or slower than its level's mean speed counts as fast or slow
  meanSpeed: lv => 95 + lv * 9,    // px/s, see data/speeds.js
  speedScale: .056,        // multiply a speed from data/speeds.js (px/s) by this to get world units per second
  sizeOf: lv => 1.3 + (lv - 1) * .13, // creature size in world units (10px): 1.3 at level 1, 2.5 at level 10
  detect: 6.5,             // units; how far AI notices the player
  chaseFactor: .8,         // hunters run a little slower than their listed speed
  chaseCap: .88,           // and never faster than this share of the player's speed, so the player can get away
  stamina: 3.5, rest: 3,   // seconds a hunter keeps chasing, then how long it ignores the player
  fleeFactor: .86,         // prey is a little slower than its listed speed
  fleeCap: .92,            // and never faster than this share of the player's speed, so it can be caught
  accel: 11,               // how quickly velocity reaches its target
  respawnDelay: 1.6,
  spawnMinDist: 9,         // never spawn this close to the player
  toastMs: 2500,
  // Which levels arrive around a player of level p. The key is the offset from p and the value is its weight.
  dangerScale: lv => Math.min(1, .15 + lv * .2), // scales the weights of higher levels: .35 at level 1, rising to 1 at level 5
  levelWeights: { '-3': .3, '-2': 1, '-1': 1.7, '0': .8, '1': .9, '2': .45, '3': .15 },
};
