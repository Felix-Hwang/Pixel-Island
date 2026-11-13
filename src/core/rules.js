'use strict';
// The rules of a round. This file spawns creatures and handles eating, evolving and the end of a round.
(() => {
  const cfg = PI.config, S = PI.state, I = PI.island;
  const Gm = PI.game = {};
  const pick = list => list[Math.random() * list.length | 0];

  // food needed to leave this level: level + 2, one more for a fast species, one less for a slow one
  Gm.need = (lv, id) => {
    const ratio = (PI.speeds[id] || cfg.meanSpeed(lv)) / cfg.meanSpeed(lv);
    const bonus = ratio > cfg.fastRatio ? cfg.fastBonus : ratio < cfg.slowRatio ? cfg.slowBonus : 0;
    return Math.max(cfg.minFood, cfg.foodBase(lv) + bonus);
  };
  // weights that point below level 1 go to the player's own level, and weights above level 10 go one level down,
  // so the share of dangerous creatures stays about the same at every level
  function pickLevel(p) {
    const weight = {};
    for (const key of Object.keys(cfg.levelWeights)) {
      let lv = p + +key;
      if (lv < 1) lv = p; else if (lv > 10) lv = p - 1;
      weight[lv] = (weight[lv] || 0) + cfg.levelWeights[key] * (+key > 0 ? cfg.dangerScale(p) : 1);
    }
    let total = 0;
    const bag = Object.keys(weight).map(lv => [+lv, total += weight[lv]]);
    const roll = Math.random() * total;
    return bag.find(b => roll <= b[1])[0];
  }
  const farFromPlayer = (x, y, min) => !S.player || Math.hypot(x - S.player.x, y - S.player.y) >= min;
  Gm.spawn = (lv = pickLevel(S.player ? S.player.lv : 1)) => {
    const at = I.randomPoint((x, y) => farFromPlayer(x, y, cfg.spawnMinDist) && I.edge(x, y) < .8);
    const c = PI.makeCreature(pick(PI.species['lv' + lv]), lv, at.x, at.y);
    c.pop = 1;
    S.creatures.push(c);
    return c;
  };
  function addMorsel() {
    const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && farFromPlayer(x, y, 2));
    S.morsels.push({ x: at.x, y: at.y, hue: Math.random() * 3 | 0, bob: Math.random() * 6 });
  }
  // spawn creatures until the map holds config.population of them
  Gm.populate = () => {
    while (S.creatures.length < cfg.population) Gm.spawn();
  };
  Gm.loadMap = id => {
    const map = PI.maps[id];
    S.reset();
    S.map = map;
    PI.world.load(map);
    I.bake(map);
    Gm.populate();
    PI.loop.snapCamera();
    document.dispatchEvent(new CustomEvent('pi:map', { detail: id }));
  };
  Gm.start = () => {
    const map = S.map, at = map.start || { x: 0, y: 0 };
    const lv = Gm.debugLevel || 1; // set from the console to try a later level
    const p = PI.makeCreature(pick(PI.species['lv' + lv]), lv, at.x, at.y, true);
    p.face = Math.PI / 4;
    S.player = p; S.gauge = 0; S.need = Gm.need(lv, p.sp.id); S.killer = null;
    // nothing dangerous right next to the start
    for (const c of S.creatures) if (c.lv > lv && Math.hypot(c.x - p.x, c.y - p.y) < cfg.spawnMinDist) {
      const to = I.randomPoint((x, y) => farFromPlayer(x, y, cfg.spawnMinDist));
      c.x = to.x; c.y = to.y;
    }
    p.invuln = cfg.invincible;
    S.phase = 'play';
    PI.loop.snapCamera();
    PI.mapCycle.played(map.id);
    PI.ui.toast.show(PI.t('card.start', { lv, species: PI.speciesName(p.sp.id) }), PI.t('color.' + p.color));
    PI.ui.hud.update();
  };
  Gm.addFood = n => {
    if (S.phase !== 'play') return;
    S.gauge += n;
    if (S.gauge >= S.need) { if (S.player.lv >= 10) clear(); else evolve(); }
    PI.ui.hud.update();
  };
  function evolve() {
    const p = S.player, lv = p.lv + 1;
    PI.reshape(p, pick(PI.species['lv' + lv]), lv);
    p.pop = 1; p.invuln = cfg.invincible;
    S.gauge = 0; S.need = Gm.need(lv, p.sp.id);
    PI.ui.toast.show(PI.t('card.evolve', { lv, species: PI.speciesName(p.sp.id) }), PI.t('color.' + p.color));
  }
  function clear() {
    S.phase = 'clear';
    PI.input.release();
    PI.ui.screens.show('clear');
  }
  function over(killer) {
    S.killer = { id: killer.sp.id, lv: killer.lv, reached: S.player.lv };
    S.player = null;
    S.phase = 'over';
    PI.input.release();
    PI.ui.screens.show('over');
  }
  function eat(c) {
    S.creatures.splice(S.creatures.indexOf(c), 1);
    S.respawns.push(cfg.respawnDelay);
    S.player.pop = Math.max(S.player.pop, .35);
    Gm.addFood(1 + S.player.mods.food);
  }
  // When the player touches a creature, a lower level is eaten and a higher level ends the round.
  // Creatures of the same level push each other apart. AI creatures never eat each other.
  Gm.collide = () => {
    const list = S.all();
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const p = list[a], q = list[b];
      if (p.ride || q.ride) continue;
      const dx = q.x - p.x, dy = q.y - p.y, min = (p.r + q.r) * .8;
      if (dx > min || dx < -min || dy > min || dy < -min) continue; // they are far apart, so skip the square root
      const d = Math.hypot(dx, dy);
      if (d >= min) continue;
      if (p.isPlayer && S.phase === 'play') {
        if (q.lv < p.lv) { eat(q); return Gm.collide(); }
        if (q.lv > p.lv && !(p.invuln > 0) && !p.mods.safe && !(q.stun > 0)) return over(q);
      }
      const nx = d ? dx / d : 1, ny = d ? dy / d : 0, push = (min - d) / 2;
      const pw = p.isPlayer ? .3 : 1, qw = q.isPlayer ? .3 : 1; // the player is harder to shove around
      if (I.walkable(p.x - nx * push * pw, p.y - ny * push * pw)) { p.x -= nx * push * pw; p.y -= ny * push * pw; }
      if (I.walkable(q.x + nx * push * qw, q.y + ny * push * qw)) { q.x += nx * push * qw; q.y += ny * push * qw; }
    }
    const p = S.player;
    if (p && S.phase === 'play' && !p.ride) for (let n = S.morsels.length - 1; n >= 0; n--) {
      const m = S.morsels[n];
      if (Math.hypot(m.x - p.x, m.y - p.y) < p.r + .25) { S.morsels.splice(n, 1); Gm.addFood(1); if (S.phase !== 'play') return; }
    }
  };
  // arrivals, level-0 food, and keeping the population close to the player's level
  Gm.tick = dt => {
    for (let n = S.respawns.length - 1; n >= 0; n--) {
      S.respawns[n] -= dt;
      if (S.respawns[n] <= 0) { S.respawns.splice(n, 1); if (S.creatures.length < cfg.population) Gm.spawn(); }
    }
    const lv = S.player ? S.player.lv : 1, want = cfg.morsels[lv] || 0;
    if (S.morsels.length < want && Math.random() < dt * 1.5) addMorsel();
    if (S.morsels.length > want) S.morsels.pop();
    // Creatures that have fallen out of the player's range of levels are swapped for fitting ones, but only
    // far off screen. A couple are checked every frame, so the whole map catches up within seconds of an evolution.
    if (S.player) for (let n = 0; n < 2; n++) {
      const c = S.creatures[Math.random() * S.creatures.length | 0];
      if (!c || (c.lv >= lv - 3 && c.lv <= lv + 3) || Math.hypot(c.x - S.player.x, c.y - S.player.y) < 16) continue;
      S.creatures.splice(S.creatures.indexOf(c), 1);
      Gm.spawn();
    }
  };
})();
