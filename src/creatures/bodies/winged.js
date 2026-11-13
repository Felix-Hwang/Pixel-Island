'use strict';
// Flying insect: it hovers, so its shadow separates from the body. Wings beat faster the faster it flies.
// Wings are pale membranes; a moth (broad) has wide body-coloured wings with an eye spot on each.
// sil: len, wing, tail, hover, legLen, thin, fat, broad, hindLeg, bands
PI.bodies.winged = {
  cadence: 1.2, bounce: 0, lean: .12,
  height: s => .4 + (s.broad ? .3 : .15),
  build(R) {
    const s = R.s, L = s.len, rb = (s.fat ? .22 : .16) * (s.thin ? .7 : 1);
    const head = [L * .5, 0, .02];
    R.bone([-L * .2, 0, 0], [L * .3, 0, 0], rb, rb * .9, s.bands ? 'dark' : false);
    R.ball(head, rb * .85);
    R.tail([-L * .2, 0, 0], s.tail, rb * (s.thin ? .7 : .95), rb * (s.thin ? .45 : .5), { n: s.thin ? 5 : 4, sway: .03, droop: s.thin ? 0 : -.15, rings: s.bands ? 'ink' : null });
    for (const side of [1, -1]) {
      if (s.broad) { // one wide moth wing with an eye spot
        const w = R.wing([L * .15, side * rb * .5, .05], s.wing * .55, side, { rest: .2, amp: .55, r0: .1, r: .085, r1: .06, mat: false, web: false, sweep: .1, chord: .5 });
        R.ball([w.mid[0] - .12, w.mid[1], w.mid[2] + .03], .1, 'ink');
        R.ball([w.mid[0] - .12, w.mid[1], w.mid[2] + .06], .05, 'light');
      } else {
        const o = { rest: .2, amp: .8, r0: .09, r: .08, r1: .06, mat: 'light', web: 'light', chord: .16 };
        R.wing([L * .12, side * rb * .5, .05], s.wing * .55, side, { ...o, sweep: .1 });
        if (s.wing > 1) R.wing([-L * .08, side * rb * .5, .05], s.wing * .5, side, { ...o, sweep: -.35 }); // hind wings
      }
    }
    if (s.legLen > .2) for (const side of [1, -1]) for (const f of [.15, -.1]) {
      R.bone([f * L, side * rb * .5, -.02], [f * L - .1, side * (rb + .1), -s.legLen], .045, .04, 'ink'); // dangling legs
    }
    if (s.hindLeg) for (const side of [1, -1]) {
      R.chain([[-L * .15, side * rb * .5, 0], [-L * .45, side * (rb + .12), .25], [-L * .6, side * (rb + .16), -s.legLen]], .07, .05, 'dark');
    }
    R.eyes(head, rb * .85);
  },
};
