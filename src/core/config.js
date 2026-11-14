'use strict';
// Game constants. Numbers that belong to one map live in that map's file instead.
PI.config = {
  // game pixels shown along the shorter side of the screen, for each choice of the Zoom setting; smaller is closer
  zoom: { near: 170, normal: 200, far: 240 },
  population: 105,        // AI creatures on the map at once (only the ones on screen are drawn)
  morsels: [0, 70, 30],    // berries (level-0 food) on the map while the player is level 1 and level 2. There is none after that.
  morselsNear: [0, 6, 3],  // at least this many of them are on the screen or just beside it
  morselReach: 9,          // units; when a round starts, that many lie this close to the player
  invincible: 1.5,         // seconds after evolving
  minFood: 2,
  foodBase: lv => lv + 2,  // food needed per level, before the grade of the species is counted
  // Species of one level are not equal. data/grades.js gives every species a grade, and a grade changes
  // speed, how quickly it turns and stops (accel), food needed to evolve, and edge. Edge is taken off chaseCap
  // and fleeCap while the player is that species, so a good species escapes hunters and catches prey more easily.
  grades: {
    S: { speed: 1.1, accel: 1.3, food: -1, edge: .06 },
    A: { speed: 1.05, accel: 1.15, food: 0, edge: .03 },
    B: { speed: 1, accel: 1, food: 0, edge: 0 },
    C: { speed: .95, accel: .9, food: 0, edge: -.03 },
    D: { speed: .9, accel: .8, food: 1, edge: -.05 },
  },
  meanSpeed: lv => 95 + lv * 9,    // px/s, see data/speeds.js
  speedScale: .056,        // multiply a speed from data/speeds.js (px/s) by this to get world units per second
  sizeOf: lv => 1.3 + (lv - 1) * .13, // creature size in world units (10px): 1.3 at level 1, 2.5 at level 10
  detect: 6.5,             // units; how far AI notices the player
  chaseFactor: .8,         // hunters run a little slower than their listed speed
  chaseCap: .88,           // and never faster than this share of the player's speed, so the player can get away
  stamina: 10, rest: 3,    // seconds a hunter keeps chasing, then how long it ignores the player
  fleeFactor: .86,         // prey is a little slower than its listed speed
  fleeCap: .92,            // and never faster than this share of the player's speed, so it can be caught
  accel: 11,               // how quickly velocity reaches its target
  respawnDelay: 1.6,
  spawnMinDist: 9,         // at the start of a round, nothing dangerous stands this close to the player
  crowd: 2.6,              // AI creatures closer than this to each other drift apart
  roam: [9, 22],           // how far a creature strays from the place it arrived at, in units (each one picks its own)
  edgeBounce: 5,           // speed of the push back from the border of the map
  toastMs: 2500, eatToastMs: 1300,
  overDelay: 1.6,          // seconds the camera follows the killer before the game-over panel opens
  morph: 1,                // seconds of the flash when a round starts and on every evolution
  shake: { eat: 1.2, evolve: 2.5, over: 4, bump: 1 }, // screen shake in game pixels
  // Which levels arrive around a player of level p. The key is the offset from p and the value is its weight.
  dangerScale: lv => Math.min(1, .15 + lv * .2), // scales the weights of higher levels: .35 at level 1, rising to 1 at level 5
  levelWeights: { '-3': .3, '-2': 1, '-1': 1.7, '0': .8, '1': .9, '2': .45, '3': .15 },
};
