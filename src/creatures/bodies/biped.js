'use strict';
// Two-legged dinosaur: body balanced over the hips, tail out behind, head forward. Leans into a run.
// Pale belly and throat, ivory claws, horns and teeth; display crests are pale; optionally a ringed tail or a back ridge.
// sil: len, h, legLen, tail, neck, head, arms, claw, crest, backCrest, horn, dome, snout, sail, belly, wings, rings, ridge
PI.bodies.biped = {
  cadence: 1.05, bounce: 1, lean: .22,
  height: s => (s.legLen || s.h) + .4 + s.neck * .5 + (s.crest ? .12 : 0) + (s.sail ? .3 : 0),
  build(R) {
    const s = R.s, L = s.len, leg = s.legLen || s.h, rb = .2 + (s.head > .8 ? .04 : 0) + (s.belly ? .06 : 0);
    const hipZ = leg + rb * .3;
    const hip = [-L * .08, 0, hipZ], chest = [L * .22, 0, hipZ + .06 + (s.belly ? .12 : 0)];
    R.belly(hip, chest, rb * 1.05, rb * .95);
    const hr = .1 + s.head * .11, head = [chest[0] + .1 + s.neck * .3, 0, chest[2] + .05 + s.neck * .5];
    R.belly(chest, head, rb * .6, hr * .8); // neck and throat
    const jaw = [head[0] + hr * .6 + s.head * .22 + (s.snout ? .2 : 0), 0, head[2] - hr * .25];
    R.bone(head, jaw, hr, hr * (s.snout ? .5 : .7));
    if (s.head >= .7) for (const t of [.45, .8]) R.ball([head[0] + (jaw[0] - head[0]) * t, 0, jaw[2] - hr * .55], .035, 'bone'); // teeth
    if (s.dome) R.ball([head[0], 0, head[2] + hr * .6], hr * .9, 'light');
    if (s.crest) {
      if (s.backCrest) R.bone(head, [head[0] - .2 - .25 * s.crest, 0, head[2] + .12 + .12 * s.crest], .08, .06, 'light');
      else R.bone([head[0] + hr * .3, 0, head[2] + hr * .7], [head[0] - hr * .2, 0, head[2] + hr * .7 + .16 * s.crest], .07, .06, 'light');
    }
    if (s.horn) for (const side of [1, -1]) R.bone([head[0] + .02, side * hr * .5, head[2] + hr * .6], [head[0], side * hr * .8, head[2] + hr * .6 + .2 * s.horn], .055, .045, 'bone');
    if (s.sail) for (const f of [-.18, -.04, .1, .22]) {
      R.bone([f * L, 0, hipZ + rb * .6], [f * L, 0, hipZ + rb * .6 + .42 * s.sail * (1 - Math.abs(f - .02) * 1.6)], .07, .06, 'dark');
    }
    if (s.ridge) for (const f of [-.1, .02, .14]) R.ball([f * L, 0, hipZ + rb * .95], .06, 'dark');
    R.tail(hip, s.tail * .65, rb * .8, .05, { sway: .08, n: s.rings ? 6 : 4, rise: .05, rings: s.rings ? 'dark' : null });
    for (const side of [1, -1]) {
      const sh = [chest[0] - .05, side * rb * .65, chest[2]];
      if (s.wings) R.wing(sh, .5, side, { rest: -.1, amp: .5, r0: .1, r: .09, r1: .06, mat: 'dark', web: 'dark', sweep: -.2, chord: .25 });
      else if (s.arms > .12) {
        const reach = (s.claw > 1 ? s.claw * .7 : 1) * s.arms, hand = [chest[0] + .12 + reach * .2, side * rb * .8, chest[2] - .1 - reach * .25];
        R.bone(sh, hand, .06, .05, 'dark');
        if (s.claw) R.bone(hand, [hand[0] + .06 * s.claw, hand[1], hand[2] - .1 * s.claw], .04, .03, 'bone');
      }
      R.leg([hip[0], side * rb * .5, hipZ - .05], [hip[0] + .05, side * rb * .55], {
        ph: side > 0 ? 0 : .5, r: .08 + (rb - .2) * .3, r0: .13, stride: .2 + leg * .25, knee: [.1, 0, .02], foot: 'bone', footR: .06,
      });
    }
    R.eyes(head, hr);
  },
};
