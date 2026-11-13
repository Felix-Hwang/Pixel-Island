'use strict';
// Flat-faced shapes: a convex quad with exact depth, and a yawed box built from quads.
(() => {
  const G = PI.gfx, { KIND } = G;

  // p: four world points in order. Depth is exact because the projection is affine.
  function quad(p, tone, ramp, grain, seed, kind) {
    const W = G.W, H = G.H, offX = G.offX, offY = G.offY;
    const s = p.map(q => [G.sx(q[0]), G.sy(q[1], q[2]), G.depthOf(q[1], q[2])]);
    const ux = s[1][0] - s[0][0], uy = s[1][1] - s[0][1], vx = s[3][0] - s[0][0], vy = s[3][1] - s[0][1];
    const det = ux * vy - uy * vx;
    if (Math.abs(det) < .01) return;
    const du = s[1][2] - s[0][2], dv = s[3][2] - s[0][2];
    const dx = (du * vy - dv * uy) / det, dy = (dv * ux - du * vx) / det;
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (const q of s) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
    x0 = Math.max(0, Math.floor(x0)); x1 = Math.min(W - 1, Math.ceil(x1));
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(H - 1, Math.ceil(y1));
    const sign = det > 0 ? 1 : -1;
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const fx = px + .5, fy = py + .5;
      let inside = true;
      for (let e = 0; e < 4 && inside; e++) {
        const a = s[e], b = s[(e + 1) & 3];
        if (((b[0] - a[0]) * (fy - a[1]) - (b[1] - a[1]) * (fx - a[0])) * sign < -.01) inside = false;
      }
      if (!inside) continue;
      const d = s[0][2] + dx * (fx - s[0][0]) + dy * (fy - s[0][1]), i = py * W + px;
      if (d <= G.dep[i]) continue;
      const wx = px + offX, wy = py + offY; // the texture uses map pixel coordinates, so it stays fixed to the box when the camera moves
      const streak = G.noise(wx * .22 + seed, wy * 1.3 + seed * .37) - .5;
      const t = Math.floor(tone + streak * grain + (G.dither(wx, wy) - .5) * .6);
      G.dep[i] = d; G.col[i] = ramp[t < 0 ? 0 : t > 4 ? 4 : t]; G.kind[i] = kind;
    }
  }
  G.quad = quad;

  const corners = b => {
    const cos = Math.cos(b.yaw || 0), sin = Math.sin(b.yaw || 0);
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) =>
      [b.x + a * b.hx * cos - c * b.hy * sin, b.y + a * b.hx * sin + c * b.hy * cos]);
  };
  // b: { x, y, z0, z1, hx, hy, yaw }. Draws the top and the sides that face the viewer.
  G.box = (b, ramp, opt = {}) => {
    const kind = opt.kind || KIND.PROP, grain = opt.grain == null ? 1.1 : opt.grain, seed = opt.seed || 0;
    const c = corners(b);
    for (let e = 0; e < 4; e++) {
      const p = c[e], q = c[(e + 1) & 3];
      let nx = q[1] - p[1], ny = p[0] - q[0];
      const len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;
      if (nx * ((p[0] + q[0]) / 2 - b.x) + ny * ((p[1] + q[1]) / 2 - b.y) < 0) { nx = -nx; ny = -ny; }
      if (ny < .02) continue; // faces away from the viewer
      const tone = nx < 0 ? 2.5 - nx * .5 : 1.5 - nx * .6;
      quad([[p[0], p[1], b.z1], [q[0], q[1], b.z1], [q[0], q[1], b.z0], [p[0], p[1], b.z0]], tone, ramp, grain, seed + e, kind);
    }
    quad(c.map(k => [k[0], k[1], b.z1]), opt.topTone == null ? 3.6 : opt.topTone, ramp, grain, seed + 7, kind);
  };
  // the shadow of a box: its volume stamped onto the mask
  G.boxShadow = b => {
    const cos = Math.cos(b.yaw || 0), sin = Math.sin(b.yaw || 0), r = .18;
    for (let a = -b.hx; a <= b.hx + .01; a += .22) for (let c = -b.hy; c <= b.hy + .01; c += .22) {
      const x = b.x + a * cos - c * sin, y = b.y + a * sin + c * cos;
      for (let z = b.z0; z < b.z1; z += .3) G.shadowBlob(x, y, z, r, 1);
      G.shadowBlob(x, y, b.z1, r, 1);
    }
  };
  // true when the ground point (x, y) lies inside the box footprint, grown by pad
  G.inBox = (b, x, y, pad = 0) => {
    const cos = Math.cos(b.yaw || 0), sin = Math.sin(b.yaw || 0);
    const dx = x - b.x, dy = y - b.y, a = dx * cos + dy * sin, c = -dx * sin + dy * cos;
    return Math.abs(a) <= b.hx + pad && Math.abs(c) <= b.hy + pad;
  };
})();
