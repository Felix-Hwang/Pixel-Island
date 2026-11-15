'use strict';
// Level marks: three star slots above every creature, drawn into the canvas with a dark outline and two tones
// of shading. Levels 1-3 fill green stars, 4-6 blue, 7-9 yellow, and level 10 shows three red stars.
// Above the stars, small icons show the effects a creature is under (see PI.statusOf).
(() => {
  const G = PI.gfx;
  const STAR = ['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', '.X...X.'];
  const ICONS = {
    fast: ['X..X...', '.X..X..', '..X..X.', '...X..X', '..X..X.', '.X..X..', 'X..X...'],
    slow: ['X.....X', '.X...X.', '..X.X..', 'X..X..X', '.X...X.', '..X.X..', '...X...'],
    stun: ['.......', '.X.X.X.', '..XXX..', 'XXXXXXX', '..XXX..', '.X.X.X.', '.......'],
    safe: ['XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '.XXXXX.', '..XXX..', '...X...'],
    hidden: ['X......', '.XXXXX.', 'X.X...X', 'X..X..X', 'X...X.X', '.XXXXX.', '......X'],
    feast: ['..XXX..', '..XXX..', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '..XXX..', '..XXX..'],
    slip: ['.......', '.XX...X', 'X..X.X.', '....X..', '.XX...X', 'X..X.X.', '....X..'],
    drift: ['...X...', '....X..', 'XXXXXX.', 'XXXXXXX', 'XXXXXX.', '....X..', '...X...'],
    blind: ['.......', '..XX...', '.XXXXX.', 'XXXXXXX', 'XXXXXXX', '.......', '.......'],
    alert: ['..XXX..', '..XXX..', '..XXX..', '..XXX..', '.......', '..XXX..', '..XXX..'],
  };
  const TIERS = [[72, 176, 88], [66, 136, 232], [246, 200, 44], [230, 64, 56]], EMPTY = [86, 84, 92];
  const INK = G.pack(26, 24, 34);
  const tones = rgb => [G.pack(rgb[0], rgb[1], rgb[2]), G.pack(rgb[0] + (255 - rgb[0]) * .55, rgb[1] + (255 - rgb[1]) * .55, rgb[2] + (255 - rgb[2]) * .55), G.pack(rgb[0] * .68, rgb[1] * .66, rgb[2] * .74)];
  // A bitmap as a list of [x, y, tone]: tone 3 is the outline, 1 the lit upper left, 2 the shaded lower right.
  function sprite(rows) {
    const on = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < rows[y].length && rows[y][x] === 'X', out = [];
    for (let y = -1; y <= rows.length; y++) for (let x = -1; x <= rows[0].length; x++) {
      if (on(x, y)) out.push([x, y, y <= 2 && x <= 3 ? 1 : y >= 5 || x >= 5 ? 2 : 0]);
      else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) out.push([x, y, 3]);
    }
    return out;
  }
  const star = sprite(STAR), icons = {};
  for (const key of Object.keys(ICONS)) icons[key] = sprite(ICONS[key]);
  const tierTones = TIERS.map(tones), emptyTones = tones(EMPTY), iconTones = {};
  function paint(pixels, left, top, three) {
    const W = G.W, H = G.H;
    for (const [x, y, tone] of pixels) {
      const px = left + x, py = top + y;
      if (px >= 0 && py >= 0 && px < W && py < H) G.col[py * W + px] = tone === 3 ? INK : three[tone];
    }
  }
  const St = PI.ui.stars = {};
  St.tier = lv => lv >= 10 ? 3 : Math.floor((lv - 1) / 3);
  St.filled = lv => lv >= 10 ? 3 : (lv - 1) % 3 + 1;
  St.draw = c => {
    const cx = Math.round(G.sx(c.x)), top = Math.round(G.sy(c.y, PI.builder.headHeight(c))) - 11;
    const n = St.filled(c.lv), lit = tierTones[St.tier(c.lv)];
    for (let i = 2; i >= 0; i--) paint(star, cx - 11 + i * 8, top, i < n ? lit : emptyTones); // right to left, so lit stars overlap empty ones
    const status = PI.statusOf(c).slice(0, 2), beat = Math.floor(PI.state.time * 5) % 2;
    status.forEach((key, i) => {
      const three = iconTones[key] || (iconTones[key] = tones(PI.statusColors[key]));
      paint(icons[key], cx - status.length * 5 + i * 10 + 1, top - 10 - (c.isPlayer ? beat : 0), three);
    });
    if (c.stun > 0) { // three sparks circle the head
      const a = Math.floor(PI.state.time * 12) * .6, spark = tones(PI.statusColors.stun)[1];
      for (let k = 0; k < 3; k++) {
        const px = Math.round(cx + Math.cos(a + k * 2.1) * 9), py = Math.round(top + 12 + Math.sin(a + k * 2.1) * 3);
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (px + dx >= 0 && py + dy >= 0 && px + dx < G.W && py + dy < G.H) G.col[(py + dy) * G.W + px + dx] = spark;
      }
    }
  };
  // the same star and icon bitmaps as data URLs, for the HTML screens
  St.image = (kind, key) => {
    const pixels = kind === 'star' ? star : icons[key], three = kind === 'star' ? (key === 'empty' ? emptyTones : tierTones[key]) : tones(PI.statusColors[key]);
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 9;
    const img = ctx.createImageData(9, 9), data = new Uint32Array(img.data.buffer);
    for (const [x, y, tone] of pixels) data[(y + 1) * 9 + x + 1] = tone === 3 ? INK : three[tone];
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL();
  };
})();
