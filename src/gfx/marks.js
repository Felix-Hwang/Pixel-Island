'use strict';
// Small bitmaps stamped on top of the finished frame (stars, markers), and decals painted onto the ground.
// Stamps get a white halo so they stay readable over busy detail. No text is ever drawn into the canvas.
(() => {
  const G = PI.gfx, { U, SIN, KIND } = G;
  const PAPER = 0xffffffff;
  const put = (px, py, c) => { if (px >= 0 && py >= 0 && px < G.W && py < G.H) G.col[py * G.W + px] = c; };
  // rows: strings; palette: { char: packed colour }. '.' is empty. (left, top) is the top-left pixel.
  G.stamp = (rows, left, top, palette, halo = true) => {
    left = Math.round(left); top = Math.round(top);
    if (left > G.W || top > G.H || left < -rows[0].length || top < -rows.length) return;
    if (halo) {
      for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
        if (rows[y][x] === '.') continue;
        put(left + x - 1, top + y, PAPER); put(left + x + 1, top + y, PAPER);
        put(left + x, top + y - 1, PAPER); put(left + x, top + y + 1, PAPER);
      }
    }
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const c = palette[rows[y][x]];
      if (c != null) put(left + x, top + y, c);
    }
  };
  const bare = i => G.kind[i] === KIND.GROUND || G.kind[i] === KIND.GRASS;
  // a ring on the ground. Only bare ground pixels are painted, so it never draws over a body.
  G.groundRing = (x, y, r, color, dashed = 0, phase = 0) => {
    if (!G.visible(x, y, r * U + 4)) return;
    const cx = G.sx(x), cy = G.sy(y, 0), rx = r * U, ry = r * U * SIN, n = Math.max(12, Math.ceil(rx * 7));
    for (let k = 0; k < n; k++) {
      if (dashed && ((k + phase) % (dashed * 2) | 0) >= dashed) continue;
      const a = k / n * Math.PI * 2, px = Math.round(cx + Math.cos(a) * rx), py = Math.round(cy + Math.sin(a) * ry);
      if (px < 0 || py < 0 || px >= G.W || py >= G.H) continue;
      const i = py * G.W + px;
      if (bare(i)) G.col[i] = color;
    }
  };
  // Decals. paint(i, wx, wy, ...) gets the buffer index and the pixel's position on the MAP, so any pattern made from
  // wx, wy stays fixed to the ground while the camera moves.
  // an ellipse: paint(i, wx, wy, t) with t running 0 at the centre to 1 at the rim
  G.groundDisc = (x, y, rx, ry, paint) => {
    const W = G.W, H = G.H, cx = G.sx(x), cy = G.sy(y, 0), sx = rx * U, sy = ry * U * SIN;
    const x0 = Math.max(0, Math.floor(cx - sx)), x1 = Math.min(W - 1, Math.ceil(cx + sx));
    const y0 = Math.max(0, Math.floor(cy - sy)), y1 = Math.min(H - 1, Math.ceil(cy + sy));
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const nx = (px + .5 - cx) / sx, ny = (py + .5 - cy) / sy, q = nx * nx + ny * ny;
      if (q > 1) continue;
      const i = py * W + px;
      if (bare(i)) paint(i, px + G.offX, py + G.offY, Math.sqrt(q));
    }
  };
  // an axis-aligned rectangle: paint(i, wx, wy, u, v) with u, v running -1..1 across it
  G.groundRect = (x, y, hx, hy, paint) => {
    const W = G.W, H = G.H;
    const x0 = Math.max(0, Math.floor(G.sx(x - hx))), x1 = Math.min(W - 1, Math.ceil(G.sx(x + hx)));
    const y0 = Math.max(0, Math.floor(G.sy(y - hy, 0))), y1 = Math.min(H - 1, Math.ceil(G.sy(y + hy, 0)));
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const g = G.toGround(px + .5, py + .5), u = (g.x - x) / hx, v = (g.y - y) / hy;
      if (Math.abs(u) > 1 || Math.abs(v) > 1) continue;
      const i = py * W + px;
      if (bare(i)) paint(i, px + G.offX, py + G.offY, u, v);
    }
  };
})();
