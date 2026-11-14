'use strict';
// High altitude. Above the treeline every creature moves slower, and food the player eats there
// fills more of the gauge.
// cfg: speed (factor in the high zone), food (extra gauge per meal eaten there)
PI.registerInteraction('mountain', 'high-altitude', {
  modify(cfg, st, c, m) {
    if (!PI.world.map.high(c.x, c.y)) return;
    m.speed *= cfg.speed;
    m.food += cfg.food;
  },
  // a small mark above the player while they are in the high zone
  drawOver() {
    const G = PI.gfx, p = PI.state.player;
    if (!p || !PI.world.map.high(p.x, p.y)) return;
    const t = Math.floor(PI.state.time * 5) % 4;
    G.stamp(['X.X', '...', '.X.'], G.sx(p.x) + 10, G.sy(p.y, PI.builder.headHeight(p)) - 4 - t, { X: G.pack(210, 226, 255) });
  },
});
