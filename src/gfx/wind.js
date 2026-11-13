'use strict';
// Wind. Only plants move: leaf clusters and grass blades sway in whole pixels at 8 fps.
// A leaf cluster is drawn once into a recording (in map pixels) and replayed every frame with an offset.
(() => {
  const G = PI.gfx, { KIND } = G;
  const FPS = 8;
  // leaves are filed in 64-pixel squares of the map and tufts by map row, so a frame only visits what it shows
  const leaves = [], tufts = [], bins = new Map(), rows = [];
  let still = null, stamp = 0;
  G.clearWind = () => { leaves.length = 0; tufts.length = 0; bins.clear(); rows.length = 0; };
  // draw(): any ball/capsule calls. sway: 0 keeps it rigid, 1 is a free leaf.
  G.leaf = (x, y, z, r, draw, sway = 1, shadow = true) => {
    G.record();
    draw();
    const raw = G.stopRecord(), n = raw.length / 4;
    const leaf = { x, y, z, r, sway, shadow, n, seed: leaves.length, px: new Int16Array(n), py: new Int16Array(n), d: new Float32Array(n), c: new Uint32Array(n), x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
    for (let k = 0; k < n; k++) {
      const px = raw[k * 4], py = raw[k * 4 + 1];
      leaf.px[k] = px; leaf.py[k] = py; leaf.d[k] = raw[k * 4 + 2]; leaf.c[k] = raw[k * 4 + 3];
      if (px < leaf.x0) leaf.x0 = px; if (px > leaf.x1) leaf.x1 = px; if (py < leaf.y0) leaf.y0 = py; if (py > leaf.y1) leaf.y1 = py;
    }
    leaves.push(leaf);
    if (!n) return;
    for (let bx = leaf.x0 >> 6; bx <= leaf.x1 >> 6; bx++) for (let by = leaf.y0 >> 6; by <= leaf.y1 >> 6; by++) {
      const key = bx * 4096 + by;
      if (!bins.has(key)) bins.set(key, []);
      bins.get(key).push(leaf);
    }
  };
  // blades grow on every map pixel marked KIND.GRASS; tones: five packed colours, dark to light
  G.growGrass = (tones, density = .16) => {
    const dark = Array.from(tones, c => { const [r, g, b] = G.unpack(c); return G.pack(r * .56, g * .53, b * .74); });
    const W = G.W, H = G.H;
    for (let py = 4; py < H; py++) {
      rows[py] = tufts.length;
      for (let px = 0; px < W; px++) {
        const i = py * W + px;
        if (G.kind[i] !== KIND.GRASS || G.rand2(px * 3 + 11, py * 5 + 7) > density) continue;
        tufts.push({
          px, py, i, tones, dark, h: 1 + (G.rand2(px + 91, py * 2) * 3 | 0), base: Math.round(G.noise(px * .09, py * .18) * 2.2),
          phase: px * .11 + py * .19 + G.rand2(px, py) * .9,
          bloom: G.rand2(px * 7 + 3, py + 5) < .02 ? (G.rand2(px, py + 77) > .5 ? G.pack(250, 246, 226) : G.pack(242, 202, 88)) : 0,
        });
      }
    }
    rows[H] = tufts.length;
  };
  G.drawWind = time => {
    if (still === null) still = G.still();
    const t = still ? 0 : Math.floor(time * FPS) / FPS;
    const col = G.col, dep = G.dep, kinds = G.kind, W = G.W, H = G.H, offX = G.offX, offY = G.offY;
    // only the squares under the view, plus a margin to the left and above for shadows that fall into it
    stamp++;
    for (let bx = (offX - 160) >> 6; bx <= (offX + W + 8) >> 6; bx++) for (let by = (offY - 40) >> 6; by <= (offY + H + 60) >> 6; by++) {
      const list = bins.get(bx * 4096 + by);
      if (!list) continue;
      for (const leaf of list) {
        if (leaf.stamp === stamp) continue; // a leaf can sit in several squares
        leaf.stamp = stamp;
        const reach = G.clamp(leaf.z / 3, .3, 1) * leaf.sway;
        const sway = (Math.sin(t * .9 + leaf.x * .5 + leaf.z * .7) + .55 * Math.sin(t * 2.3 + leaf.seed * 1.7)) * reach;
        if (leaf.shadow) G.shadowBlob(leaf.x + sway * .1, leaf.y, leaf.z, leaf.r, 1);
        if (leaf.x1 - offX < -3 || leaf.x0 - offX > W + 3 || leaf.y1 - offY < -3 || leaf.y0 - offY > H + 3) continue;
        const dx = Math.round(sway * .9) - offX, dy = Math.round(Math.sin(t * 1.3 + leaf.y + leaf.seed) * reach * .45) - offY;
        for (let k = 0; k < leaf.n; k++) {
          const px = leaf.px[k] + dx, py = leaf.py[k] + dy;
          if (px < 0 || py < 0 || px >= W || py >= H) continue;
          const i = py * W + px;
          if (leaf.d[k] <= dep[i]) continue;
          dep[i] = leaf.d[k]; col[i] = leaf.c[k]; kinds[i] = KIND.PROP;
        }
      }
    }
    const baked = G.staticMask;
    const first = rows[Math.max(4, offY)] || 0, last = rows[Math.min(G.MH, offY + H + 4)] || tufts.length;
    for (let n = first; n < last; n++) {
      const tuft = tufts[n], vx = tuft.px - offX, vy = tuft.py - offY;
      if (vx < -3 || vx > W + 3) continue;
      const gust = Math.sin(t * .8 + tuft.phase) + .5 * Math.sin(t * 2.1 + tuft.phase * 2.3);
      const tones = baked[tuft.i] ? tuft.dark : tuft.tones;
      for (let k = 1; k <= tuft.h; k++) {
        const jx = vx + Math.round(gust * .95 * k / 3), jy = vy - k;
        if (jx < 0 || jx >= W || jy < 0 || jy >= H) continue;
        const j = jy * W + jx;
        if (kinds[j] > KIND.GRASS) continue; // a prop or a body covers this pixel
        col[j] = tuft.bloom && k === tuft.h ? tuft.bloom : tones[G.clamp(tuft.base + k + (gust > 1 ? 1 : 0), 1, 4)];
      }
    }
  };
})();
