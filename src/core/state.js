'use strict';
// The state of the current round, and the one place creatures are made.
(() => {
  const cfg = PI.config;
  const S = PI.state = {
    phase: 'boot',      // boot | start | play | over | clear
    time: 0,
    map: null,
    player: null,
    creatures: [],      // AI creatures
    morsels: [],        // level-0 food
    respawns: [],       // seconds until the next creature arrives
    gauge: 0, need: 0,
    killer: null,       // after a game over: { words, reached, body }. body is the creature the camera follows.
    overAt: 0,          // the time at which the game-over panel opens
    freeze: 0,          // seconds the world stands still (a short stop on a hit)
    nextId: 1,
  };
  S.all = () => S.player ? [S.player, ...S.creatures] : S.creatures;
  S.reset = () => {
    S.time = 0; S.player = null; S.creatures = []; S.morsels = []; S.respawns = []; S.gauge = 0; S.need = 0;
    S.killer = null; S.overAt = 0; S.freeze = 0;
  };

  const gradeOf = id => cfg.grades[PI.grades[id]] ? PI.grades[id] : 'B';
  const speedOf = id => (PI.speeds[id] || 100) * cfg.speedScale * cfg.grades[gradeOf(id)].speed;
  // sp is a species definition. Every field of a creature is created here, so other files do not add fields.
  PI.makeCreature = (sp, lv, x, y, isPlayer = false) => {
    const c = {
      id: S.nextId++, sp, lv, isPlayer, x, y,
      grade: gradeOf(sp.id), agile: cfg.grades[gradeOf(sp.id)].accel,
      vx: 0, vy: 0,           // steering velocity
      kx: 0, ky: 0,           // knock velocity from interactions and from the border, fades out
      sepX: 0, sepY: 0,       // push away from a crowd, set every frame
      face: Math.round(Math.random() * 8) * Math.PI / 4,
      color: PI.palette.random(), seed: Math.random() * 100 | 0,
      k: cfg.sizeOf(lv), r: 0, speed: speedOf(sp.id),
      gaitPhase: Math.random(), gaitQ: 0, runQ: 0, moving: false, running: false, pop: 0,
      sq: 0, sqv: 0,          // squash and stretch: a spring; above 0 the body is taller and thinner
      morph: null,            // { t, from } while it flashes into a new shape
      stun: 0, invuln: 0, bounce: 0, ride: null,
      // an AI creature keeps to the area around the place it arrived at, and each one has its own pace
      home: { x, y }, roam: cfg.roam[0] + Math.random() * (cfg.roam[1] - cfg.roam[0]), temper: .75 + Math.random() * .5,
      mods: { speed: 1, accel: 1, detect: 1, hidden: false, reveal: 2.5, safe: false, food: 0, driftX: 0, driftY: 0 },
      fx: {},                 // per-interaction scratch space
      ai: {},                 // per-behaviour scratch space
    };
    c.r = PI.builder.radius(c);
    return c;
  };
  // turn an existing creature into another species and level (evolution)
  PI.reshape = (c, sp, lv) => {
    c.sp = sp; c.lv = lv; c.k = cfg.sizeOf(lv); c.color = PI.palette.random();
    c.grade = gradeOf(sp.id); c.agile = cfg.grades[c.grade].accel; c.speed = speedOf(sp.id);
    c.r = PI.builder.radius(c);
  };
})();
