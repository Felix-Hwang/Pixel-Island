'use strict';
// The frame loop. update moves everything and draw paints one frame.
// Behaviour files only return the direction a creature wants to go. This file turns that into velocity, and
// movement.js carries the creature over the ground.
(() => {
  const G = PI.gfx, S = PI.state, cfg = PI.config, Wd = PI.world, B = PI.builder, Fx = PI.fx, Gm = PI.game, Mv = PI.movement;
  const L = PI.loop = {};
  const BERRY = Gm.berryColors.map(c => G.ramp(c)), LEAF = G.ramp([84, 170, 80]);
  const RING = G.pack(255, 255, 255), DANGER = G.pack(226, 60, 52), GOLD = [255, 220, 90];

  // The player's own effects show as a ring when one starts and a steady trickle of particles while it lasts.
  // Each also has a sound: [name, delay]. Water and mud have their own, so a slowing there is not announced twice.
  const BEGINS = { stun: ['sfx_status_stun', .15], safe: ['sfx_status_safe', 0], hidden: ['sfx_status_hidden', 0], fast: ['sfx_status_fast', .45], slip: ['sfx_slip', 0] };
  const ENDS = ['stun', 'safe', 'hidden', 'fast'];
  let statusKey = '', statusTick = 0, ground = '', foggy = false;
  function playerEffects(p, dt) {
    const list = PI.statusOf(p), key = list.join(), m = p.mods, Au = PI.audio;
    if (key !== statusKey) {
      const before = statusKey.split(',');
      for (const s of list) if (!before.includes(s)) {
        Fx.ring(p.x, p.y, .4, p.r + 2, PI.statusColors[s], .4);
        Fx.sparks(p.x, p.y, p.r, PI.statusColors[s], 8, 1);
        if (BEGINS[s]) Au.play(BEGINS[s][0], { delay: BEGINS[s][1], gap: .6 });
        else if (!m.ground && s === 'slow') Au.play('sfx_status_slow', { gap: .6 });
        else if (!m.ground && s === 'drift') Au.play('sfx_cloud_ride', { gap: .6 });
      }
      if (before.some(s => ENDS.includes(s) && !list.includes(s))) Au.play('sfx_status_end', { gap: .3 });
      statusKey = key;
      PI.ui.hud.update();
    }
    if (m.ground !== ground) { ground = m.ground; if (ground) Au.play(ground === 'mud' ? 'sfx_mud' : 'sfx_splash', { gap: .4 }); }
    if (m.detect < .9 !== foggy) { foggy = !foggy; if (foggy) Au.play('sfx_status_blind', { gap: 1 }); }
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
    Mv.crowd();
    PI.ai.census();
    const input = PI.input.read(), playing = S.phase === 'play', steady = S.map.steady || 0, v = { x: 0, y: 0 };
    const p = S.player, calm = S.time < S.calmUntil;
    for (const c of S.all()) {
      const m = Wd.mods(c);
      if (c.stun > 0) c.stun -= dt;
      if (c.invuln > 0) { c.invuln -= dt; if (c.invuln <= 0 && c.isPlayer && playing) Gm.guard(c); }
      if (c.bounce > 0) c.bounce -= dt;
      if (c.alert > 0) c.alert -= dt;
      if (c.leaving && S.time > c.leaving) c.leaving = 0; // it did not get away in time, so it stays
      if (c.ride) { B.tick(c, dt, 0, 0, 0); continue; } // it is being carried, and the interaction sets its position
      const top = c.speed * m.speed;
      v.x = 0; v.y = 0;
      if (!(c.stun > 0) && !(c.bounce > 0)) {
        if (c.isPlayer) { if (playing) { v.x = input.x; v.y = input.y; } }
        else {
          // One on its way out walks straight away from the player, and so does a hunter that comes close during
          // the calm at the start of a round. Everything else follows its behaviour.
          const backsOff = p && (c.leaving || (calm && c.lv > p.lv && Math.hypot(c.x - p.x, c.y - p.y) < cfg.calmGap));
          const away = backsOff ? PI.ai.away(c, p.x, p.y, .85) : null;
          const want = away ? PI.ai.home(c, away) : PI.behaviors[c.sp.behavior].steer(c, dt), len = Math.hypot(want.x, want.y);
          v.x = want.x + c.sepX * .8; v.y = want.y + c.sepY * .8;
          const cap = Math.max(len, Math.min(1, Math.hypot(c.sepX, c.sepY)) * .55), now = Math.hypot(v.x, v.y);
          if (now > cap && now > 0) { v.x *= cap / now; v.y *= cap / now; } // a crowd spreads at a walk
          Mv.unstick(c, dt, v);
          PI.motion.shape(c, v, dt, !!away || S.time - (c.ai.busy == null ? -9 : c.ai.busy) < .3 || c.ai.dash > 0 || S.time < c.jam.until);
          // It swims against the flow to hold its place, but not while it chases or flees. One that ignored the
          // current then would outrun a player who cannot.
          const busy = S.time - (c.ai.busy == null ? -9 : c.ai.busy) < .3 || c.ai.dash > 0;
          if (steady && top > 0 && !busy) { v.x -= m.driftX / top * steady; v.y -= m.driftY / top * steady; }
        }
      }
      const a = Math.min(1, cfg.accel * c.agile * m.accel * dt);
      c.vx += (v.x * top - c.vx) * a; c.vy += (v.y * top - c.vy) * a;
      Mv.step(c, (c.vx + c.kx + m.driftX) * dt, (c.vy + c.ky + m.driftY) * dt);
      const fade = Math.exp(-6 * dt);
      c.kx *= fade; c.ky *= fade;
      B.tick(c, dt, c.vx, c.vy, Math.hypot(c.vx, c.vy) / c.speed);
    }
    if (p && playing) playerEffects(p, dt);
    Gm.collide();
    Gm.tick(dt);
  };

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
    if (!document.hidden) { L.update(dt); L.draw(); PI.audio.tick(); }
    requestAnimationFrame(frame);
  }
  L.start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
})();
