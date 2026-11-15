'use strict';
// The state of the current round, and the one place creatures are made.
(() => {
  const cfg = PI.config;
  const S = PI.state = {
    phase: 'boot',      // boot | start | play | over | finale | clear
    time: 0,
    map: null,
    player: null,
    creatures: [],
    morsels: [],
    respawns: [],       // seconds until the next creature arrives
    gauge: 0, need: 0,
    gifts: 0,           // food taken from terrain at this level, see config.giftShare
    killer: null,       // after a game over: { words, reached, body }; the camera follows body
    overAt: 0,
    calmUntil: 0,       // hunters leave the player alone until this time
    apexAt: 0,          // the time at which a level-10 player ascends
    finaleAt: 0,
    history: [],        // one entry per species the player has been this round: { lv, id, color, from, to }
    freeze: 0,          // seconds the world stands still on a hit
    nextId: 1,
  };
  S.all = () => S.player ? [S.player, ...S.creatures] : S.creatures;
  S.reset = () => {
    S.time = 0; S.player = null; S.creatures = []; S.morsels = []; S.respawns = []; S.gauge = 0; S.need = 0; S.gifts = 0;
    S.killer = null; S.overAt = 0; S.calmUntil = 0; S.apexAt = 0; S.finaleAt = 0; S.history = []; S.freeze = 0;
  };

  const gradeOf = id => cfg.grades[PI.grades[id]] ? PI.grades[id] : 'B';
  const speedOf = id => (PI.speeds[id] || 100) * cfg.speedScale * cfg.grades[gradeOf(id)].speed;
  // style and sense depend on the species and, for style, on the map being played
  function traits(c) {
    const id = c.sp.id, map = S.map, table = map && PI.styles[map.id];
    c.grade = gradeOf(id); c.agile = cfg.grades[c.grade].accel; c.speed = speedOf(id);
    c.style = (table && table[id]) || 'neutral';
    c.sense = cfg.senses[PI.senses[id]] || cfg.senses.medium;
  }
  PI.styleOf = c => (S.map && S.map.styles && S.map.styles[c.style]) || cfg.styles[c.style] || cfg.styles.neutral;

  // Every field of a creature is created here, so other files do not add fields.
  PI.makeCreature = (sp, lv, x, y, isPlayer = false) => {
    const c = {
      id: S.nextId++, sp, lv, isPlayer, x, y,
      grade: 'B', agile: 1, speed: 1, style: 'neutral', sense: 0,
      vx: 0, vy: 0,
      kx: 0, ky: 0,           // knock velocity, fades out
      sepX: 0, sepY: 0,       // push away from a crowd, set every frame
      face: Math.round(Math.random() * 8) * Math.PI / 4,
      color: PI.palette.random(), seed: Math.random() * 100 | 0,
      k: cfg.sizeOf(lv), r: 0,
      gaitPhase: Math.random(), gaitQ: 0, runQ: 0, moving: false, running: false, pop: 0,
      sq: 0, sqv: 0,          // squash and stretch spring; above 0 the body is taller and thinner
      morph: null,            // { t, from } while it flashes into a new shape
      lift: 0,                // height above the ground, used by the ending
      stun: 0, invuln: 0, bounce: 0, ride: null, doom: 0,
      leaving: 0,             // until this time it walks off screen to make room for new neighbours
      alert: 0,               // seconds left of the mark that shows it has just noticed the player
      mo: {},                 // how its body moves, see src/creatures/motion.js
      home: { x, y }, roam: cfg.roam[0] + Math.random() * (cfg.roam[1] - cfg.roam[0]), temper: .75 + Math.random() * .5,
      jam: { t: 0, x, y, want: 0, n: 0, until: 0, ax: 0, ay: 0 }, // see unstick() in loop.js
      mods: { speed: 1, accel: 1, detect: 1, hidden: false, reveal: 2.5, safe: false, food: 0, driftX: 0, driftY: 0, ground: '' },
      fx: {},                 // per-interaction scratch space
      ai: {},                 // per-behaviour scratch space
    };
    traits(c);
    c.r = PI.builder.radius(c);
    return c;
  };
  // turn an existing creature into another species and level
  PI.reshape = (c, sp, lv) => {
    c.sp = sp; c.lv = lv; c.k = cfg.sizeOf(lv); c.color = PI.palette.random();
    traits(c);
    c.r = PI.builder.radius(c);
  };
  PI.statusColors = {
    stun: [255, 206, 40], safe: [90, 200, 120], hidden: [150, 150, 170], fast: [255, 196, 40], slow: [80, 150, 240],
    feast: [255, 140, 60], slip: [200, 236, 250], drift: [60, 200, 190], blind: [170, 170, 180], alert: [236, 60, 52],
  };
  // The effects a creature is under right now, most important first. Icons, particles and the status card read this.
  PI.statusOf = c => {
    const m = c.mods, out = [];
    if (c.alert > 0) out.push('alert');
    if (c.stun > 0) out.push('stun');
    if (m.safe) out.push('safe');
    if (m.hidden) out.push('hidden');
    if (m.speed > 1.05) out.push('fast');
    if (m.speed < .92) out.push('slow');
    if (m.food > 0) out.push('feast');
    if (m.accel < .5) out.push('slip');
    if (Math.hypot(m.driftX, m.driftY) > .3) out.push('drift');
    if (m.detect < .9 && !c.isPlayer) out.push('blind');
    return out;
  };
})();
