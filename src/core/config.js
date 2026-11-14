'use strict';
// Game constants. Numbers that belong to one map live in that map's file.
PI.config = {
  zoom: { near: 170, normal: 200, far: 240 }, // game pixels along the shorter side of the screen, per Zoom setting
  population: 105,
  morsels: [0, 70, 30],    // berries on the map at player level 1 and 2
  morselsNear: [0, 6, 3],  // of those, how many stay on or just beside the screen
  morselReach: 9,          // units; at the start of a round the near ones lie this close
  invincible: 1.5,         // seconds after evolving
  minFood: 2,
  foodBase: lv => lv + 2,
  // data/grades.js gives every species a grade. edge is taken off chaseCap and fleeCap while the player is that species.
  grades: {
    S: { speed: 1.1, accel: 1.3, food: -1, edge: .06 },
    A: { speed: 1.05, accel: 1.15, food: 0, edge: .03 },
    B: { speed: 1, accel: 1, food: 0, edge: 0 },
    C: { speed: .95, accel: .9, food: 0, edge: -.03 },
    D: { speed: .9, accel: .8, food: 1, edge: -.05 },
  },
  // data/senses.js gives every species one of these detection ranges, in units. Hunters also have to be on
  // screen before they notice the player, so nothing ever chases from outside the view.
  senses: { short: 4, medium: 5.5, wide: 7 },
  senseMax: 7.5,
  // data/styles.js gives every species one of three temperaments on every map. A map may override any number
  // here in its own `styles`. pace: wander speed. roam: how far it strays. notice: hunter detection range.
  // stamina: chase time. chase: chase speed. fear: how early prey runs.
  styles: {
    passive: { pace: .8, roam: .7, notice: .55, stamina: .5, chase: .95, fear: 1.35 },
    neutral: { pace: 1, roam: 1, notice: 1, stamina: 1, chase: 1, fear: 1 },
    aggressive: { pace: 1.2, roam: 1.4, notice: 1.2, stamina: 1.2, chase: 1.05, fear: .65 },
  },
  meanSpeed: lv => 95 + lv * 9,       // px/s, see data/speeds.js
  speedScale: .056,                   // px/s to world units per second
  sizeOf: lv => 1.3 + (lv - 1) * .13, // creature size in world units
  chaseFactor: .8,
  chaseCap: .88,           // hunters never exceed this share of the player's speed
  stamina: 10, rest: 3,    // seconds a hunter chases, then ignores the player
  fleeFactor: .86,
  fleeCap: .92,            // prey never exceeds this share of the player's speed
  fleeRange: .7,           // prey reacts at this share of its detection range
  accel: 11,
  cameraFollow: 4.2,       // how quickly the camera catches up with the player; lower trails further behind
  eatReach: 1.15,          // the player eats from this share of the two radii; every other contact uses touchReach
  touchReach: .8,
  respawnDelay: 1.6,
  spawnMinDist: 9,
  crowd: 2.6,              // AI creatures closer than this drift apart
  roam: [9, 22],
  edgeBounce: 5,
  stuck: { window: 1.2, moved: .35, escape: .9, giveUp: 3 }, // see unstick() in loop.js
  toastMs: 2500, eatToastMs: 1300,
  overDelay: 1.6,          // seconds the camera follows the killer before the game-over panel opens
  morph: 1.2,              // seconds of the flash at the start of a round and on every evolution
  apexDelay: 30,           // seconds at level 10 before the ending
  finale: 5,               // seconds of the ending
  shake: { eat: 2.5, evolve: 5, over: 8, bump: 2, finale: 6 }, // game pixels
  // Which levels arrive around a player of level p: offset from p, and its weight.
  dangerScale: lv => Math.min(1, .15 + lv * .2),
  levelWeights: { '-3': .3, '-2': 1, '-1': 1.7, '0': .8, '1': .9, '2': .45, '3': .15 },
};
