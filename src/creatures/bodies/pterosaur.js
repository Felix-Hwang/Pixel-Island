'use strict';
// Flying reptile: a small body under very wide wings, a long beak and often a head crest.
// The wing bones are body-coloured and the membrane between them is pale; the beak is ivory.
// sil: wing, head, crest, tail, hover, neck
PI.bodies.pterosaur = {
  cadence: 1, bounce: 0, lean: .12,
  height: s => .5 + (s.crest ? .22 : 0) + (s.neck ? .2 : 0),
  build(R) {
    const s = R.s, rb = .16, nk = s.neck ? .35 : .15;
    R.belly([-.25, 0, 0], [.15, 0, .03], rb * .8, rb);
    const head = [.3 + nk * .5, 0, .1 + nk * .3];
    R.bone([.15, 0, .03], head, rb * .55, .11);
    R.bone(head, [head[0] + .25 + s.head * .3, 0, head[2] - .06], .1, .04, 'bone');
    if (s.crest) R.bone(head, [head[0] - .2 - .2 * s.crest, 0, head[2] + .1 + .12 * s.crest], .07, .05, 'dark');
    for (const side of [1, -1]) {
      R.wing([.08, side * rb * .5, .05], s.wing * .55, side, { rest: .12, amp: .55, r0: .12, r: .09, r1: .06, mat: false, web: 'light', sweep: -.12, chord: .38 });
      R.bone([-.2, side * .08, -.02], [-.4, side * .1, -.1], .05, .04, 'dark');
    }
    if (s.tail > .3) R.ball(R.tail([-.25, 0, 0], s.tail * .6, .06, .04, { n: 3, sway: .04 }), .08, 'dark');
    R.eyes(head, .11);
  },
};
