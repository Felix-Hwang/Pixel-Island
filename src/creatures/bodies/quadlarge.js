'use strict';
// Large four-legged mammal with a real neck. Walks on diagonal pairs and gallops at a run.
// Pale belly, dark hooves, ivory horns and tusks; optionally spots, a pale saddle, pale stockings or a chest patch.
// sil: len, h, legLen, neck, head, snout, trunk, tusk, tuskDown, ears, horn, noseHorn, hump, arms, tail, bulky, thin, sleek,
//      spots, saddle, socks, chest
PI.bodies.quadlarge = {
  cadence: 1, bounce: 1, lean: .1,
  height: s => s.legLen + .5 + (s.rear || 0) * .55 + (s.neck || 0) * .55 + (s.hump || 0) * .15 + (s.horn && !s.noseHorn ? s.horn * .25 : 0),
  build(R) {
    const s = R.s, L = s.len, leg = s.legLen, bulk = s.bulky ? 1.2 : s.thin ? .7 : 1, rb = .24 * bulk;
    const h = leg + rb * .6;
    const up = s.rear || 0; // 1: it sits back on its haunches with the chest raised
    const rear = [-L * .38 + up * .12, 0, h], shoulder = [L * .3 - up * .16, 0, h + (s.arms ? .12 : 0) + up * .55];
    R.torso(rear, shoulder, rb, rb * 1.05);
    if (s.saddle) R.torso([-L * .3, 0, h + .01], [L * .02, 0, h + .02], rb * 1.04, rb * 1.06, .38, 'light'); // a pale band round the middle
    R.haunch(shoulder[0] - .04, shoulder[2] + rb * .1, rb * .82, rb * .62); // shoulders
    R.haunch(rear[0] + .05, h + rb * .05, rb * .86, rb * .58);              // haunches
    if (s.spots) for (const [f, side] of [[-.28, 1], [-.14, -1], [0, 1], [.14, -1], [.24, 1], [-.02, -1]]) R.ball([f * L, side * rb * .5, h + rb * .78], .07, 'ink');
    if (s.hump) R.ball([L * .12, 0, h + rb * .5], rb * (.7 + s.hump * .35));
    if (s.chest) R.ball([shoulder[0] + rb * .55, 0, h - rb * .35], rb * .5, 'light');
    const nk = s.neck || .2, hr = .17 * bulk * (s.head || 1) + (s.trunk ? .04 : 0);
    const head = [shoulder[0] + .12 + nk * .45, 0, h + .06 + nk * .55];
    R.bone(shoulder, head, rb * .7, hr * .9);
    R.ball(head, hr);
    if (s.snout) {
      const tip = [head[0] + hr * .5 + s.snout * .3, 0, head[2] - hr * .45];
      R.bone(head, tip, hr * .7, hr * .5);
      R.ball([tip[0] + hr * .25, 0, tip[2]], hr * .3, 'ink'); // nose
    }
    if (s.trunk) {
      const sway = R.wave(1) * .05, x = head[0] + hr;
      R.chain([head, [x + .08, 0, head[2] - .18 * s.trunk], [x + .12, sway, head[2] - .45 * s.trunk], [x + .2, sway * 2, Math.max(.08, head[2] - .75 * s.trunk)]], .1, .06);
    }
    if (s.tusk) for (const side of [1, -1]) {
      const root = [head[0] + hr * .6, side * hr * .5, head[2] - hr * .5];
      R.bone(root, s.tuskDown ? [root[0] - .05, root[1], root[2] - .4 * s.tusk] : [head[0] + hr + .4 * s.tusk, side * hr * .8, head[2] - hr * .2 + .12 * s.tusk], .06, .045, 'bone');
    }
    if (s.ears) for (const side of [1, -1]) R.ball([head[0] - hr * .3, side * (hr + .1 * s.ears), head[2] + .02], .1 + .1 * s.ears, 'dark');
    else for (const side of [1, -1]) R.ball([head[0] - hr * .35, side * hr * .7, head[2] + hr * .75], .06, 'dark');
    if (s.horn) {
      if (s.noseHorn) R.bone([head[0] + hr * .8, 0, head[2]], [head[0] + hr * .9 + .1, 0, head[2] + .35 * s.horn], .08, .05, 'bone');
      else if (s.horn > 1.2) R.bone([head[0] + hr * .2, 0, head[2] + hr * .7], [head[0] + hr * .5, 0, head[2] + hr + .4 * s.horn], .1, .05, 'bone'); // one great brow horn
      else for (const side of [1, -1]) R.bone([head[0], side * hr * .6, head[2] + hr * .6], [head[0] + .1, side * (hr + .25 * s.horn), head[2] + hr + .25 * s.horn], .06, .045, 'bone');
    }
    const stride = .16 + leg * .22, lr = .09 * bulk;
    const legs = [[L * .26, 1, 0, 0], [L * .26, -1, .5, .1], [-L * .32, 1, .5, .5], [-L * .32, -1, 0, .6]];
    for (const [f, side, ph, phRun] of legs) {
      const arm = f > 0 && s.arms;
      if (arm && up) { // raised arms hang in front, ending in long claws
        const sh = [shoulder[0], side * rb * .9, shoulder[2]], hand = [shoulder[0] + .3, side * (rb + .1), shoulder[2] - .42 * s.arms];
        R.bone(sh, hand, lr * 1.2, lr, 'dark');
        for (const dz of [0, .08]) R.bone(hand, [hand[0] + .16, hand[1], hand[2] - .26 - dz], .05, .025, 'bone');
        continue;
      }
      R.leg([f, side * rb * .95, h * .92], [f + (arm ? .12 : 0), side * (rb * 1.05 + (arm ? .12 * s.arms : .02))], {
        ph, phRun, r: lr * (arm ? 1.15 : 1), stride, knee: [f > 0 ? .03 : -.07, 0, .02],
        sock: s.socks ? 'light' : null, foot: arm ? 'bone' : 'ink', footR: lr * .95, // hooves, or claws on a long arm
      });
    }
    if (s.tail) {
      const tip = R.tail(rear, s.tail * .6, s.sleek ? .08 : .06, .05, { droop: s.sleek ? -.1 : -.5, rise: s.sleek ? .1 : 0, sway: .05, n: s.sleek ? 6 : 3, rings: s.sleek && s.spots ? 'ink' : null });
      if (!s.sleek) R.ball(tip, .07, 'ink'); // tuft
    }
    R.eyes(head, hr);
  },
};
