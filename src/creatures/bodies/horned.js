'use strict';
// Ceratopsian: beak, a neck frill and, on the bigger ones, brow and nose horns. Charges with its head low.
// Pale belly, dark frill with a pale centre, ivory horns, beak and frill spikes, dark toes.
// sil: len, h, horns, noseHorn, frill, spikes, beak, tail
PI.bodies.horned = {
  cadence: .95, bounce: .7, lean: .08,
  height: s => s.h + .5 + s.frill * .32 + (s.horns ? s.horns * .12 : 0),
  build(R) {
    const s = R.s, L = s.len, leg = s.h * .75, rb = .25, h = leg + rb * .55;
    const rear = [-L * .3, 0, h + .04], front = [L * .2, 0, h];
    R.belly(rear, front, rb, rb * .95);
    const hr = .17, head = [L * .42, 0, h - .02];
    R.bone(front, head, rb * .7, hr);
    const beak = [head[0] + .18 + s.beak * .2, 0, head[2] - .1];
    R.bone(head, beak, hr * .8, .07);
    R.ball(beak, .065, 'bone');
    for (const a of [-1, -.5, 0, .5, 1]) {
      const p = [head[0] - .12, a * .3 * s.frill, head[2] + .1 + .3 * s.frill * (1 - Math.abs(a) * .4)];
      R.ball(p, .1 + .07 * s.frill, a === 0 && s.frill > .5 ? 'light' : 'dark');
      if (s.spikes && a !== 0) R.bone(p, [p[0] - .05, p[1] + a * .16, p[2] + .24], .05, .04, 'bone');
    }
    if (s.horns) for (const side of [1, -1]) {
      R.bone([head[0] + .05, side * hr * .5, head[2] + hr * .6], [head[0] + .25 + .2 * s.horns, side * hr * .7, head[2] + hr * .6 + .3 * s.horns], .06, .04, 'bone');
    }
    if (s.noseHorn) R.bone([head[0] + .22, 0, head[2]], [head[0] + .28, 0, head[2] + .12 + .22 * s.noseHorn], .06, .045, 'bone');
    R.tail(rear, s.tail * .6, rb * .65, .06, { sway: .07, n: 3, droop: -.2 });
    const stride = .15 + leg * .2;
    const legs = [[L * .2, 1, 0, 0], [L * .2, -1, .5, .1], [-L * .28, 1, .5, .5], [-L * .28, -1, 0, .6]];
    for (const [f, side, ph, phRun] of legs) {
      R.leg([f, side * rb * .55, h * .9], [f, side * (rb * .6 + .03)], { ph, phRun, r: .09, stride, knee: [f > 0 ? .03 : -.06, 0, .02], foot: 'ink', footR: .085 });
    }
    R.eyes(head, hr);
  },
};
