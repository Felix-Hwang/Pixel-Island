'use strict';
// Sprawling reptile: belly near the ground, legs out to the sides, long tail. The spine wiggles as it walks.
// Pale belly; optionally cross bands, a ringed tail, back spots, a casque or a row of ridges.
// sil: len, h, tail, legLen, snout, crest, curl, ridges, bands, rings, spots
PI.bodies.reptile = {
  cadence: 1.3, bounce: .3, lean: 0,
  height: s => s.h + .3 + (s.crest ? .15 : 0),
  build(R) {
    const s = R.s, L = s.len, h = s.h + .05, rb = .17 + (s.ridges ? .03 : 0) + (L > 1.2 ? .03 : 0);
    const p0 = [-L * .3, R.wave(2) * .05, h], p1 = [0, R.wave(1) * .04, h], p2 = [L * .25, R.wave(0) * .03, h];
    if (s.bands) { R.banded(p0, p1, rb, rb * .95, false, 'dark', 3); R.banded(p1, p2, rb * .95, rb * .9, 'dark', false, 3); }
    else { R.torso(p0, p1, rb, rb * .95, .3); R.torso(p1, p2, rb * .95, rb * .9, .3); }
    if (s.spots) for (const f of [-.22, -.08, .06, .18]) R.ball([f * L, 0, h + rb * .88], .06, 'light');
    const head = [L * .42, 0, h + .02];
    R.bone(p2, head, rb * .8, rb * .7);
    R.bone(head, [head[0] + .15 + s.snout * .4, 0, head[2] - .03], rb * .6, Math.max(.06, rb * .4));
    if (s.snout > .7) for (const f of [.2, .38]) R.ball([head[0] + f, 0, head[2] - rb * .42], .035, 'bone'); // teeth along the jaw
    if (s.crest) R.ball([head[0] - .05, 0, head[2] + rb * .8], .09 + .08 * s.crest, 'dark');
    if (s.ridges) for (const f of [-.25, -.1, .05, .2]) R.ball([f * L, 0, h + rb * .9], .07, 'dark');
    R.tail(p0, s.tail * .75, rb * .8, .05, { sway: .14, n: s.rings ? 6 : 5, curl: s.curl ? .5 : 0, droop: -.05, rings: s.rings ? 'dark' : null });
    const span = rb + s.legLen * .75, stride = .14 + s.legLen * .15;
    const legs = [[L * .2, 1, 0], [L * .2, -1, .5], [-L * .24, 1, .5], [-L * .24, -1, 0]];
    for (const [f, side, ph] of legs) {
      R.leg([f, side * rb * .6, h * .9], [f + (f > 0 ? .08 : -.04), side * span], { ph, r: .065, stride, knee: [0, side * .05, s.legLen * .45] });
    }
    R.eyes(head, rb * .7);
  },
};
