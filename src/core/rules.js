'use strict';
// The rules of a round: spawning, eating, evolving, and the two ways a round ends.
(() => {
  const cfg = PI.config, S = PI.state, I = PI.island, G = PI.gfx, Fx = PI.fx;
  const Gm = PI.game = {};
  const pick = list => list[Math.random() * list.length | 0];
  const BERRY = [[226, 58, 74], [246, 176, 44], [166, 92, 214]], GOLD = [255, 220, 90];
  Gm.berryColors = BERRY;

  Gm.need = (lv, id) => lv >= 10 ? 0 : Math.max(cfg.minFood, cfg.foodBase(lv) + cfg.grades[PI.grades[id] || 'B'].food);
  // weights that point below level 1 go to the player's own level, and weights above level 10 go one level down
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
  // During a round a new creature always arrives outside the view. anywhere: used when a map is first filled.
  Gm.spawn = (lv = pickLevel(S.player ? S.player.lv : 1), anywhere = false) => {
    const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && (anywhere || unseen(x, y)), 120);
    const c = PI.makeCreature(pick(PI.species['lv' + lv]), lv, at.x, at.y);
    S.creatures.push(c);
    return c;
  };
  // where: 'first' lands within reach at the start of a round, 'near' just outside the screen, otherwise anywhere unseen
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
  // Keeps config.morsels berries on the map and config.morselsNear of them on or beside the screen, so a level-1
  // player, who has no lower creature to eat, always finds food.
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
  // The form the player starts in. The page address can set it for testing: ?lv=5, ?species=otter, ?color=red.
  // A parameter with no value means a random one.
  function startingForm() {
    const wantLv = PI.param('lv'), wantSp = PI.param('species'), wantColor = PI.param('color');
    let lv = 1, sp = null;
    if (wantLv !== null) { const n = parseInt(wantLv, 10); lv = n >= 1 && n <= 10 ? n : 1 + (Math.random() * 10 | 0); }
    if (wantSp !== null) {
      sp = PI.speciesById(wantSp) || pick(wantLv !== null ? PI.species['lv' + lv] : PI.allSpecies());
      lv = PI.levelOf(sp.id);
    }
    return { lv, sp: sp || pick(PI.species['lv' + lv]), color: wantColor && PI.palette.rgb[wantColor] ? wantColor : null };
  }
  const record = p => S.history.push({ lv: p.lv, id: p.sp.id, color: p.color, from: S.time, to: null });
  const closeRecord = () => { const last = S.history[S.history.length - 1]; if (last && last.to === null) last.to = S.time; };
  Gm.start = () => {
    const map = S.map, at = map.start || { x: 0, y: 0 }, form = startingForm();
    const p = PI.makeCreature(form.sp, form.lv, at.x, at.y, true);
    if (form.color) p.color = form.color;
    p.face = Math.PI / 4;
    S.player = p; S.gauge = 0; S.need = Gm.need(p.lv, p.sp.id); S.killer = null; S.overAt = 0; S.history = [];
    S.apexAt = p.lv >= 10 ? S.time + cfg.apexDelay : 0;
    record(p);
    for (const c of S.creatures) if (c.lv > p.lv && Math.hypot(c.x - p.x, c.y - p.y) < cfg.spawnMinDist) {
      const to = I.randomPoint((x, y) => farFromPlayer(x, y, cfg.spawnMinDist));
      c.x = to.x; c.y = to.y; c.home = { x: to.x, y: to.y };
    }
    p.morph = { t: cfg.morph * .4, from: null }; // it appears out of light
    p.invuln = cfg.morph + cfg.invincible;
    S.phase = 'play';
    PI.loop.snapCamera();
    stockMorsels(true);
    PI.ui.toast.show(PI.t('card.start', PI.describe(p)));
    PI.ui.hud.update();
  };
  Gm.addFood = n => {
    if (S.phase !== 'play' || S.player.lv >= 10) return;
    S.gauge += n;
    if (S.gauge >= S.need) evolve();
    PI.ui.hud.update();
  };
  // The player becomes a random species of the next level. The body flashes white, vanishes into light and comes
  // back in its new shape (see drawMorphing in loop.js).
  function evolve() {
    const p = S.player, lv = p.lv + 1;
    closeRecord();
    p.morph = { t: 0, from: { sp: p.sp, color: p.color, k: p.k, lv: p.lv, r: p.r } };
    PI.reshape(p, pick(PI.species['lv' + lv]), lv);
    record(p);
    p.invuln = cfg.morph + cfg.invincible;
    S.gauge = 0; S.need = Gm.need(lv, p.sp.id);
    Fx.shake(cfg.shake.evolve, .5);
    Fx.flash(.55, .3);
    Fx.buzz(40);
    PI.ui.toast.show(PI.t('card.evolve', PI.describe(p)));
    if (lv >= 10) { S.apexAt = S.time + cfg.apexDelay; PI.ui.toast.show(PI.t('card.apex', { s: cfg.apexDelay })); }
  }
  // The round ends in a loss. The camera turns to the creature that ate the player; the panel opens a moment later.
  function over(killer) {
    const p = S.player;
    closeRecord();
    S.killer = { words: PI.describe(killer), reached: p.lv, body: killer };
    Fx.burst(p.x, p.y, p.r, PI.palette.rgb[p.color], 30, 8);
    Fx.sparks(p.x, p.y, p.r, [255, 255, 255], 10, 1.2);
    Fx.ring(p.x, p.y, .3, 3.5, [226, 60, 52], .5);
    Fx.ring(p.x, p.y, .3, 6, [255, 255, 255], .7);
    Fx.shake(cfg.shake.over, .6);
    Fx.flash(.5, .25);
    Fx.buzz(140);
    killer.sqv += 9; killer.pop = .45;
    S.freeze = .16;
    S.player = null;
    S.phase = 'over';
    S.overAt = S.time + cfg.overDelay;
    PI.input.release();
    PI.ui.hud.update();
  }
  // The round ends in a win, config.apexDelay seconds after level 10. Every other creature bursts, nearest
  // first, while the player spins and rises into the sky. Then the report opens.
  function ascend() {
    const p = S.player;
    closeRecord();
    S.phase = 'finale'; S.finaleAt = S.time; S.apexAt = 0;
    S.morsels = []; S.respawns = [];
    p.invuln = 1e9; p.vx = 0; p.vy = 0; p.kx = 0; p.ky = 0; p.morph = null;
    for (const c of S.creatures) c.doom = S.time + .25 + Math.min(1.7, Math.hypot(c.x - p.x, c.y - p.y) * .07);
    Fx.shake(cfg.shake.finale, .7);
    Fx.flash(.7, .4);
    Fx.buzz(200);
    PI.input.release();
    PI.ui.toast.clear();
    PI.ui.hud.update();
  }
  function finale(dt) {
    const p = S.player, t = S.time - S.finaleAt, u = Math.min(1, t / cfg.finale);
    for (let n = S.creatures.length - 1; n >= 0; n--) {
      const c = S.creatures[n];
      if (c.doom > S.time) continue;
      S.creatures.splice(n, 1);
      if (!G.visible(c.x, c.y, 20)) continue;
      Fx.burst(c.x, c.y, c.r, PI.palette.rgb[c.color], 16, 6.5);
      Fx.ring(c.x, c.y, .3, c.r + 2.4, [255, 255, 255], .4);
      Fx.shake(2.5, .12);
    }
    p.face += dt * (5 + 30 * u * u);                       // it spins faster and faster
    if (u > .3) p.lift += dt * (.6 + (u - .3) * (u - .3) * 60); // and leaves the ground
    p.sq = .12 + u * .3;
    if (Math.random() < dt * 40) Fx.sparks(p.x, p.y, p.lift + p.r, GOLD, 2, 1.6 + u);
    if (Math.floor(t / .35) !== Math.floor((t - dt) / .35)) {
      Fx.ring(p.x, p.y, .5, 4 + u * 6, GOLD, .7);
      Fx.shake(1.5 + u * 3, .2);
    }
    if (u < 1) return;
    S.phase = 'clear';
    Fx.flash(1, .7);
    PI.ui.screens.show('report');
  }
  // feedback for one bite
  function bite(x, y, z, rgb, gain, big) {
    const p = S.player;
    Fx.burst(x, y, z, rgb, big ? 22 : 10, big ? 7 : 4.5);
    Fx.sparks(x, y, z, [255, 250, 220], big ? 7 : 3, .8);
    Fx.ring(x, y, .2, big ? 2.6 : 1.5, [255, 255, 255], .3);
    if (p.lv < 10) Fx.text(p.x, p.y, PI.builder.headHeight(p), '+' + gain);
    p.sqv += big ? 10 : 6;
    p.pop = Math.max(p.pop, big ? .38 : .22);
    Fx.buzz(big ? 18 : 8);
    if (big) { Fx.shake(cfg.shake.eat, .18); S.freeze = .06; }
  }
  function eat(c) {
    const gain = 1 + S.player.mods.food;
    S.creatures.splice(S.creatures.indexOf(c), 1);
    S.respawns.push(cfg.respawnDelay);
    bite(c.x, c.y, c.r, PI.palette.rgb[c.color], gain, true);
    PI.ui.toast.flash(PI.t('card.eat', PI.describe(c)));
    Gm.addFood(gain);
  }
  // The player eats a lower level from a little further away than anything else touches (config.eatReach
  // against config.touchReach). A higher level ends the round, and creatures of the same level push each other apart.
  Gm.collide = () => {
    const list = S.all(), playing = S.phase === 'play';
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const p = list[a], q = list[b];
      if (p.ride || q.ride) continue;
      const bites = playing && p.isPlayer && q.lv < p.lv, min = (p.r + q.r) * cfg.touchReach, reach = bites ? (p.r + q.r) * cfg.eatReach : min;
      const dx = q.x - p.x, dy = q.y - p.y;
      if (dx > reach || dx < -reach || dy > reach || dy < -reach) continue;
      const d = Math.hypot(dx, dy);
      if (d >= reach) continue;
      if (bites) { eat(q); return Gm.collide(); }
      if (d >= min) continue;
      if (playing && p.isPlayer && q.lv > p.lv && !(p.invuln > 0) && !p.mods.safe && !(q.stun > 0)) return over(q);
      const nx = d ? dx / d : 1, ny = d ? dy / d : 0, push = (min - d) / 2;
      const pw = p.isPlayer ? .3 : 1, qw = q.isPlayer ? .3 : 1;
      if (I.walkable(p.x - nx * push * pw, p.y - ny * push * pw)) { p.x -= nx * push * pw; p.y -= ny * push * pw; }
      if (I.walkable(q.x + nx * push * qw, q.y + ny * push * qw)) { q.x += nx * push * qw; q.y += ny * push * qw; }
    }
    const p = S.player;
    if (p && playing && !p.ride) for (let n = S.morsels.length - 1; n >= 0; n--) {
      const m = S.morsels[n];
      if (Math.hypot(m.x - p.x, m.y - p.y) >= p.r + .5) continue;
      S.morsels.splice(n, 1);
      bite(m.x, m.y, .3, BERRY[m.hue], 1, false);
      PI.ui.toast.flash(PI.t('card.berry'));
      Gm.addFood(1);
      if (S.phase !== 'play') return;
    }
  };
  let shownSecond = -1;
  Gm.tick = dt => {
    if (S.phase === 'finale') return finale(dt);
    for (let n = S.respawns.length - 1; n >= 0; n--) {
      S.respawns[n] -= dt;
      if (S.respawns[n] <= 0) { S.respawns.splice(n, 1); if (S.creatures.length < cfg.population) Gm.spawn(); }
    }
    stockMorsels(false);
    // creatures outside the player's range of levels are swapped for fitting ones, off screen
    if (S.player) for (let n = 0; n < 2; n++) {
      const lv = S.player.lv, c = S.creatures[Math.random() * S.creatures.length | 0];
      if (!c || (c.lv >= lv - 3 && c.lv <= lv + 3) || G.visible(c.x, c.y, 60)) continue;
      S.creatures.splice(S.creatures.indexOf(c), 1);
      Gm.spawn();
    }
    if (S.phase === 'play' && S.apexAt) {
      const left = Math.ceil(S.apexAt - S.time);
      if (left <= 0) ascend();
      else if (left !== shownSecond) { shownSecond = left; PI.ui.hud.update(); }
    }
    if (S.phase === 'over' && S.overAt && S.time >= S.overAt) { S.overAt = 0; PI.ui.screens.show('over'); }
  };
})();
