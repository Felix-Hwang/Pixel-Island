'use strict';
// Level marks: three star slots above every creature, stamped into the canvas as small bitmaps.
// Levels 1-3 fill green stars, 4-6 blue, 7-9 yellow, and level 10 shows three red stars.
// Star colour shows the level. It is unrelated to body colour.
(() => {
  const G = PI.gfx;
  const FULL = ['..X..', '.XXX.', 'XXXXX', '.XXX.', '.X.X.'];
  const EMPTY = ['.....', '..o..', '.o.o.', '..o..', '.....'];
  const TIER = [[72, 168, 84], [62, 128, 224], [244, 196, 40], [226, 60, 52]].map(c => G.pack(c[0], c[1], c[2]));
  const HOLLOW = G.pack(150, 146, 140), DIZZY = G.pack(255, 206, 40);
  const St = PI.ui.stars = {};
  St.tier = lv => lv >= 10 ? 3 : Math.floor((lv - 1) / 3);
  St.filled = lv => lv >= 10 ? 3 : (lv - 1) % 3 + 1;
  St.draw = c => {
    const left = Math.round(G.sx(c.x)) - 8, top = Math.round(G.sy(c.y, PI.builder.headHeight(c))) - 8;
    const n = St.filled(c.lv), palette = { X: TIER[St.tier(c.lv)], o: HOLLOW };
    for (let i = 0; i < 3; i++) G.stamp(i < n ? FULL : EMPTY, left + i * 6, top, palette, i < n);
    if (c.stun > 0) { // while stunned, two yellow pixels circle the head
      const a = Math.floor(PI.state.time * 10) * .8;
      for (const off of [0, Math.PI]) G.stamp(['X'], left + 8 + Math.cos(a + off) * 6, top + 8 + Math.sin(a + off) * 2, { X: DIZZY });
    }
  };
})();
