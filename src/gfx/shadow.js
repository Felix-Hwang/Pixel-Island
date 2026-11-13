'use strict';
// Long hard shadows. Shapes stamp into a mask; the mask darkens only pixels that are still bare ground.
(() => {
  const G = PI.gfx, { U, SIN, KIND } = G;
  G.shadowBlob = (x, y, z, r, strength = 1) => {
    const W = G.W, H = G.H;
    const gx = x + z * G.scene.shadowX, gy = y + z * G.scene.shadowY;
    const cx = G.ox + gx * U, cy = G.oy + gy * SIN * U;
    const rx = Math.max(r * U * 1.05, 1.25), ry = rx * SIN + .7;
    const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(W - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(H - 1, Math.ceil(cy + ry));
    const mask = G.mask;
    for (let py = y0; py <= y1; py++) {
      const ny = (py + .5 - cy) / ry;
      for (let px = x0; px <= x1; px++) {
        const nx = (px + .5 - cx) / rx;
        if (nx * nx + ny * ny > 1) continue;
        const i = py * W + px;
        if (mask[i] < strength) mask[i] = strength;
      }
    }
  };
  G.shadowCapsule = (ax, ay, az, bx, by, bz, ra, rb) => {
    // Step by the length of the shadow on the ground, not by the length of the shape. With a low sun the shadow of a
    // tall shape is several times longer than the shape.
    const gx = (bx - ax) + (bz - az) * G.scene.shadowX, gy = (by - ay) + (bz - az) * G.scene.shadowY;
    const px = Math.hypot(gx * U, gy * U * SIN), step = Math.max(1.4, Math.min(ra, rb) * U * 1.25);
    const n = Math.min(120, Math.max(1, Math.ceil(px / step)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      G.shadowBlob(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, (ra + (rb - ra) * t) * .92, 1);
    }
  };
  G.applyShadows = () => {
    const mask = G.mask, kinds = G.kind, a = G.scene.shadowTint, b = G.scene.deepTint, baked = G.staticMask;
    const W = G.W, H = G.H, MW = G.MW, offX = G.offX, offY = G.offY;
    for (let py = 0; py < H; py++) {
      const row = py * W, mrow = (py + offY) * MW + offX;
      for (let px = 0; px < W; px++) {
        const i = row + px, s = mask[i];
        if (!s) continue;
        mask[i] = 0;
        const k = kinds[i];
        if (k !== KIND.GROUND && k !== KIND.GRASS) continue;
        if (baked[mrow + px] >= s) continue; // the map is already this dark here
        if (s === 1) G.mul(i, a[0], a[1], a[2]); else G.mul(i, b[0], b[1], b[2]);
      }
    }
  };
  // Shadows of the static scene. They are applied once while baking and kept in staticMask, which the grass and the
  // moving shadows read.
  G.bakeShadows = () => {
    const keep = new Uint8Array(G.mask);
    G.staticMask.fill(0);
    G.applyShadows();
    G.staticMask.set(keep);
  };
  // darken the ground next to props, so a prop looks like it stands on the ground
  G.contactShade = () => {
    const kinds = G.kind, ring = [], W = G.W, H = G.H;
    for (const r of [2, 4]) for (let k = 0; k < 8; k++) ring.push([Math.round(Math.cos(k * Math.PI / 4) * r), Math.round(Math.sin(k * Math.PI / 4) * r * .6)]);
    for (let py = 4; py < H - 4; py++) for (let px = 4; px < W - 4; px++) {
      const i = py * W + px, k = kinds[i];
      if (k !== KIND.GROUND && k !== KIND.GRASS) continue;
      let hits = 0;
      for (const [ox, oy] of ring) if (kinds[i + oy * W + ox] === KIND.PROP) hits++;
      if (!hits) continue;
      if (hits >= 9) G.mul(i, .6, .57, .76);
      else if (hits / 9 > G.dither(px, py)) G.mul(i, .78, .76, .87);
    }
  };
})();
