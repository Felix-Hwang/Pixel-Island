'use strict';
// Round shapes drawn straight into the buffers: balls and capsules. No image assets anywhere.
(() => {
  const G = PI.gfx, { U, SIN, COS, KIND } = G;
  const STYLE = G.STYLE = { FLAT: 0, DITHER: 1, ROUGH: 2, GLOSS: 3 };
  const LX = -.5, LY = -.62, LZ = .6;       // light from the upper left, in screen space
  const GLINT = G.pack(255, 250, 234);
  let rec = null;                           // when set, pixels are recorded instead of drawn (see wind.js)
  let axial = false, ax = 0, ay = 0, az = 0; // inside a capsule: light the ball as a slice of a cylinder
  // G.under: when set to a ramp, the underside of every ball drawn is painted from it (a paler belly)
  G.under = null;
  // While a slab is set, depth is taken as if the shape were squeezed toward the ground line y. A creature is
  // drawn this way: its parts keep their order among themselves, but all of it sorts at its feet, the way a
  // sprite would. Without this the back half of a large animal vanished into any wall it stood in front of.
  let slabOn = false, slabY = 0, slabK = 1;
  G.slab = (y, k = .15) => { slabOn = true; slabY = y; slabK = k; };
  G.noSlab = () => { slabOn = false; };
  G.bodyDepth = (y, z) => (slabOn ? slabY + (y - slabY) * slabK : y) * COS + z * SIN;
  G.record = () => { rec = []; };
  G.stopRecord = () => { const out = rec; rec = null; return out; };

  // squash < 1 flattens the ball vertically (domes, shells, clouds)
  G.ball = (x, y, z, r, ramp, style = STYLE.FLAT, kind = KIND.BODY, squash = 1) => {
    const W = G.W, H = G.H;
    const cx = G.ox + x * U, cy = G.oy + (y * SIN - z * COS) * U, cd = (slabOn ? slabY + (y - slabY) * slabK : y) * COS + z * SIN;
    const rx = Math.max(r * U, .8);
    const ry = squash === 1 ? rx : Math.max(rx * Math.sqrt(squash * squash * COS * COS + SIN * SIN), .8);
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(W - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(H - 1, Math.ceil(cy + ry));
    if (x0 > x1 || y0 > y1) return;
    const col = G.col, dep = G.dep, kinds = G.kind, offX = G.offX, offY = G.offY;
    const min = style === STYLE.FLAT || style === STYLE.GLOSS ? 1 : 0, under = G.under;
    for (let py = y0; py <= y1; py++) {
      const ny = (py + .5 - cy) / ry;
      for (let px = x0; px <= x1; px++) {
        const nx = (px + .5 - cx) / rx, q = nx * nx + ny * ny;
        if (q > 1) continue;
        const nz = Math.sqrt(1 - q), d = cd + r * nz, i = py * W + px;
        if (!rec && d <= dep[i]) continue;
        let l;
        if (axial) { // drop the part of the normal that runs along the capsule, so neighbouring slices shade alike
          const along = nx * ax + ny * ay + nz * az;
          const mx = nx - along * ax, my = ny - along * ay, mz = nz - along * az, len = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
          l = (mx * LX + my * LY + mz * LZ) / len;
        } else l = nx * LX + ny * LY + nz * LZ;
        if (ny > .4 && l < .1 + ny * .22) l = .1 + ny * .22; // light bounced up from the ground
        let tone;
        if (style === STYLE.FLAT) tone = Math.floor(l * 4.3 + .4);
        else if (style === STYLE.GLOSS) tone = l > .9 ? 9 : Math.floor(l * 4.3 + .4);
        else if (style === STYLE.ROUGH) tone = Math.floor(l * 4.3 + .3 + (G.rand2(px + offX, py + offY) - .5) * 1.5);
        else tone = Math.floor(l * 4.3 + .3 + (G.dither(px + offX, py + offY) - .5) * .8);
        const c = tone === 9 ? GLINT : under && ny > .3 ? under[tone < 2 ? 2 : tone > 3 ? 4 : tone + 1] : ramp[tone < min ? min : tone > 4 ? 4 : tone];
        if (rec) { rec.push(px + offX, py + offY, d, c); continue; } // recordings are kept in map pixels
        dep[i] = d; col[i] = c; kinds[i] = kind;
      }
    }
  };

  G.capsule = (x0, y0, z0, x1, y1, z1, ra, rb, ramp, style, kind) => {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, len = Math.hypot(dx, dy, dz);
    const n = Math.min(90, Math.max(1, Math.ceil(len / (Math.min(ra, rb) * .6))));
    // the capsule axis in screen space: right, down, toward the viewer
    const sx = dx, sy = dy * SIN - dz * COS, sd = dy * COS + dz * SIN, sl = Math.hypot(sx, sy, sd);
    if (sl > .001) { ax = sx / sl; ay = sy / sl; az = sd / sl; }
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      axial = sl > .001 && k > 0 && k < n; // the two end balls stay round
      G.ball(x0 + dx * t, y0 + dy * t, z0 + dz * t, ra + (rb - ra) * t, ramp, style, kind);
    }
    axial = false;
  };
})();
