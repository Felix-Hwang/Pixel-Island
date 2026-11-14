'use strict';
// The frame loop. update moves everything and draw paints one frame.
// Behaviour files only return the direction a creature wants to go. Movement, collisions and terrain effects happen here.
(() => {
  const G = PI.gfx, S = PI.state, cfg = PI.config, I = PI.island, Wd = PI.world, B = PI.builder, Fx = PI.fx;
  const L = PI.loop = {};
  const BERRY = PI.game.berryColors.map(c => G.ramp(c)), LEAF = G.ramp([84, 170, 80]);
  const RING = G.pack(255, 255, 255), DANGER = G.pack(226, 60, 52);

  const canStand = (c, x, y) => I.walkable(x, y) && !Wd.blocked(c, x, y);
  const atBorder = (x, y) => I.edge(x, y) >= .92;
  // The border of the map pushes back: whoever walks into it is thrown a short way inward and cannot steer for a moment.
  function rebound(c, nx, ny) {
    const power = Math.max(cfg.edgeBounce, c.speed * .9);
    c.kx = nx * power; c.ky = ny * power; c.vx = 0; c.vy = 0;
    c.bounce = .16; c.sqv -= 5;
    if (c.isPlayer) Fx.shake(cfg.shake.bump, .12);
  }
  function move(c, dx, dy) {
    if (!canStand(c, c.x, c.y)) { // it stands somewhere it may not (a wave or a tide pushed it there), so let it walk back in
      const from = I.edge(c.x, c.y);
      if (I.edge(c.x + dx, c.y + dy) <= from || canStand(c, c.x + dx, c.y + dy)) { c.x += dx; c.y += dy; }
      else { const l = Math.hypot(c.x, c.y) || 1; c.x -= c.x / l * .05; c.y -= c.y / l * .05; }
      return;
    }
    if (canStand(c, c.x + dx, c.y)) c.x += dx;
    else if (atBorder(c.x + dx, c.y)) rebound(c, -Math.sign(dx), 0);
    else { c.vx = 0; c.kx = 0; c.ai.t = 0; }
    if (canStand(c, c.x, c.y + dy)) c.y += dy;
    else if (atBorder(c.x, c.y + dy)) rebound(c, 0, -Math.sign(dy));
    else { c.vy = 0; c.ky = 0; c.ai.t = 0; }
  }
  // AI creatures that stand closer than config.crowd to each other get a push apart, so they never pile up in one
  // place. A coarse grid keeps this cheap.
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
  // the camera follows the player; after a game over it follows the creature that ate the player
  const cam = L.cam = { x: 0, y: 0 };
  const focus = () => S.player || (S.phase === 'over' && S.killer && S.killer.body) || null;
  L.snapCamera = () => { const at = focus() || S.map.start || { x: 0, y: 0 }; cam.x = at.x; cam.y = at.y; };
  L.update = dt => {
    Fx.update(dt);
    if (S.freeze > 0) { S.freeze -= dt; return; } // a short stop on a hit; effects keep moving
    S.time += dt;
    const target = focus();
    if (target) {
      const k = 1 - Math.exp(-dt * (S.player ? 7 : 3.5));
      cam.x += (target.x - cam.x) * k; cam.y += (target.y - cam.y) * k;
    }
    Wd.update(dt);
    crowd();
    const input = PI.input.read(), playing = S.phase === 'play';
    for (const c of S.all()) {
      const m = Wd.mods(c);
      if (c.stun > 0) c.stun -= dt;
      if (c.invuln > 0) c.invuln -= dt;
      if (c.bounce > 0) c.bounce -= dt;
      if (c.ride) { B.tick(c, dt, 0, 0, 0); continue; } // it is being carried, and the interaction sets its position
      let sx = 0, sy = 0;
      if (!(c.stun > 0) && !(c.bounce > 0)) {
        if (c.isPlayer) { if (playing) { sx = input.x; sy = input.y; } }
        else {
          const v = PI.behaviors[c.sp.behavior].steer(c, dt), len = Math.hypot(v.x, v.y);
          sx = v.x + c.sepX * .8; sy = v.y + c.sepY * .8;
          const top = Math.max(len, Math.min(1, Math.hypot(c.sepX, c.sepY)) * .55), now = Math.hypot(sx, sy);
          if (now > top && now > 0) { sx *= top / now; sy *= top / now; } // a crowd spreads at a walk; it never adds speed
        }
      }
      const top = c.speed * m.speed, a = Math.min(1, cfg.accel * c.agile * m.accel * dt);
      c.vx += (sx * top - c.vx) * a; c.vy += (sy * top - c.vy) * a;
      move(c, (c.vx + c.kx + m.driftX) * dt, (c.vy + c.ky + m.driftY) * dt);
      const fade = Math.exp(-6 * dt);
      c.kx *= fade; c.ky *= fade;
      B.tick(c, dt, c.vx, c.vy, Math.hypot(c.vx, c.vy) / c.speed);
    }
    Gm().collide();
    Gm().tick(dt);
  };
  const Gm = () => PI.game;

  // A creature that is changing shape: first its old body in white, then only light, then the new body.
  function drawMorphing(c, t) {
    const m = c.morph, u = m.t / cfg.morph, top = B.headHeight(c) * .5;
    const swell = u < .45 ? u / .45 : 1 - (u - .45) / .55;
    Fx.glow(c.x, c.y, top, 6 + (c.r * G.U + 14) * swell, .35 + swell * .65);
    if (u < .34) { if (m.from) B.draw(Object.assign({}, c, m.from), t, { flash: true }); }
    else if (u >= .52) B.draw(c, t, { flash: u < .74 });
    if (u >= .52 && !m.shown) { // the moment the new shape appears
      m.shown = true;
      c.sqv += 7; c.pop = .35;
      Fx.burst(c.x, c.y, top, [255, 244, 190], 18, 6);
      Fx.ring(c.x, c.y, c.r * .5, c.r + 3.2, [255, 240, 170], .45);
    }
  }
  L.draw = () => {
    const t = S.time, shake = Fx.offset();
    G.lookAt(cam.x + shake.x / G.U, cam.y + shake.y / (G.U * G.SIN));
    G.restore();
    Wd.drawGround();
    for (const c of S.all()) {
      c.seen = G.visible(c.x, c.y, 60); // off-screen creatures are not drawn at all
      if (!c.seen) continue;
      c.dim = Wd.dim(c);
      if (c.morph) { drawMorphing(c, t); continue; }
      if (c.isPlayer && c.invuln > 0 && Math.floor(t * 12) % 2) continue; // blink while invincible
      B.draw(c, t, { dim: c.dim });
    }
    for (const m of S.morsels) {
      if (!G.visible(m.x, m.y, 10)) continue;
      // a berry with a leaf; it bobs so it reads as something to pick up
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
    const p = S.player, killer = S.phase === 'over' && S.killer && S.killer.body;
    if (p && !p.ride) G.groundRing(p.x, p.y, p.r + .35, RING, 2, Math.floor(t * 8)); // a white ring on the ground marks the player
    if (killer) G.groundRing(killer.x, killer.y, killer.r + .45, DANGER, 2, Math.floor(t * 8)); // and a red one marks the killer
    for (const c of S.all()) if (c.seen && !c.dim && !c.morph) PI.ui.stars.draw(c);
    Fx.draw();
    G.present();
  };

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
