'use strict';
// The rules of a round. This file spawns creatures and handles eating, evolving and the end of a round.
(() => {
  const cfg = PI.config, S = PI.state, I = PI.island, G = PI.gfx, Fx = PI.fx;
  const Gm = PI.game = {};
  const pick = list => list[Math.random() * list.length | 0];
  const BERRY = [[226, 58, 74], [246, 176, 44], [166, 92, 214]];
  Gm.berryColors = BERRY;

  // food needed to leave this level: level + 2, changed by the grade of the species (S needs one less, D one more)
  Gm.need = (lv, id) => Math.max(cfg.minFood, cfg.foodBase(lv) + cfg.grades[PI.grades[id] || 'B'].food);
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
  const unseen = (x, y) => !G.visible(x, y, 30);
  // A new creature. During a round it always arrives outside the part of the map the player is looking at.
  // anywhere: used when a map is first filled, before the round starts.
  Gm.spawn = (lv = pickLevel(S.player ? S.player.lv : 1), anywhere = false) => {
    const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && (anywhere || unseen(x, y)), 120);
    const c = PI.makeCreature(pick(PI.species['lv' + lv]), lv, at.x, at.y);
    S.creatures.push(c);
    return c;
  };
  // Level-0 food. In the open it lands anywhere; near the player it lands just outside the screen, so nothing pops
  // up in front of the player. first: at the start of a round, within reach and in plain sight.
  function addMorsel(where) {
    const eater = S.player || { lv: 1 };
    const open = (x, y) => I.edge(x, y) < .8 && !PI.world.blocked(eater, x, y);
    let at = null;
    for (let n = 0; where === 'first' && S.player && n < 30 && !at; n++) {
      const a = Math.random() * Math.PI * 2, d = 3 + Math.random() * (cfg.morselReach - 3);
      const x = S.player.x + Math.cos(a) * d, y = S.player.y + Math.sin(a) * d;
      if (I.walkable(x, y) && open(x, y)) at = { x, y };
    }
    if (!at && where === 'near') at = I.randomPoint((x, y) => open(x, y) && unseen(x, y) && G.visible(x, y, 90), 160);
    else if (!at) at = I.randomPoint((x, y) => open(x, y) && (S.phase !== 'play' || unseen(x, y)));
    S.morsels.push({ x: at.x, y: at.y, hue: Math.random() * 3 | 0, bob: Math.random() * 6 });
  }
  // The map always holds config.morsels pieces for the player's level, and config.morselsNear of them are always
  // on the screen or just beside it. When too few are, the farthest piece moves next to the screen. Without this a
  // level-1 player, who has no lower creature to eat, could walk for a long time and find nothing.
  function stockMorsels(first) {
    const p = S.player, lv = p ? p.lv : 1, want = cfg.morsels[lv] || 0;
    while (S.morsels.length > want) S.morsels.pop();
    while (S.morsels.length < want) addMorsel();
    if (!want || !p) return;
    for (let pass = 0; pass < (first ? cfg.morselsNear[lv] : 1); pass++) {
      let near = 0, far = 0, farthest = 0;
      S.morsels.forEach((m, n) => {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (first ? d < cfg.morselReach : G.visible(m.x, m.y, 90)) near++;
        if (d > farthest) { farthest = d; far = n; }
      });
      if (near >= (cfg.morselsNear[lv] || 0)) break;
      S.morsels.splice(far, 1);
      addMorsel(first ? 'first' : 'near');
    }
  }
  // fill the map before a round starts
  Gm.populate = () => {
    while (S.creatures.length < cfg.population) Gm.spawn(undefined, true);
  };
  Gm.loadMap = id => {
    const map = PI.maps[id];
    S.reset();
    Fx.reset();
    S.map = map;
    PI.world.load(map);
    I.bake(map);
    Gm.populate();
    PI.loop.snapCamera();
    PI.mapCycle.played(id);
    document.dispatchEvent(new CustomEvent('pi:map', { detail: id }));
  };
  Gm.start = () => {
    const map = S.map, at = map.start || { x: 0, y: 0 };
    const lv = Gm.debugLevel || 1; // set from the console to try a later level
    const p = PI.makeCreature(pick(PI.species['lv' + lv]), lv, at.x, at.y, true);
    p.face = Math.PI / 4;
    S.player = p; S.gauge = 0; S.need = Gm.need(lv, p.sp.id); S.killer = null; S.overAt = 0;
    // nothing dangerous right next to the start
    for (const c of S.creatures) if (c.lv > lv && Math.hypot(c.x - p.x, c.y - p.y) < cfg.spawnMinDist) {
      const to = I.randomPoint((x, y) => farFromPlayer(x, y, cfg.spawnMinDist));
      c.x = to.x; c.y = to.y; c.home = { x: to.x, y: to.y };
    }
    p.morph = { t: cfg.morph * .4, from: null }; // it appears out of light
    p.invuln = cfg.morph + cfg.invincible;
    S.phase = 'play';
    PI.loop.snapCamera();
    stockMorsels(true); // food is already within reach on the first frame
    PI.ui.toast.show(PI.t('card.start', PI.describe(p)));
    PI.ui.hud.update();
  };
  Gm.addFood = n => {
    if (S.phase !== 'play') return;
    S.gauge += n;
    if (S.gauge >= S.need) { if (S.player.lv >= 10) clear(); else evolve(); }
    PI.ui.hud.update();
  };
  // The player becomes a random species of the next level. The body flashes white, vanishes into light and comes
  // back in its new shape; the builder shows the old shape for the first part of that (see morph in loop.js).
  function evolve() {
    const p = S.player, lv = p.lv + 1;
    p.morph = { t: 0, from: { sp: p.sp, color: p.color, k: p.k, lv: p.lv, r: p.r } };
    PI.reshape(p, pick(PI.species['lv' + lv]), lv);
    p.invuln = cfg.morph + cfg.invincible;
    S.gauge = 0; S.need = Gm.need(lv, p.sp.id);
    Fx.shake(cfg.shake.evolve, .45);
    PI.ui.toast.show(PI.t('card.evolve', PI.describe(p)));
  }
  function clear() {
    S.phase = 'clear';
    PI.input.release();
    Fx.ring(S.player.x, S.player.y, .5, 6, [255, 220, 60], .8);
    PI.ui.screens.show('clear');
  }
  // The round ends. The camera turns to the creature that ate the player and follows it; the panel opens a moment later.
  function over(killer) {
    const p = S.player;
    S.killer = { words: PI.describe(killer), reached: p.lv, body: killer };
    Fx.burst(p.x, p.y, p.r, PI.palette.rgb[p.color], 22, 7);
    Fx.ring(p.x, p.y, .3, 3.5, [226, 60, 52], .5);
    Fx.shake(cfg.shake.over, .5);
    killer.sqv += 6; killer.pop = .4;
    S.freeze = .12;
    S.player = null;
    S.phase = 'over';
    S.overAt = S.time + cfg.overDelay;
    PI.input.release();
    PI.ui.hud.update();
  }
  // feedback for one bite: the food bursts into pixels, the player stretches, and a number floats up
  function bite(x, y, z, rgb, gain, big) {
    const p = S.player;
    Fx.burst(x, y, z, rgb, big ? 14 : 7, big ? 5.5 : 4);
    Fx.text(p.x, p.y, PI.builder.headHeight(p), '+' + gain);
    p.sqv += big ? 6 : 4;
    p.pop = Math.max(p.pop, big ? .3 : .18);
    if (big) { Fx.shake(cfg.shake.eat, .16); S.freeze = .045; }
  }
  function eat(c) {
    const gain = 1 + S.player.mods.food;
    S.creatures.splice(S.creatures.indexOf(c), 1);
    S.respawns.push(cfg.respawnDelay);
    bite(c.x, c.y, c.r, PI.palette.rgb[c.color], gain, true);
    PI.ui.toast.flash(PI.t('card.eat', PI.describe(c)));
    Gm.addFood(gain);
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
      if (Math.hypot(m.x - p.x, m.y - p.y) >= p.r + .4) continue;
      S.morsels.splice(n, 1);
      bite(m.x, m.y, .3, BERRY[m.hue], 1, false);
      PI.ui.toast.flash(PI.t('card.berry'));
      Gm.addFood(1);
      if (S.phase !== 'play') return;
    }
  };
  // arrivals, level-0 food, keeping the population close to the player's level, and the end of a round
  Gm.tick = dt => {
    for (let n = S.respawns.length - 1; n >= 0; n--) {
      S.respawns[n] -= dt;
      if (S.respawns[n] <= 0) { S.respawns.splice(n, 1); if (S.creatures.length < cfg.population) Gm.spawn(); }
    }
    stockMorsels(false);
    // Creatures that have fallen out of the player's range of levels are swapped for fitting ones, but only
    // off screen. A couple are checked every frame, so the whole map catches up within seconds of an evolution.
    if (S.player) for (let n = 0; n < 2; n++) {
      const lv = S.player.lv, c = S.creatures[Math.random() * S.creatures.length | 0];
      if (!c || (c.lv >= lv - 3 && c.lv <= lv + 3) || G.visible(c.x, c.y, 60)) continue;
      S.creatures.splice(S.creatures.indexOf(c), 1);
      Gm.spawn();
    }
    if (S.phase === 'over' && S.overAt && S.time >= S.overAt) { S.overAt = 0; PI.ui.screens.show('over'); }
  };
})();
