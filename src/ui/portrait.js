'use strict';
// Pictures of species for the HTML screens, drawn with the game's own renderer into a corner of the view
// buffers and copied out. The next frame repaints the view, so nothing of it shows in the game.
(() => {
  const cache = {}, walks = new Map(), PAPER = PI.gfx.pack(243, 239, 228);
  const SIZE = { small: { w: 64, h: 48, k: 1.8 }, large: { w: 112, h: 84, k: 2.6 } };
  // one frame as ImageData: the species in that colour, facing down and to the right, at a point of its walk
  function shot(sp, color, size, phase) {
    const G = PI.gfx, W = Math.min(size.w, G.W), H = Math.min(size.h, G.H);
    for (let y = 0; y < H; y++) {
      const a = y * G.W;
      G.col.fill(PAPER, a, a + W); G.dep.fill(-1e9, a, a + W); G.kind.fill(0, a, a + W); // pale, so the outline pass draws its dark rim
    }
    const c = PI.makeCreature(sp, PI.levelOf(sp.id), (W * .5 - G.ox) / G.U, (H * .78 - G.oy) / (G.U * G.SIN));
    c.face = Math.PI / 4; c.k = size.k; c.color = color;
    if (phase != null) { c.moving = true; c.gaitQ = .5; c.gaitPhase = phase; }
    PI.builder.draw(c, phase == null ? 0 : phase * .5, { shadow: false });
    G.outline(G.KIND.BODY);
    const img = new ImageData(W, H), data = new Uint32Array(img.data.buffer);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * G.W + x;
      if (G.kind[i] === G.KIND.BODY) data[y * W + x] = G.col[i];
    }
    return img;
  }
  const toCanvas = img => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d').putImageData(img, 0, 0);
    return canvas;
  };
  // a still picture as a data URL
  PI.ui.portrait = (sp, color) => {
    const key = sp.id + '/' + color;
    return cache[key] || (cache[key] = toCanvas(shot(sp, color, SIZE.small, null)).toDataURL());
  };
  // a canvas that shows the species walking; its frames are stored on it for PI.ui.animate
  PI.ui.walker = (sp, color) => {
    const key = sp.id + '/' + color;
    let frames = walks.get(key);
    if (!frames) {
      frames = Array.from({ length: 8 }, (v, n) => shot(sp, color, SIZE.large, (n + .5) / 8));
      walks.set(key, frames);
      if (walks.size > 20) walks.delete(walks.keys().next().value); // two pages of ten; older ones are drawn again when asked for
    }
    const canvas = toCanvas(frames[0]);
    canvas.frames = frames;
    return canvas;
  };
  // Steps every walker canvas inside root through its frames, eight a second. It stops by itself when root
  // leaves the page, and it does not run for people who asked for less motion.
  PI.ui.animate = root => {
    if (PI.gfx.still()) return;
    let n = 0;
    const timer = setInterval(() => {
      if (!root.isConnected) { clearInterval(timer); return; }
      n++;
      for (const canvas of root.querySelectorAll('canvas')) if (canvas.frames) canvas.getContext('2d').putImageData(canvas.frames[n % canvas.frames.length], 0, 0);
    }, 125);
  };
})();
