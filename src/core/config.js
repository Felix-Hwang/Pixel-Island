'use strict';
// Game constants. Numbers that belong to one map live in that map's file.
PI.config = {
  zoom: { near: 170, normal: 200, far: 240 }, // game pixels along the shorter side of the screen, per Zoom setting
  population: 84,
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
  sizeOf: lv => 1.35 + (lv - 1) * .0633, // creature size in world units: 1.35 at level 1, 1.92 at level 10
  chaseFactor: .9,
  chaseCap: .9,           // hunters never exceed this share of the player's speed
  stamina: 10, rest: 3,    // seconds a hunter chases, then ignores the player
  // A player chased for `after` seconds gains `gain` of its speed every second, until it matches its fastest
  // chaser's own top speed or runs `max` faster than usual. After the chase it loses `fade` every second.
  rush: { after: 2, gain: .04, fade: .05, max: .15 },
  fleeFactor: .86,
  fleeCap: .92,            // prey never exceeds this share of the player's speed
  fleeRange: .7,           // prey reacts at this share of its detection range
  fleeStamina: 3.5, winded: 2.5, windedPace: .5, // prey that has run this long is out of breath for a while, so a chase ends
  earlyNotice: [0, .8, .9], // hunters notice a level-1 or level-2 player from a shorter distance
  preyNear: 3,             // from level 3 on, at least this many edible creatures are on or beside the screen
  giftShare: .5,           // food from terrain (stalls, clams, flags) fills at most this share of a level's gauge
  guard: { range: 2.4, knock: 9, stun: .7 }, // when the safe moment after evolving ends, hunters this close are thrown back
  accel: 11,
  cameraFollow: 2.8,       // how quickly the camera catches up with the player; lower trails further behind
  eatReach: 1.15,          // the player eats from this share of the two radii; every other contact uses touchReach
  touchReach: .8,
  respawnDelay: 1.6,
  spawnMinDist: 14,
  crowd: 2.6,              // AI creatures closer than this drift apart
  roam: [9, 22],
  edgeBounce: 5,
  stuck: { window: 1.2, moved: .35, escape: .9, giveUp: 3 }, // see unstick() in movement.js
  toastMs: 2500, eatToastMs: 1300, hintMs: 4000,
  comboGap: 2,             // bites closer together than this many seconds raise the pitch of the eating sound
  hitStop: { eat: .05, over: .15 }, // seconds the world stands still on a bite (3 frames) and on a death
  overDelay: 1.6,          // seconds the camera follows the killer before the game-over panel opens
  morph: 1.2,              // seconds of the flash at the start of a round and on every evolution
  apexDelay: 30,           // seconds at level 10 before the ending
  finale: 5,               // seconds of the ending
  shake: { eat: 2.5, evolve: 5, over: 8, bump: 2, finale: 6 }, // game pixels
  // Who shares the map with a player of level p: half can be eaten, 36% are dangerous and the rest are equals.
  // steps: how many levels below or above, by weight.
  levelShare: { lower: .5, same: .14, higher: .36 },
  higherShare: lv => Math.min(.36, .108 + lv * .063), // the dangerous share builds up over levels 1 to 4; equals fill the gap
  calm: 6,                 // seconds at the start of a round before hunters go after the player
  calmGap: 6,              // during that time a hunter that comes this close turns away
  levelSteps: [.55, .3, .15],
  bubble: 62,              // creatures further than this from the player are replaced by ones just outside the screen
  prowl: { passive: .1, neutral: .3, aggressive: .55 }, // chance that a wandering hunter sets out toward the player
  packLimit: lv => Math.min(5, 1 + Math.floor(lv / 2)), // at most this many hunters chase the player at once
  closeLimit: lv => 2 + Math.floor(lv / 2), // and no more set out toward the player while this many are already close
  lunge: { range: 3, pace: 1.05, time: .6, rest: 3 }, // a charging hunter's last sprint: briefly faster than the player
  leaveTime: 6,            // seconds the old neighbours get to walk off screen after the player evolves
};
