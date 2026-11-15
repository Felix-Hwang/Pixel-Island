'use strict';
// Moving a creature over the ground: where it may stand, what happens at the border of the map and against
// something solid, how a crowd spreads out, and how a creature that is wedged gets free.
(() => {
  const G = PI.gfx, S = PI.state, cfg = PI.config, I = PI.island, Wd = PI.world, Fx = PI.fx;
  const Mv = PI.movement = {};

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
    if (c.isPlayer) { Fx.shake(cfg.shake.bump, .14); Fx.burst(c.x, c.y, .2, [255, 255, 255], 6, 3); PI.audio.play('sfx_bump_edge', { gap: .2 }); }
  }
  function move(c, dx, dy) {
    if (!canStand(c, c.x, c.y)) { // it was pushed somewhere it may not stand, so it heads for the nearest open ground
      const to = nearestOpen(c);
      if (to) { const l = Math.hypot(to.x - c.x, to.y - c.y) || 1, step = Math.min(l, .12); c.x += (to.x - c.x) / l * step; c.y += (to.y - c.y) / l * step; }
      return;
    }
    const x0 = c.x, y0 = c.y, step = Math.hypot(dx, dy);
    let hitX = false, hitY = false;
    if (canStand(c, c.x + dx, c.y)) c.x += dx;
    else if (atBorder(c.x + dx, c.y)) rebound(c, -Math.sign(dx), 0);
    else hitX = true;
    if (canStand(c, c.x, c.y + dy)) c.y += dy;
    else if (atBorder(c.x, c.y + dy)) rebound(c, 0, -Math.sign(dy));
    else hitY = true;
    if (!hitX && !hitY) return;
    // it got less than half as far as it meant to, so the thing is dead ahead
    if (Math.hypot(c.x - x0, c.y - y0) < step * .5 && sidestep(c, dx, dy, step)) return;
    if (hitX) { c.vx = 0; c.kx = 0; }
    if (hitY) { c.vy = 0; c.ky = 0; }
    c.ai.t = Math.min(c.ai.t || 0, .2);
  }
  // A trunk, a post or a rock is in the way. The creature keeps its speed and passes on the side it is already
  // nearer to, or on the side it took last time when it meets the thing head on. Only round things are stepped
  // around: sliding along a wall that nobody steered along would feel like ice.
  function sidestep(c, dx, dy, step) {
    const s = I.solidAt(c.x + dx, c.y + dy) || I.solidAt(c.x + dx, c.y) || I.solidAt(c.x, c.y + dy);
    if (!s || s.r == null) return false;
    const cross = dx * (s.y - c.y) - dy * (s.x - c.x); // which side of the heading the middle of the thing lies on
    const side = Math.abs(cross) > step * .02 ? -Math.sign(cross) : c.passSide || 1, heading = Math.atan2(dy, dx);
    for (const turn of [.9, 1.5]) {
      const x = c.x + Math.cos(heading + side * turn) * step, y = c.y + Math.sin(heading + side * turn) * step;
      if (!canStand(c, x, y)) continue;
      c.x = x; c.y = y; c.passSide = side;
      return true;
    }
    return false;
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
  Mv.step = move;
  Mv.crowd = crowd;
  Mv.unstick = unstick;
})();
