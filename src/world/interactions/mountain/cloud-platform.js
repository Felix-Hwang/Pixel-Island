'use strict';
// Cloud platform. Low clouds move slowly across the mountain. A creature standing on one moves with it.
// cfg: clouds [{ y, from, to, speed, r }]
PI.registerInteraction('mountain', 'cloud-platform', {
  init(cfg, st) { st.clouds = cfg.clouds.map(c => ({ x: c.from, y: c.y, r: c.r, dir: Math.sign(c.to - c.from), cfg: c })); },
  update(cfg, st, dt) {
    for (const c of st.clouds) {
      c.x += c.dir * c.cfg.speed * dt;
      const lo = Math.min(c.cfg.from, c.cfg.to), hi = Math.max(c.cfg.from, c.cfg.to);
      if (c.x > hi) { c.x = hi; c.dir = -1; } else if (c.x < lo) { c.x = lo; c.dir = 1; }
    }
  },
  modify(cfg, st, c, m) {
    for (const cl of st.clouds) {
      const dx = (c.x - cl.x) / cl.r, dy = (c.y - cl.y) / (cl.r * .6);
      if (dx * dx + dy * dy < .8) { m.driftX += cl.dir * cl.cfg.speed; return; } // riding
    }
  },
  // each cloud is three overlapping white ellipses painted on the ground, with a dithered rim
  drawGround(cfg, st) {
    const G = PI.gfx, white = 0xffffffff, soft = G.pack(232, 236, 246);
    for (const cl of st.clouds) {
      if (!G.visible(cl.x, cl.y, cl.r * 16)) continue;
      for (const [ox, k] of [[0, 1], [-cl.r * .55, .7], [cl.r * .6, .75]]) {
        G.groundDisc(cl.x + ox, cl.y + (ox ? .25 : 0), cl.r * k, cl.r * k * .6, (i, wx, wy, t) => {
          if (t > .72 && G.dither(wx, wy) < (t - .72) / .28) return;
          G.col[i] = t > .55 && (wy & 1) ? soft : white;
        });
      }
    }
  },
});
