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
    killer: null,
    nextId: 1,
  };
  S.all = () => S.player ? [S.player, ...S.creatures] : S.creatures;
  S.reset = () => {
    S.time = 0; S.player = null; S.creatures = []; S.morsels = []; S.respawns = []; S.gauge = 0; S.need = 0; S.killer = null;
  };

  const speedOf = id => (PI.speeds[id] || 100) * cfg.speedScale;
  // sp is a species definition. Every field of a creature is created here, so other files do not add fields.
  PI.makeCreature = (sp, lv, x, y, isPlayer = false) => {
    const c = {
      id: S.nextId++, sp, lv, isPlayer, x, y,
      vx: 0, vy: 0,           // steering velocity
      kx: 0, ky: 0,           // knock velocity from interactions, fades out
      face: Math.round(Math.random() * 8) * Math.PI / 4,
      color: PI.palette.random(), seed: Math.random() * 100 | 0,
      k: cfg.sizeOf(lv), r: 0, speed: speedOf(sp.id),
      gaitPhase: Math.random(), gaitQ: 0, moving: false, running: false, pop: 0,
      stun: 0, invuln: 0, ride: null,
      mods: { speed: 1, accel: 1, detect: 1, hidden: false, reveal: 2.5, safe: false, food: 0, driftX: 0, driftY: 0 },
      fx: {},                 // per-interaction scratch space
      ai: {},                 // per-behaviour scratch space
    };
    c.r = PI.builder.radius(c);
    return c;
  };
  // turn an existing creature into another species and level (evolution)
  PI.reshape = (c, sp, lv) => {
    c.sp = sp; c.lv = lv; c.k = cfg.sizeOf(lv); c.speed = speedOf(sp.id); c.color = PI.palette.random();
    c.r = PI.builder.radius(c);
  };
})();
