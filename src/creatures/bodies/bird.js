'use strict';
// Bird. Ground birds walk on two legs with wings folded and spread them to flap when they run.
// Birds with hover stay in the air and beat their wings all the time.
// Pale breast, dark wings and tail, ivory beak and legs.
// sil: len, legLen, beak, neck, tail, hover, wing, crest, casque
PI.bodies.bird = {
  cadence: 1.4, bounce: .8, lean: .15,
  height: s => (s.hover ? 0 : s.legLen) + .6 + (s.neck || 0) * .5 + (s.crest || s.casque ? .12 : 0),
  build(R) {
    const s = R.s, L = s.len, fly = !!s.hover, rb = .2;
    const z = fly ? 0 : s.legLen + rb * .8;
    const rump = [-L * .3, 0, z], breast = [L * .15, 0, z + .06];
    R.belly(rump, breast, rb * .9, rb);
    const head = [L * .3 + s.neck * .3, 0, z + .16 + s.neck * .5];
    R.bone(breast, head, rb * .6, .13);
    R.ball(head, .14);
    R.bone(head, [head[0] + .14 + s.beak * .42, 0, head[2] - .03 - (s.casque ? .05 : 0)], s.casque ? .09 : .06, .04, s.beak > .5 && !s.casque ? 'ink' : 'bone');
    if (s.casque) R.ball([head[0] + .12, 0, head[2] + .14], .09, 'bone');
    if (s.crest) R.bone(head, [head[0] - .12, 0, head[2] + .2 * s.crest + .1], .05, .04, 'dark');
    R.tail(rump, s.tail * .5, .1, .06, { n: 2, rise: .15, sway: .02, mat: 'dark' });
    for (const side of [1, -1]) {
      if (fly || R.gait.run) R.wing([0, side * rb * .6, z + .08], (s.wing || .7) * .6, side, { rest: .15, amp: .8, r0: .11, r: .09, r1: .06, mat: 'dark', web: 'dark', sweep: -.1, chord: .22 });
      else R.bone([L * .1, side * rb * .8, z + .05], [-L * .3, side * rb * .75, z + .02], .1, .06, 'dark'); // folded
      if (!fly) R.leg([-.02, side * rb * .4, z - rb * .5], [0, side * .1], { ph: side > 0 ? 0 : .5, r: .05, stride: .14, knee: [-.05, 0, 0], mat: 'bone' });
    }
    R.eyes(head, .14);
  },
};
