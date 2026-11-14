'use strict';
// Sauropod: pillar legs, a long tail and a longer neck. neckUp sets how steeply the neck rises.
// Pale belly, dark toes; optionally a banded neck, a ringed tail or a row of spines.
// sil: len, h, legLen, neck, neckUp, tail, bulky, frontHigh, whip, spines, bands, rings
PI.bodies.longneck = {
  cadence: .75, bounce: .4, lean: .04,
  height: s => s.legLen + .45 + s.neck * (.2 + .62 * (s.neckUp || 0)),
  build(R) {
    const s = R.s, L = s.len, leg = s.legLen, rb = .26 * (s.bulky ? 1.15 : 1), h = leg + rb * .5;
    const rear = [-L * .28, 0, h], front = [L * .25, 0, h + (s.frontHigh ? .15 : 0)];
    R.torso(rear, front, rb, rb * .95);
    R.haunch(rear[0] + .06, h + .02, rb * .85, rb * .6);       // haunches
    R.haunch(front[0] - .05, front[2] + .02, rb * .8, rb * .6); // shoulders
    const up = s.neckUp || 0, reach = s.neck * .75, neck = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4, a = (.15 + up) * (.6 + .4 * t);
      neck.push([front[0] + Math.cos(a) * reach * t, R.wave(i * .7) * .03 * t, front[2] + Math.sin(a) * reach * t]);
    }
    for (let i = 1; i <= 4; i++) {
      const r0 = rb * .6 + (.1 - rb * .6) * (i - 1) / 4, r1 = rb * .6 + (.1 - rb * .6) * i / 4;
      if (s.bands) R.banded(neck[i - 1], neck[i], r0, r1, false, 'dark', 2);
      else R.bone(neck[i - 1], neck[i], r0, r1);
    }
    const head = neck[4];
    R.bone(head, [head[0] + .16, head[1], head[2] - .02], .11, .08);
    if (s.spines) for (let i = 1; i < 4; i++) R.bone(neck[i], [neck[i][0] - .05, 0, neck[i][2] + .28], .05, .04, 'dark');
    R.tail(rear, s.tail * .7, rb * .7, s.whip ? .04 : .06, { sway: .1, n: s.rings ? 8 : 5, droop: -.25, rise: .02, rings: s.rings ? 'dark' : null });
    const stride = .18 + leg * .15;
    const legs = [[L * .2, 1, 0, 0], [L * .2, -1, .5, .12], [-L * .24, 1, .5, .5], [-L * .24, -1, 0, .62]];
    for (const [f, side, ph, phRun] of legs) {
      R.leg([f, side * rb * .95, h * .9], [f, side * (rb * 1.05 + .02)], { ph, phRun, r: .11, r1: .11, stride, knee: [f > 0 ? .02 : -.04, 0, .02], foot: 'ink', footR: .1 });
    }
    R.eyes(head, .11);
  },
};
