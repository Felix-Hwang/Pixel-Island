'use strict';
// Granite wall. A creature that runs into one bounces back at the speed it arrived with.
// cfg: walls [{ x, y, hx, hy }]
PI.registerInteraction('mountain', 'granite-wall', {
  bake(cfg) {
    cfg.walls.forEach((w, n) => {
      const b = { x: w.x, y: w.y, z0: 0, z1: 1.5, hx: w.hx, hy: w.hy, yaw: 0 };
      PI.props.box(b, [156, 156, 168], { seed: n * 5 + 2, grain: 1.6 });
      PI.island.addCover(w.x, w.y + w.hy + 1, 1.2);
    });
  },
  blocks(cfg, st, c, x, y) {
    for (const w of cfg.walls) if (Math.abs(x - w.x) < w.hx + .3 && Math.abs(y - w.y) < w.hy + .3) return true;
    return false;
  },
  // Look one step ahead. A creature about to hit a wall has its velocity mirrored.
  update(cfg, st, dt) {
    for (const c of PI.world.creatures()) {
      const vx = c.vx + c.kx, vy = c.vy + c.ky;
      if (Math.abs(vx) + Math.abs(vy) < .3) continue;
      const nx = c.x + vx * dt * 2, ny = c.y + vy * dt * 2;
      for (const w of cfg.walls) {
        if (Math.abs(nx - w.x) >= w.hx + .3 || Math.abs(ny - w.y) >= w.hy + .3) continue;
        const sideHit = Math.abs(c.x - w.x) - w.hx > Math.abs(c.y - w.y) - w.hy; // which face is it nearer to
        if (sideHit) { c.kx = -vx; c.vx = 0; if (c.ai.wx) c.ai.wx = -c.ai.wx; }
        else { c.ky = -vy; c.vy = 0; if (c.ai.wy) c.ai.wy = -c.ai.wy; }
        c.pop = Math.max(c.pop, .3);
        if (c.isPlayer) PI.audio.play('sfx_bump_edge', { gap: .3 });
        break;
      }
    }
  },
});
