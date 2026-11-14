'use strict';
// The frame loop. update moves everything and draw paints one frame.
// Behaviour files only return the direction a creature wants to go. Movement, collisions and terrain effects happen here.
(() => {
  const G = PI.gfx, S = PI.state, cfg = PI.config, I = PI.island, Wd = PI.world, B = PI.builder, Fx = PI.fx;
  const L = PI.loop = {};
  const BERRY = PI.game.berryColors.map(c => G.ramp(c)), LEAF = G.ramp([84, 170, 80]);
  const RING = G.pack(255, 255, 255), DANGER = G.pack(226, 60, 52), GOLD = [255, 220, 90];

  const canStand = (c, x, y) => I.walkable(x, y) && !Wd.blocked(c, x, y);
  const atBorder = (x, y) => I.edge(x, y) >= .92;
  function nearestOpen(c) {
    for (const r of [.4, .8, 1.3, 2, 3, 4.5]) for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2, x = c.x + Math.cos(a) * r, y = c.y + Math.sin(a) * r;
      if (canStand(c, x, y)) return { x, y };
    }
    return null;
  }
  // The border of the map pushes back. Whoever walks into it is thrown a short way inward and cannot steer for a moment.
  function rebound(c, nx, ny) {
    const power = Math.max(cfg.edgeBounce, c.speed * .9);
    c.kx = nx * power; c.ky = ny * power; c.vx = 0; c.vy = 0;
    c.bounce = .16; c.sqv -= 8;
    if (c.isPlayer) { Fx.shake(cfg.shake.bump, .14); Fx.burst(c.x, c.y, .2, [255, 255, 255], 6, 3); }
  }
  function move(c, dx, dy) {
    if (!canStand(c, c.x, c.y)) { // it was pushed somewhere it may not stand, so it heads for the nearest open ground
      const to = nearestOpen(c);
      if (to) { const l = Math.hypot(to.x - c.x, to.y - c.y) || 1, step = Math.min(l, .12); c.x += (to.x - c.x) / l * step; c.y += (to.y - c.y) / l * step; }
      return;
    }
    if (canStand(c, c.x + dx, c.y)) c.x += dx;
    else if (atBorder(c.x + dx, c.y)) rebound(c, -Math.sign(dx), 0);
    else { c.vx = 0; c.kx = 0; c.ai.t = Math.min(c.ai.t || 0, .2); }
    if (canStand(c, c.x, c.y + dy)) c.y += dy;
    else if (atBorder(c.x, c.y + dy)) rebound(c, 0, -Math.sign(dy));
    else { c.vy = 0; c.ky = 0; c.ai.t = Math.min(c.ai.t || 0, .2); }
  }
  // AI creatures that stand closer than config.crowd to each other get a push apart. A coarse grid keeps this cheap.
  function crowd() {
    const cell = cfg.crowd, grid = new Map(), key = (cx, cy) => cx * 4096 + cy;
    for (const c of S.creatures) {
      c.sepX = 0; c.sepY = 0;
      const k = key(Math.floor(c.x / cell), Math.floor(c.y / cell));
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(c);
    }
    for (const c of S.creatures) {
      const cx = Math.floor(c.x / cell), cy = Math.floor(c.y / cell);
      for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const near = grid.get(key(gx, gy));
        if (near) for (const o of near) {
          if (o === c) continue;
          const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy);
          if (d >= cell) continue;
          const push = (1 - d / cell) / (d || 1);
          c.sepX += (d ? dx : Math.random() - .5) * push; c.sepY += (d ? dy : Math.random() - .5) * push;
        }
      }
    }
  }
  // A creature that keeps trying to move but gets nowhere is wedged against something. Every config.stuck.window
  // seconds this checks how far it got. A wedged one is steered for a moment toward the first open direction,
  // looking around from the way home. One that stays wedged is moved to another place if nobody is looking,
  // and otherwise to the nearest open ground.
  function unstick(c, dt, v) {
    const k = c.jam, rule = cfg.stuck;
    if (S.time < k.until) { v.x = k.ax; v.y = k.ay; return; }
    k.t += dt; k.want += Math.hypot(v.x, v.y) * dt;
    if (k.t < rule.window) return;
    const moved = Math.hypot(c.x - k.x, c.y - k.y), tried = k.want / k.t;
    k.t = 0; k.want = 0; k.x = c.x; k.y = c.y;
    if (tried < .25 || moved >= rule.moved) { k.n = 0; return; }
    k.n++;
    if (k.n >= rule.giveUp && !G.visible(c.x, c.y, 20)) {
      const at = I.randomPoint((x, y) => I.edge(x, y) < .8 && !G.visible(x, y, 30), 120);
      c.x = at.x; c.y = at.y; c.home = { x: at.x, y: at.y }; k.n = 0; k.x = c.x; k.y = c.y;
      return;
    }
    const base = Math.atan2(c.home.y - c.y, c.home.x - c.x);
    for (let i = 0; i < 16; i++) {
      const a = base + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 8, dx = Math.cos(a), dy = Math.sin(a);
      if (!canStand(c, c.x + dx * .7, c.y + dy * .7) || !canStand(c, c.x + dx * 1.6, c.y + dy * 1.6)) continue;
      k.ax = dx * .8; k.ay = dy * .8; k.until = S.time + rule.escape;
      c.ai.wx = dx; c.ai.wy = dy; c.ai.t = 1.5; // and it keeps walking that way afterwards
      return;
    }
    if (k.n >= rule.giveUp) { const to = nearestOpen(c); if (to) { c.x = to.x; c.y = to.y; } k.n = 0; }
  }
  // The player's own effects show as a ring when one starts and a steady trickle of particles while it lasts.
  let statusKey = '', statusTick = 0;
  function playerEffects(p, dt) {
    const list = PI.statusOf(p), key = list.join();
    if (key !== statusKey) {
      for (const s of list) if (!statusKey.split(',').includes(s)) {
        Fx.ring(p.x, p.y, .4, p.r + 2, PI.statusColors[s], .4);
        Fx.sparks(p.x, p.y, p.r, PI.statusColors[s], 8, 1);
      }
      statusKey = key;
      PI.ui.hud.update();
    }
    statusTick -= dt;
    if (!list.length || statusTick > 0) return;
    statusTick = .1;
    const s = list[0], rgb = PI.statusColors[s], top = B.headHeight(p);
    if (s === 'fast') Fx.burst(p.x - p.vx * .06, p.y - p.vy * .06, p.r * .5, rgb, 2, 1.5);
    else if (s === 'slow' || s === 'drift') Fx.burst(p.x, p.y, top * .6, rgb, 1, 1.2);
    else if (s !== 'stun') Fx.sparks(p.x, p.y, top * .3, rgb, 1, p.r + .3);
  }
  // the camera follows the player; after a game over it follows the creature that ate the player
  const cam = L.cam = { x: 0, y: 0 };
  const focus = () => S.player || (S.phase === 'over' && S.killer && S.killer.body) || null;
  L.snapCamera = () => { const at = focus() || S.map.start || { x: 0, y: 0 }; cam.x = at.x; cam.y = at.y; };
  L.update = dt => {
    Fx.update(dt);
    if (S.freeze > 0) { S.freeze -= dt; return; }
    S.time += dt;
    const target = focus();
    if (target) {
      const k = 1 - Math.exp(-dt * (S.player ? cfg.cameraFollow : 3.5));
      cam.x += (target.x - cam.x) * k; cam.y += (target.y - cam.y) * k;
    }
    Wd.update(dt);
    crowd();
    const input = PI.input.read(), playing = S.phase === 'play', steady = S.map.steady || 0, v = { x: 0, y: 0 };
    for (const c of S.all()) {
      const m = Wd.mods(c);
      if (c.stun > 0) c.stun -= dt;
      if (c.invuln > 0) { c.invuln -= dt; if (c.invuln <= 0 && c.isPlayer && playing) Gm().guard(c); }
      if (c.bounce > 0) c.bounce -= dt;
      if (c.ride) { B.tick(c, dt, 0, 0, 0); continue; } // it is being carried, and the interaction sets its position
      const top = c.speed * m.speed;
      v.x = 0; v.y = 0;
      if (!(c.stun > 0) && !(c.bounce > 0)) {
        if (c.isPlayer) { if (playing) { v.x = input.x; v.y = input.y; } }
        else {
          const want = PI.behaviors[c.sp.behavior].steer(c, dt), len = Math.hypot(want.x, want.y);
          v.x = want.x + c.sepX * .8; v.y = want.y + c.sepY * .8;
          const cap = Math.max(len, Math.min(1, Math.hypot(c.sepX, c.sepY)) * .55), now = Math.hypot(v.x, v.y);
          if (now > cap && now > 0) { v.x *= cap / now; v.y *= cap / now; } // a crowd spreads at a walk
          unstick(c, dt, v);
          // It swims against the flow to hold its place, but not while it chases or flees. One that ignored the
          // current then would outrun a player who cannot.
          const busy = S.time - (c.ai.busy == null ? -9 : c.ai.busy) < .3 || c.ai.dash > 0;
          if (steady && top > 0 && !busy) { v.x -= m.driftX / top * steady; v.y -= m.driftY / top * steady; }
        }
      }
      const a = Math.min(1, cfg.accel * c.agile * m.accel * dt);
      c.vx += (v.x * top - c.vx) * a; c.vy += (v.y * top - c.vy) * a;
      move(c, (c.vx + c.kx + m.driftX) * dt, (c.vy + c.ky + m.driftY) * dt);
      const fade = Math.exp(-6 * dt);
      c.kx *= fade; c.ky *= fade;
      B.tick(c, dt, c.vx, c.vy, Math.hypot(c.vx, c.vy) / c.speed);
    }
    if (S.player && playing) playerEffects(S.player, dt);
    Gm().collide();
    Gm().tick(dt);
  };
  const Gm = () => PI.game;

  // A creature that is changing shape is drawn first as its old body in white, then as light alone, then as the new body.
  function drawMorphing(c, t) {
    const m = c.morph, u = m.t / cfg.morph, top = B.headHeight(c) * .5;
    const swell = u < .45 ? u / .45 : 1 - (u - .45) / .55;
    Fx.glow(c.x, c.y, top, 8 + (c.r * G.U + 18) * swell, .4 + swell * .6);
    Fx.beam(c.x, c.y, Math.round(3 + swell * (c.r * G.U * .7 + 4)), swell * .9);
    if (Math.random() < .6) { // sparks circle in toward the body, then out again
      const a = t * 9 + Math.random() * 6.3, d = (u < .5 ? 1 - u : u) * (c.r + 2.4);
      Fx.sparks(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * .6, top * (.4 + u), [255, 244, 190], 1, .2);
    }
    if (u < .34) { if (m.from) B.draw(Object.assign({}, c, m.from), t, { flash: true }); }
    else if (u >= .52) B.draw(c, t, { flash: u < .74 });
    if (u >= .52 && !m.shown) { // the moment the new shape appears
      m.shown = true;
      c.sqv += 11; c.pop = .45;
      Fx.burst(c.x, c.y, top, [255, 244, 190], 28, 7.5);
      Fx.burst(c.x, c.y, top, PI.palette.rgb[c.color], 14, 5);
      Fx.ring(c.x, c.y, c.r * .5, c.r + 3.4, [255, 240, 170], .45);
      Fx.ring(c.x, c.y, c.r * .5, c.r + 6, [255, 255, 255], .65);
      if (c.isPlayer) { Fx.flash(.45, .22); Fx.shake(cfg.shake.evolve * .7, .25); }
    }
  }
  L.draw = () => {
    const t = S.time, shake = Fx.offset(), p = S.player, ending = S.phase === 'finale' && p;
    G.lookAt(cam.x + shake.x / G.U, cam.y + shake.y / (G.U * G.SIN));
    G.restore();
    Wd.drawGround();
    if (ending) {
      const u = Math.min(1, (t - S.finaleAt) / cfg.finale);
      Fx.beam(p.x, p.y, Math.round(8 + u * 14), .45 + u * .5);
      Fx.glow(p.x, p.y, p.lift + p.r, 16 + u * 22, .6 + u * .4);
    }
    for (const c of S.all()) {
      c.seen = G.visible(c.x, c.y, 60) || c.lift > 0; // off-screen creatures are not drawn at all
      if (!c.seen) continue;
      c.dim = Wd.dim(c);
      if (c.morph) { drawMorphing(c, t); continue; }
      if (c.isPlayer && S.phase === 'play' && c.invuln > 0 && Math.floor(t * 6) % 2) continue; // blink while invincible, three times a second
      B.draw(c, t, { dim: c.dim, flash: c === ending && Math.floor(t * 4) % 2 === 0 });
    }
    for (const m of S.morsels) {
      if (!G.visible(m.x, m.y, 10)) continue;
      const r = .3, z = r + .08 + Math.round(Math.sin(Math.floor(t * 6) / 6 * 3 + m.bob)) * .1;
      G.ball(m.x, m.y, z, r, BERRY[m.hue], G.STYLE.GLOSS, G.KIND.BODY);
      G.ball(m.x + r * .5, m.y, z + r * 1.05, r * .42, LEAF, G.STYLE.FLAT, G.KIND.BODY);
      G.shadowBlob(m.x, m.y, 0, r * .9, 2);
    }
    Wd.draw();
    G.drawWind(t);
    G.applyShadows();
    G.outline(G.KIND.BODY);
    Fx.drawGlow();
    Wd.drawOver();
    const killer = S.phase === 'over' && S.killer && S.killer.body;
    if (p && !p.ride && !p.lift) {
      G.groundRing(p.x, p.y, p.r + .35, RING, 2, Math.floor(t * 8)); // a white ring on the ground marks the player
      if (S.phase === 'play' && p.invuln > 0 && !p.morph) { // a gold ring closes in as the safe moment runs out
        G.groundRing(p.x, p.y, p.r + .35 + Math.min(1, p.invuln / cfg.invincible) * 1.3, G.pack(GOLD[0], GOLD[1], GOLD[2]), 0, 0);
      }
      const effect = S.phase === 'play' && PI.statusOf(p)[0];
      if (effect) { // and a second, coloured ring pulses while an effect is on
        const rgb = PI.statusColors[effect];
        G.groundRing(p.x, p.y, p.r + .75 + (Math.floor(t * 6) % 2) * .15, G.pack(rgb[0], rgb[1], rgb[2]), 0, 0);
      }
    }
    if (killer) G.groundRing(killer.x, killer.y, killer.r + .45, DANGER, 2, Math.floor(t * 8));
    for (const c of S.all()) if (c.seen && !c.dim && !c.morph && !c.lift) PI.ui.stars.draw(c);
    Fx.draw();
    G.present();
    // shift the canvas by the camera's sub-pixel remainder, rounded to whole device pixels so it stays sharp
    const dpr = window.devicePixelRatio || 1, scale = G.scale || 1;
    const shift = 'translate(' + -Math.round(G.subX * scale * dpr) / dpr + 'px,' + -Math.round(G.subY * scale * dpr) / dpr + 'px)';
    if (shift !== shifted) { shifted = shift; G.canvas.style.transform = shift; }
  };
  let shifted = '';

  let last = 0, running = false;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (!document.hidden) { L.update(dt); L.draw(); }
    requestAnimationFrame(frame);
  }
  L.start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
})();
