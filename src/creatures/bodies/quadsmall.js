'use strict';
// Small four-legged mammal. Walks on diagonal pairs; at a run it bounds: fore pair then hind pair.
// Pale belly, dark ears and nose, and optionally a ringed tail, back spots, armour bands or a pale face.
// sil: len, h, legLen, tail, snout, ears, head, upright, arms, bushy, sleek, scales, membrane, rings, spots, face
PI.bodies.quadsmall = {
  cadence: 1.3, bounce: 1, lean: .1,
  height: s => s.h + (s.upright ? .6 : .34) + (s.ears ? s.ears * .15 : 0),
  build(R) {
    const s = R.s, L = s.len, h = s.h, up = s.upright || 0, rb = (s.sleek ? .17 : .2) * (s.scales ? 1.15 : 1);
    const back = [-L * .3, 0, h], front = [L * .22, 0, h + up * .25];
    if (s.scales) { // overlapping armour plates
      R.banded(back, front, rb * 1.08, rb, false, 'dark', 5);
      R.ball([-.02, 0, h + .1], rb * 1.05);
    } else {
      R.torso(back, front, rb * 1.05, rb, .32);
      R.haunch(back[0] + .04, h + rb * .05, rb * .8, rb * .5); // haunches
    }
    if (s.spots) for (const f of [-.24, -.08, .08]) R.ball([f * L, (f * 10 % 2 ? .06 : -.06), h + rb * .82], .06, 'ink');
    const hr = rb * .82 * (s.head || 1), head = [L * .5 - hr * .4, 0, h + .08 + up * .45];
    R.bone(front, head, rb * .7, hr * .8);
    R.ball(head, hr);
    if (s.face) R.ball([head[0] + hr * .45, 0, head[2] - hr * .1], hr * .62, 'light'); // a bare pale face
    if (s.snout) {
      const tip = [head[0] + hr * .6 + s.snout * .3, 0, head[2] - hr * .3];
      R.bone(head, tip, hr * .55, .05);
      R.ball(tip, .045, 'ink'); // nose
    }
    if (s.ears) for (const side of [1, -1]) R.ball([head[0] - hr * .3, side * hr * .75, head[2] + hr * (.6 + s.ears * .5)], .05 + s.ears * .1, 'dark');
    const stride = .12 + s.legLen * .2;
    const legs = [[L * .2, 1, 0, 0], [L * .2, -1, .5, .12], [-L * .26, 1, .5, .5], [-L * .26, -1, 0, .62]]; // f, side, walk phase, run phase
    for (const [f, side, ph, phRun] of legs) {
      const fore = f > 0;
      R.leg([f, side * rb * .9, h * .9 + (fore ? up * .2 : 0)], [f + (fore ? .05 : -.02), side * (rb + .06)], {
        ph, phRun, r: fore && s.arms ? .08 : .07, stride, knee: [fore ? .04 : -.06, 0, .03],
      });
    }
    if (s.membrane) for (const side of [1, -1]) R.bone([L * .15, side * rb, h * .9], [-L * .22, side * (rb + .32), h * .8], .1, .1, 'light'); // gliding skin
    if (s.tail) {
      if (s.scales) R.tail(back, s.tail * .7, .15, .07, { droop: -.25, sway: .05, n: 5, rings: 'dark' });
      else R.tail(back, s.tail * .7, s.bushy ? .16 : .07, s.bushy ? .14 : .05, { rise: s.bushy ? .7 : .12, sway: .06, n: s.bushy ? 4 : s.rings ? 6 : 4, rings: s.bushy ? 'light' : s.rings ? 'ink' : null });
    }
    R.eyes(head, hr);
  },
};
