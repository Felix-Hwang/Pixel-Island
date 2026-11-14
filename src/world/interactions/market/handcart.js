'use strict';
// Handcart. Vendors push loaded carts up and down the streets. A cart knocks aside whatever it hits.
// cfg: carts [{ y (the lane), from, to (x range), speed (units/s) }], knock (sideways velocity), stop (s stunned)
PI.registerInteraction('market', 'handcart', {
  init(cfg, st) { st.carts = cfg.carts.map(c => ({ x: c.from, y: c.y, dir: Math.sign(c.to - c.from), pause: 0, cfg: c })); },
  update(cfg, st, dt) {
    const Wd = PI.world, all = Wd.creatures();
    for (const c of all) Wd.cooling(c, 'cart', dt);
    for (const cart of st.carts) {
      if (cart.pause > 0) { cart.pause -= dt; continue; }
      const lo = Math.min(cart.cfg.from, cart.cfg.to), hi = Math.max(cart.cfg.from, cart.cfg.to);
      cart.x += cart.dir * cart.cfg.speed * dt;
      if (cart.x > hi) { cart.x = hi; cart.dir = -1; cart.pause = 1.2; }
      if (cart.x < lo) { cart.x = lo; cart.dir = 1; cart.pause = 1.2; }
      for (const c of all) {
        if (c.fx.cart.cool > 0 || Math.abs(c.x - cart.x) > 1.1 + c.r * .5 || Math.abs(c.y - cart.y) > .65 + c.r * .5) continue;
        Wd.knock(c, cart.dir * 5, (c.y >= cart.y ? 1 : -1) * cfg.knock); // thrown to the side of the lane it is on
        Wd.stun(c, cfg.stop);
        Wd.cooldown(c, 'cart', .9);
      }
    }
  },
  draw(cfg, st) {
    const G = PI.gfx, K = G.KIND.BODY, wheel = G.ramp([60, 56, 64]), goods = [[226, 84, 76], [244, 190, 66], [90, 170, 110]];
    const vendor = { shirt: [240, 236, 224], legs: [70, 76, 110], skin: [214, 164, 124], hair: [40, 32, 30], hat: [222, 196, 130] };
    for (const cart of st.carts) {
      const x = cart.x, y = cart.y;
      if (!G.visible(x, y, 50)) continue;
      const bed = { x, y, z0: .35, z1: .75, hx: 1, hy: .55, yaw: 0 };
      G.box(bed, G.ramp([156, 112, 70]), { kind: K, grain: .7, seed: 3 });
      G.boxShadow(bed);
      for (const dx of [-.6, .6]) G.ball(x + dx, y + .56, .26, .26, wheel, G.STYLE.FLAT, K);
      for (let k = 0; k < 3; k++) G.ball(x - .55 + k * .55, y, .98, .27, G.ramp(goods[k]), G.STYLE.FLAT, K);
      const step = cart.pause > 0 ? 0 : Math.floor(PI.state.time * 6) % 2 ? 1 : -1; // the vendor walks behind the cart
      PI.props.person(x - cart.dir * 1.6, y, cart.dir > 0 ? 0 : Math.PI, vendor, { step }, K);
    }
  },
});
