'use strict';
// The rules of a round: how it starts, eating, evolving, and the two ways it ends. population.js keeps the map stocked.
(() => {
  const cfg = PI.config, S = PI.state, I = PI.island, G = PI.gfx, Fx = PI.fx;
  const Gm = PI.game, pick = PI.pick;
  const BERRY = [[226, 58, 74], [246, 176, 44], [166, 92, 214]], GOLD = [255, 220, 90];
  Gm.berryColors = BERRY;

  Gm.need = (lv, id) => lv >= 10 ? 0 : Math.max(cfg.minFood, cfg.foodBase(lv) + cfg.grades[PI.grades[id] || 'B'].food);
  // Bites that follow each other within config.comboGap seconds climb a major scale, one note a bite.
  const SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
  let combo = 0, lastBite = -9;
  const farFromPlayer = (x, y, min) => !S.player || Math.hypot(x - S.player.x, y - S.player.y) >= min;
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
  // S.history gets one entry for every form the player takes
  const beginForm = p => S.history.push({ lv: p.lv, id: p.sp.id, color: p.color, from: S.time, to: null });
  const endForm = () => { const last = S.history[S.history.length - 1]; if (last && last.to === null) last.to = S.time; };
  // A round counts toward the records unless it could not be lost or did not start from a random level-1 form.
  const counts = () => PI.settings.get('chase') !== 'peace' && PI.param('lv') === null && PI.param('species') === null;
  function closeRound(lv) {
    endForm();
    const time = S.time - S.history[0].from;
    S.result = { time, beat: counts() ? PI.records.submit(lv, time) : null };
  }
  Gm.start = () => {
    const map = S.map, at = map.start || { x: 0, y: 0 }, form = startingForm();
    const p = PI.makeCreature(form.sp, form.lv, at.x, at.y, true);
    if (form.color) p.color = form.color;
    p.face = Math.PI / 4;
    S.player = p; S.gauge = 0; S.gifts = 0; S.need = Gm.need(p.lv, p.sp.id); S.killer = null; S.overAt = 0; S.history = []; S.result = null;
    combo = 0; lastBite = -9;
    S.apexAt = p.lv >= 10 ? S.time + cfg.apexDelay : 0;
    beginForm(p);
    for (const c of S.creatures) if (c.lv > p.lv && Math.hypot(c.x - p.x, c.y - p.y) < cfg.spawnMinDist) {
      const to = I.randomPoint((x, y) => farFromPlayer(x, y, cfg.spawnMinDist));
      c.x = to.x; c.y = to.y; c.home = { x: to.x, y: to.y };
    }
    p.morph = { t: cfg.morph * .4, from: null }; // it appears out of light
    p.invuln = cfg.morph + cfg.invincible;
    S.phase = 'play';
    S.calmUntil = S.time + cfg.calm;
    PI.input.guardBack();
    PI.loop.snapCamera();
    Gm.stockFirstBerries();
    PI.ui.toast.show(PI.t('card.start', PI.describe(p)));
    PI.ui.hints.firstRound();
    PI.audio.play('sfx_spawn');
    PI.ui.hud.update();
  };
  // gift: the food comes from terrain and not from a catch. Terrain fills at most config.giftShare of a gauge,
  // so standing at a food stall cannot replace hunting.
  Gm.giftLeft = () => S.phase === 'play' && S.player.lv < 10 ? Math.max(0, Math.floor(S.need * cfg.giftShare) - S.gifts) : 0;
  Gm.addFood = (n, gift = false) => {
    if (S.phase !== 'play' || S.player.lv >= 10) return;
    if (gift) {
      n = Math.min(n, Gm.giftLeft());
      if (n <= 0) return;
      S.gifts += n;
      Fx.text(S.player.x, S.player.y, PI.builder.headHeight(S.player), '+' + n);
      PI.audio.play('sfx_food_bonus');
    }
    S.gauge += n;
    if (S.gauge >= S.need) evolve();
    PI.ui.hud.update();
  };
  // The player becomes a random species of the next level. The body flashes white, vanishes into light and comes
  // back in its new shape (see drawMorphing in loop.js).
  function evolve() {
    const p = S.player, lv = p.lv + 1;
    endForm();
    p.morph = { t: 0, from: { sp: p.sp, color: p.color, k: p.k, lv: p.lv, r: p.r } };
    PI.reshape(p, pick(PI.species['lv' + lv]), lv);
    beginForm(p);
    p.invuln = cfg.morph + cfg.invincible;
    S.gauge = 0; S.gifts = 0; S.need = Gm.need(lv, p.sp.id);
    Fx.shake(cfg.shake.evolve, .5);
    Fx.flash(.55, .3);
    PI.audio.play(lv >= 10 ? 'sfx_apex_start' : 'sfx_evolve');
    for (const c of S.creatures) c.leaving = S.time + cfg.leaveTime; // the neighbourhood changes with every level
    PI.ui.toast.show(PI.t('card.evolve', PI.describe(p)));
    if (lv >= 10) { S.apexAt = S.time + cfg.apexDelay; PI.ui.toast.show(PI.t('card.apex', { s: cfg.apexDelay })); }
  }
  // The round ends in a loss. The camera turns to the creature that ate the player; the panel opens a moment later.
  function over(killer) {
    const p = S.player;
    closeRound(p.lv);
    S.killer = { words: PI.describe(killer), reached: p.lv, body: killer };
    Fx.burst(p.x, p.y, p.r, PI.palette.rgb[p.color], 30, 8);
    Fx.sparks(p.x, p.y, p.r, [255, 255, 255], 10, 1.2);
    Fx.ring(p.x, p.y, .3, 3.5, [226, 60, 52], .5);
    Fx.ring(p.x, p.y, .3, 6, [255, 255, 255], .7);
    Fx.shake(cfg.shake.over, .6);
    Fx.flash(.5, .25);
    PI.audio.play('sfx_death');
    killer.sqv += 9; killer.pop = .45;
    S.freeze = cfg.hitStop.over;
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
    closeRound(p.lv);
    S.phase = 'finale'; S.finaleAt = S.time; S.apexAt = 0;
    S.morsels = []; S.respawns = [];
    p.invuln = 1e9; p.vx = 0; p.vy = 0; p.kx = 0; p.ky = 0; p.morph = null;
    for (const c of S.creatures) c.doom = S.time + .25 + Math.min(1.7, Math.hypot(c.x - p.x, c.y - p.y) * .07);
    Fx.shake(cfg.shake.finale, .7);
    Fx.flash(.7, .4);
    PI.audio.play('sfx_guard_burst');
    PI.audio.play('sfx_ascend', { delay: cfg.finale - 2.45 }); // its burst lands on the last flash
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
      PI.audio.play('sfx_finale_pop', { gap: .07, rate: .85 + Math.random() * .4, volume: .7 });
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
    PI.audio.play('sfx_victory');
    PI.audio.hush(2.7);
  }
  function bite(x, y, z, rgb, gain, big) {
    const p = S.player;
    Fx.burst(x, y, z, rgb, big ? 22 : 10, big ? 7 : 4.5);
    Fx.sparks(x, y, z, [255, 250, 220], big ? 7 : 3, .8);
    Fx.ring(x, y, .2, big ? 2.6 : 1.5, [255, 255, 255], .3);
    if (p.lv < 10) Fx.text(p.x, p.y, PI.builder.headHeight(p), '+' + gain);
    p.sqv += big ? 10 : 6;
    p.pop = Math.max(p.pop, big ? .38 : .22);
    if (big) { Fx.shake(cfg.shake.eat, .18); S.freeze = cfg.hitStop.eat; }
    combo = S.time - lastBite < cfg.comboGap ? Math.min(combo + 1, SCALE.length - 1) : 0;
    lastBite = S.time;
    PI.audio.play(big ? 'sfx_eat_creature' : 'sfx_eat_berry', { rate: Math.pow(2, SCALE[combo] / 12) * (combo ? 1 : .94 + Math.random() * .12), gap: 0 });
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
  // against config.touchReach). A higher level ends the round, unless the pursuit setting is 'peace', and
  // everything else that touches pushes apart.
  Gm.collide = () => {
    const list = S.all(), playing = S.phase === 'play', deadly = PI.settings.get('chase') !== 'peace';
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
      if (deadly && playing && p.isPlayer && q.lv > p.lv && !(p.invuln > 0) && !p.mods.safe && !(q.stun > 0)) return over(q);
      const nx = d ? dx / d : 1, ny = d ? dy / d : 0, push = (min - d) / 2;
      if (playing && p.isPlayer && push > .04) PI.audio.play('sfx_push', { gap: .5, volume: .6 });
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
  // A safe moment has just ended: the one after evolving, after a ferry ride, or in a root shelter. Hunters that
  // stand on top of the player would kill it on the spot, so they are thrown back and dazed.
  Gm.guard = p => {
    let hit = false;
    for (const c of S.creatures) {
      const dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy);
      if (c.lv <= p.lv || d > cfg.guard.range + c.r) continue;
      c.kx = (d ? dx / d : 1) * cfg.guard.knock; c.ky = (d ? dy / d : 0) * cfg.guard.knock;
      c.stun = Math.max(c.stun, cfg.guard.stun); c.ai.restUntil = S.time + 1.5;
      hit = true;
    }
    if (!hit) return;
    Fx.ring(p.x, p.y, p.r, cfg.guard.range + 1, [255, 255, 255], .35);
    Fx.shake(cfg.shake.bump, .15);
    PI.audio.play('sfx_guard_burst');
  };
  let shownSecond = -1;
  Gm.tick = dt => {
    if (S.phase === 'finale') return finale(dt);
    for (let n = S.respawns.length - 1; n >= 0; n--) {
      S.respawns[n] -= dt;
      if (S.respawns[n] <= 0) { S.respawns.splice(n, 1); if (S.creatures.length < cfg.population) Gm.spawn(); }
    }
    Gm.restock(dt);
    if (S.phase === 'play' && S.apexAt) {
      const left = Math.ceil(S.apexAt - S.time);
      if (left <= 0) ascend();
      else if (left !== shownSecond) {
        shownSecond = left; PI.ui.hud.update();
        if (left <= 10) PI.audio.play('sfx_countdown_tick', { volume: .7, rate: left <= 3 ? 1.5 : 1 });
      }
    }
    if (S.phase === 'over' && S.overAt && S.time >= S.overAt) { S.overAt = 0; PI.ui.screens.show('over'); PI.audio.play('sfx_gameover'); }
  };
})();
