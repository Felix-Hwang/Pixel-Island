'use strict';
// The frame buffers and the fixed camera, which looks down at 36 degrees.
// There are two sets of buffers. The MAP is the whole world, baked once per round. The VIEW is the window onto it
// that fills the screen; every frame starts as a copy of the map under the camera, then the moving things are drawn in.
// World axes: x runs screen-right, y runs toward the viewer (screen-down), z is up. 1 unit = 10 px.
(() => {
  const U = 10, TILT = Math.PI / 5, SIN = Math.sin(TILT), COS = Math.cos(TILT);
  const KIND = { EMPTY: 0, GROUND: 1, GRASS: 2, PROP: 3, BODY: 4 };
  const DEFAULT_SCENE = { shadowX: 1.25, shadowY: -.1, shadowTint: [.56, .53, .74], deepTint: [.38, .35, .58] };
  // W, H, col, dep, kind, mask, ox, oy always describe the buffers being drawn into right now.
  // offX, offY: where that buffer's top-left pixel sits on the map (0, 0 while baking).
  const G = PI.gfx = { U, SIN, COS, KIND, scene: { ...DEFAULT_SCENE }, W: 0, H: 0, ox: 0, oy: 0, offX: 0, offY: 0, MW: 0, MH: 0, VW: 0, VH: 0, subX: 0, subY: 0 };
  let ctx = null, image = null, map = null, view = null, camX = 0, camY = 0, onMap = false;

  const use = (b, ox, oy, offX, offY) => {
    G.W = b.w; G.H = b.h; G.col = b.col; G.dep = b.dep; G.kind = b.kind; G.mask = b.mask;
    G.ox = ox; G.oy = oy; G.offX = offX; G.offY = offY;
  };
  G.init = canvas => { G.canvas = canvas; ctx = canvas.getContext('2d'); };
  G.setScene = scene => { G.scene = { ...DEFAULT_SCENE, ...scene }; };
  // the world: mw x mh pixels
  G.setMap = (mw, mh) => {
    if (map && map.w === mw && map.h === mh) return;
    const n = mw * mh;
    map = { w: mw, h: mh, col: new Uint32Array(n), dep: new Float32Array(n), kind: new Uint8Array(n), mask: new Uint8Array(n) };
    G.staticMask = new Uint8Array(n); // shadows baked into the map
    G.MW = mw; G.MH = mh;
  };
  // the window shown on screen; never larger than the world
  G.setView = (vw, vh) => {
    vw = Math.min(vw, G.MW); vh = Math.min(vh, G.MH);
    G.canvas.width = vw; G.canvas.height = vh;
    image = ctx.createImageData(vw, vh);
    view = { w: vw, h: vh, col: new Uint32Array(image.data.buffer), dep: new Float32Array(vw * vh), kind: new Uint8Array(vw * vh), mask: new Uint8Array(vw * vh) };
    G.VW = vw; G.VH = vh;
    G.lookAt(G.lookX || 0, G.lookY || 0);
  };
  G.toMap = () => { onMap = true; use(map, G.MW / 2, G.MH / 2, 0, 0); };
  G.toView = () => { if (!view) return; onMap = false; use(view, G.MW / 2 - camX, G.MH / 2 - camY, camX, camY); };
  // Centre the view on a world point, without ever showing anything beyond the edge of the map.
  // The view is one pixel larger than the screen. subX and subY are the part of a pixel the camera is past its
  // whole-pixel position; the canvas is shifted by that much on screen, so scrolling is smooth and never steps.
  G.lookAt = (x, y) => {
    G.lookX = x; G.lookY = y;
    const fx = Math.max(0, Math.min(G.MW - G.VW, G.MW / 2 + x * U - (G.VW - 1) / 2));
    const fy = Math.max(0, Math.min(G.MH - G.VH, G.MH / 2 + y * SIN * U - (G.VH - 1) / 2));
    camX = Math.floor(fx); camY = Math.floor(fy);
    G.subX = fx - camX; G.subY = fy - camY;
    if (!onMap && view) G.toView();
  };
  G.sx = x => G.ox + x * U;
  G.sy = (y, z) => G.oy + (y * SIN - z * COS) * U;
  G.depthOf = (y, z) => y * COS + z * SIN;
  G.toGround = (sx, sy) => ({ x: (sx - G.ox) / U, y: (sy - G.oy) / (U * SIN) });
  G.index = (x, y, z) => {
    const px = Math.floor(G.sx(x)), py = Math.floor(G.sy(y, z));
    return px < 0 || py < 0 || px >= G.W || py >= G.H ? -1 : py * G.W + px;
  };
  // true if a world point (with some slack in pixels) is inside the buffers being drawn into
  G.visible = (x, y, pad = 40) => {
    const px = G.sx(x), py = G.sy(y, 0);
    return px > -pad && px < G.W + pad && py > -pad * 2 && py < G.H + pad;
  };
  G.clear = () => {
    G.col.fill(0xffffffff); G.dep.fill(-1e9); G.kind.fill(0); G.mask.fill(0);
    if (onMap) G.staticMask.fill(0);
  };
  // start a frame by copying the part of the baked map under the camera into the view
  G.restore = () => {
    const vw = G.VW, mw = G.MW;
    for (let y = 0; y < G.VH; y++) {
      const s = (y + camY) * mw + camX, d = y * vw;
      view.col.set(map.col.subarray(s, s + vw), d);
      view.dep.set(map.dep.subarray(s, s + vw), d);
      view.kind.set(map.kind.subarray(s, s + vw), d);
    }
  };
  G.present = () => ctx.putImageData(image, 0, 0);
  // the whole baked map as a data URL, keeping every step-th pixel
  G.mapImage = (step = 3) => {
    const w = Math.floor(G.MW / step), h = Math.floor(G.MH / step), canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const img = new ImageData(w, h), data = new Uint32Array(img.data.buffer);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = map.col[y * step * G.MW + x * step];
    canvas.getContext('2d').putImageData(img, 0, 0);
    return canvas.toDataURL();
  };
  G.still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
