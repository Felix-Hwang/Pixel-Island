'use strict';
// Who is on the map. Creatures and berries are kept around the player: new ones arrive outside the view, and
// ones that are far away, out of the player's range of levels or on their way out are replaced.
(() => {
  const cfg = PI.config, S = PI.state, I = PI.island, G = PI.gfx, Gm = PI.game, pick = PI.pick;

  // The level of a new arrival around a player of level p, by config.levelShare. Level 1 has nothing below it,
  // so that share goes to its own level; level 10 has nothing above it, so that share goes to level 9.
  function pickLevel(p) {
    const share = cfg.levelShare, roll = Math.random();
    let step = 1, r = Math.random();
    for (let n = 0; n < cfg.levelSteps.length; n++) { r -= cfg.levelSteps[n]; if (r <= 0) { step = n + 1; break; } }
    if (roll < share.lower) return p === 1 ? 1 : Math.max(1, p - step);
    if (roll < 1 - cfg.higherShare(p)) return p;
    return p >= 10 ? 9 : Math.min(10, p + step);
  }
  const unseen = (x, y) => !G.visible(x, y, 30);
  // A new creature. During a round it arrives just outside the view, more often on the side the player is heading
  // for, and walks in toward where the player is going. anywhere: used when a map is first filled.
  Gm.spawn = (lv = pickLevel(S.player ? S.player.lv : 1), anywhere = false) => {
    const c = PI.makeCreature(pick(PI.species['lv' + lv]), lv, 0, 0), p = S.player, open = (x, y) => I.edge(x, y) < .8 && !PI.world.blocked(c, x, y);
    let at = null;
    if (!anywhere && p) {
      const near = Math.random() < .25; // a quarter arrive right beside the screen and walk in; the rest settle further out
      const speed = Math.hypot(p.vx, p.vy), ahead = { x: p.x + (speed > 1 ? p.vx / speed * 6 : 0), y: p.y + (speed > 1 ? p.vy / speed * 6 : 0) };
      at = I.randomPoint((x, y) => open(x, y) && unseen(x, y) && (near ? G.visible(x, y, 170) : Math.hypot(x - p.x, y - p.y) < cfg.bubble) && (Math.random() < .5 || Math.hypot(x - ahead.x, y - ahead.y) < Math.hypot(x - p.x, y - p.y)), 160);
      if (!unseen(at.x, at.y)) at = null;
      else if (!near) c.home = { x: at.x, y: at.y };
      else { // it sets out for a place near where the player is going
        const goal = { x: ahead.x + (Math.random() - .5) * 12, y: ahead.y + (Math.random() - .5) * 12 }, d = Math.hypot(goal.x - at.x, goal.y - at.y) || 1;
        c.home = I.walkable(goal.x, goal.y) ? goal : { x: at.x, y: at.y };
        c.ai.wx = (goal.x - at.x) / d; c.ai.wy = (goal.y - at.y) / d; c.ai.t = 2 + Math.random() * 2.5;
      }
    }
    if (!at) { at = I.randomPoint((x, y) => open(x, y) && (anywhere || unseen(x, y)), 120); c.home = { x: at.x, y: at.y }; }
    c.x = at.x; c.y = at.y; c.jam.x = at.x; c.jam.y = at.y;
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
  // From level 3 there are no berries. If too few edible creatures are on or beside the screen, the farthest one
  // is moved to just outside the view, so the player never has to wander an empty map looking for food.
  let preyCheck = 0;
  function stockPrey(dt) {
    const p = S.player;
    preyCheck -= dt;
    if (!p || S.phase !== 'play' || p.lv < 3 || p.lv >= 10 || preyCheck > 0) return;
    preyCheck = 1.2;
    let near = 0, far = null, farthest = 0;
    for (const c of S.creatures) {
      if (c.lv >= p.lv) continue;
      if (G.visible(c.x, c.y, 110)) { near++; continue; }
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d > farthest) { farthest = d; far = c; }
    }
    if (near >= cfg.preyNear) return;
    if (!far) { // nothing edible is left off screen, so one arrives in place of a creature nobody can see
      const spare = S.creatures.find(c => c.lv >= p.lv && !G.visible(c.x, c.y, 60));
      if (spare) S.creatures.splice(S.creatures.indexOf(spare), 1);
      else if (S.creatures.length >= cfg.population) return; // the map is full and nothing can make room
      far = Gm.spawn(Math.max(1, p.lv - 1 - (Math.random() * 2 | 0)));
    }
    const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && unseen(x, y) && G.visible(x, y, 110) && !PI.world.blocked(far, x, y), 160);
    if (unseen(at.x, at.y)) { far.x = at.x; far.y = at.y; far.home = { x: at.x, y: at.y }; far.vx = 0; far.vy = 0; }
  }
  Gm.stockFirstBerries = () => stockMorsels(true);
  // called every frame of a round
  Gm.restock = dt => {
    stockMorsels(false);
    stockPrey(dt);
    // Out of sight, a creature is swapped for a new arrival beside the screen when it is on its way out after an
    // evolution, when it has fallen outside the player's range of levels, or when it is far away. This keeps the
    // whole population around the player. A few are checked every frame.
    if (S.player && S.phase === 'play') for (let n = 0; n < 4; n++) {
      const p = S.player, c = S.creatures[Math.random() * S.creatures.length | 0];
      if (!c || G.visible(c.x, c.y, 60)) continue;
      if (!(c.leaving > 0) && c.lv >= p.lv - 3 && c.lv <= p.lv + 3 && Math.hypot(c.x - p.x, c.y - p.y) < cfg.bubble) continue;
      S.creatures.splice(S.creatures.indexOf(c), 1);
      Gm.spawn();
    }
  };
})();
