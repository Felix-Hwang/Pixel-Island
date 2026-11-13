'use strict';
// Man-made things shared by the maps: people, parasols, stalls, crates, posts. All are baked, all cast shadows.
(() => {
  const G = PI.gfx, S = G.STYLE, K = G.KIND;
  const P = PI.props = {};

  P.box = (b, rgb, opt) => { G.box(b, G.ramp(rgb), opt); G.boxShadow(b); return b; };

  // a standing person about two units tall. pal: { shirt, legs, skin, hair, hat }. kind lets a mover be drawn live.
  P.person = (x, y, yaw, pal, pose = {}, kind = K.PROP, shadow = true) => {
    const fx = Math.cos(yaw), fy = Math.sin(yaw), sx = -fy, sy = fx;
    const at = (f, s, u) => [x + fx * f + sx * s, y + fy * f + sy * s, u];
    const bone = (a, b, ra, rb, rgb) => {
      G.capsule(a[0], a[1], a[2], b[0], b[1], b[2], ra, rb, G.ramp(rgb), S.FLAT, kind);
      if (shadow) G.shadowCapsule(a[0], a[1], a[2], b[0], b[1], b[2], ra, rb);
    };
    const step = pose.step || 0, wave = pose.wave || 0;
    bone(at(0, .15, .95), at(step * .25, .16, .1), .15, .11, pal.legs);
    bone(at(0, -.15, .95), at(-step * .25, -.16, .1), .15, .11, pal.legs);
    bone(at(0, 0, .95), at(.02, 0, 1.6), .27, .25, pal.shirt);
    const head = at(.05, 0, 1.98);
    bone(head, head, .22, .22, pal.skin);
    const top = at(0, 0, 2.08);
    bone(top, top, .19, .19, pal.hair);
    if (pal.hat) { // a wide conical hat
      G.ball(top[0], top[1], top[2] + .06, .42, G.ramp(pal.hat), S.FLAT, kind, .35);
      if (shadow) G.shadowBlob(top[0], top[1], top[2], .4, 1);
    }
    bone(at(0, .32, 1.55), at(.1 + wave * .3, .38, 1.1 + wave * .8), .11, .09, wave ? pal.skin : pal.shirt);
    bone(at(0, -.32, 1.55), at(.1, -.38, 1.05), .11, .09, pal.shirt);
  };

  // a beach parasol: pole, a flattened dome and a second-colour cap
  P.parasol = (x, y, rgbA, rgbB, r = 1.5) => {
    const pole = G.ramp([226, 222, 212]);
    G.capsule(x, y, 0, x, y, 2.1, .07, .07, pole, S.FLAT, K.PROP);
    G.shadowCapsule(x, y, 0, x, y, 2, .08, .08);
    G.ball(x, y, 2.05, r, G.ramp(rgbA), S.DITHER, K.PROP, .42);
    G.ball(x, y, 2.3, r * .55, G.ramp(rgbB), S.DITHER, K.PROP, .42);
    G.shadowBlob(x, y, 2, r * .95, 1);
  };

  // a market stall: counter, four posts and a cloth roof. Returns the footprint box for collisions.
  P.stall = (x, y, hx, hy, body, roof, yaw = 0, seed = 0) => {
    const counter = { x, y, z0: 0, z1: .9, hx, hy, yaw };
    P.box(counter, body, { seed });
    const cos = Math.cos(yaw), sin = Math.sin(yaw), post = G.ramp([98, 80, 64]);
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const px = x + a * hx * cos - c * hy * sin, py = y + a * hx * sin + c * hy * cos;
      G.capsule(px, py, .9, px, py, 2.2, .07, .07, post, S.FLAT, K.PROP);
    }
    P.box({ x, y, z0: 2.2, z1: 2.45, hx: hx + .25, hy: hy + .25, yaw }, roof, { seed: seed + 3, grain: .6 });
    return counter;
  };

  // a low open table of goods. It is only .9 units tall, so it does not hide creatures behind it.
  P.table = (x, y, hx, hy, body, goods, seed = 0) => {
    const top = { x, y, z0: 0, z1: .7, hx, hy, yaw: 0 };
    P.box(top, body, { seed });
    for (let k = 0; k < 4; k++) G.ball(x - hx * .7 + k * hx * .47, y + (k % 2 ? .12 : -.12), .86, .2, G.ramp(goods[k % goods.length]), S.FLAT, K.PROP);
    return top;
  };

  P.crate = (x, y, size = .4, rgb = [150, 112, 70], yaw = .3, seed = 0) => P.box({ x, y, z0: 0, z1: size * 1.6, hx: size, hy: size, yaw }, rgb, { seed });

  // a post with a small flag or sign plate on top
  P.post = (x, y, h, rgb, plate = null) => {
    G.capsule(x, y, 0, x, y, h, .07, .07, G.ramp([98, 80, 64]), S.FLAT, K.PROP);
    G.shadowCapsule(x, y, 0, x, y, h, .08, .08);
    if (plate) P.box({ x: x + plate.w, y, z0: h - plate.h * 2, z1: h, hx: plate.w, hy: .05, yaw: 0 }, rgb, { grain: .4 });
  };

  // a small open boat. kind lets the ferry be redrawn every frame while it moves.
  P.boat = (x, y, yaw, rgb, kind = K.PROP, shadow = true) => {
    const hull = { x, y, z0: 0, z1: .45, hx: 1.1, hy: .5, yaw };
    G.box(hull, G.ramp(rgb), { kind, grain: .8, seed: 5 });
    G.box({ x, y, z0: .45, z1: .55, hx: .85, hy: .3, yaw }, G.ramp([92, 74, 60]), { kind, grain: .5, seed: 9 });
    if (shadow) G.boxShadow(hull);
    return hull;
  };
})();
