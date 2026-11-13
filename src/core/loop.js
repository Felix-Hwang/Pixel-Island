'use strict';
// The frame loop. update moves everything and draw paints one frame.
// Behaviour files only return the direction a creature wants to go. Movement, collisions and terrain effects happen here.
(() => {
  const G = PI.gfx, S = PI.state, cfg = PI.config, I = PI.island, Wd = PI.world, B = PI.builder;
  const L = PI.loop = {};
  const BERRY = [[214, 70, 82], [240, 180, 60], [150, 96, 190]];
  const RING = G.pack(255, 255, 255);

  const canStand = (c, x, y) => I.walkable(x, y) && !Wd.blocked(c, x, y);
  function move(c, dx, dy) {
    if (!canStand(c, c.x, c.y)) { // it stands somewhere it may not (a wave or a tide pushed it there), so let it walk back in
      const from = I.edge(c.x, c.y);
      if (I.edge(c.x + dx, c.y + dy) <= from || canStand(c, c.x + dx, c.y + dy)) { c.x += dx; c.y += dy; }
      else { const l = Math.hypot(c.x, c.y) || 1; c.x -= c.x / l * .05; c.y -= c.y / l * .05; }
      return;
    }
    if (canStand(c, c.x + dx, c.y)) c.x += dx; else { c.vx = 0; c.kx = 0; c.ai.t = 0; }
    if (canStand(c, c.x, c.y + dy)) c.y += dy; else { c.vy = 0; c.ky = 0; c.ai.t = 0; }
  }
  // the camera follows the player; before and after a round it rests where it is
  const cam = L.cam = { x: 0, y: 0 };
  L.snapCamera = () => { const at = S.player || S.map.start || { x: 0, y: 0 }; cam.x = at.x; cam.y = at.y; };
  L.update = dt => {
    S.time += dt;
    if (S.player) {
      const k = 1 - Math.exp(-dt * 7);
      cam.x += (S.player.x - cam.x) * k; cam.y += (S.player.y - cam.y) * k;
    }
    Wd.update(dt);
    const input = PI.input.read(), playing = S.phase === 'play';
    for (const c of S.all()) {
      const m = Wd.mods(c);
      if (c.stun > 0) c.stun -= dt;
      if (c.invuln > 0) c.invuln -= dt;
      if (c.ride) { B.tick(c, dt, 0, 0, 0); continue; } // it is being carried, and the interaction sets its position
      let sx = 0, sy = 0;
      if (!(c.stun > 0)) {
        if (c.isPlayer) { if (playing) { sx = input.x; sy = input.y; } }
        else { const v = PI.behaviors[c.sp.behavior].steer(c, dt); sx = v.x; sy = v.y; }
      }
      const top = c.speed * m.speed, a = Math.min(1, cfg.accel * m.accel * dt);
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

  L.draw = () => {
    const t = S.time;
    G.lookAt(cam.x, cam.y);
    G.restore();
    Wd.drawGround();
    for (const c of S.all()) {
      c.seen = G.visible(c.x, c.y, 60); // off-screen creatures are not drawn at all
      if (!c.seen) continue;
      c.dim = Wd.dim(c);
      if (c.isPlayer && c.invuln > 0 && Math.floor(t * 12) % 2) continue; // blink while invincible
      B.draw(c, t, { dim: c.dim });
    }
    for (const m of S.morsels) {
      if (!G.visible(m.x, m.y, 10)) continue;
      const z = .2 + Math.round(Math.sin(Math.floor(t * 6) / 6 * 3 + m.bob)) * .05;
      G.ball(m.x, m.y, z, .17, G.ramp(BERRY[m.hue]), G.STYLE.GLOSS, G.KIND.BODY);
      G.shadowBlob(m.x, m.y, 0, .15, 2);
    }
    Wd.draw();
    G.drawWind(t);
    G.applyShadows();
    G.outline(G.KIND.BODY);
    Wd.drawOver();
    const p = S.player;
    if (p && !p.ride) G.groundRing(p.x, p.y, p.r + .35, RING, 2, Math.floor(t * 8)); // a white ring on the ground marks the player
    for (const c of S.all()) if (c.seen && !c.dim) PI.ui.stars.draw(c);
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
