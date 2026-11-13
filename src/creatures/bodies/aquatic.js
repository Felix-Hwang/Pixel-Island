'use strict';
// Amphibian or shore fish: low wet body, eyes on top, big hind legs or pectoral fins. It hops when it runs.
// Pale belly; optionally spots on the back.
// sil: len, h, legs (2 or 4), legLen, tail, eyes, fin, spots
PI.bodies.aquatic = {
  cadence: 1.2, bounce: 1.8, lean: .05,
  height: s => s.h + .32 + (s.fin ? .2 * s.fin : 0),
  build(R) {
    const s = R.s, L = s.len, h = Math.max(s.h, .2), rb = .2;
    const rear = [-L * .3, 0, h], front = [L * .2, 0, h + .03];
    R.belly(rear, front, rb * .95, rb);
    if (s.spots) for (const f of [-.22, -.05, .1]) R.ball([f * L, (f > -.1 ? .06 : -.06), h + rb * .85], .06, 'ink');
    const head = [L * .42, 0, h + .04];
    R.ball(head, rb * .9);
    if (s.eyes) for (const side of [1, -1]) R.ball([head[0] - .02, side * rb * .5, head[2] + rb * .75], .09); // eye bumps
    if (s.fin) R.bone([-L * .05, 0, h + rb * .8], [-L * .25, 0, h + rb * .8 + .25 * s.fin], .06, .05, 'dark');
    if (s.tail) R.tail(rear, s.tail * .6, rb * .7, .05, { sway: .12, n: 4 });
    for (const side of [1, -1]) {
      const ph = side > 0 ? 0 : .5;
      R.leg([L * .15, side * rb * .6, h * .8], [L * .22, side * (rb + (s.legs === 2 ? .22 : .15))], { ph, phRun: 0, r: s.legs === 2 ? .08 : .06, stride: .1 });
      if (s.legs !== 2) {
        R.leg([-L * .25, side * rb * .6, h * .8], [-L * .3, side * (rb + .1 + s.legLen * .5)], {
          ph: .5 - ph, phRun: .5, r: .075, stride: .12 + s.legLen * .2, knee: [.1, side * .1, s.legLen * .6], lift: 1.5,
        });
      }
    }
    if (s.eyes) R.eyes([head[0] - .09, 0, head[2] + rb * .72], rb * .7); // the eyes sit on the bumps
    else R.eyes(head, rb * .9);
  },
};
