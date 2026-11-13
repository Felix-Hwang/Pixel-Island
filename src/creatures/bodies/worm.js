'use strict';
// Long segmented crawler with many short legs. The body ripples from head to tail as it moves.
// Every second plate is darker, so the segments are visible.
// sil: len, h, segments, legs, w
PI.bodies.worm = {
  cadence: 1.4, bounce: 0, lean: 0,
  height: s => s.h + .3,
  build(R) {
    const s = R.s, L = s.len, n = s.segments || 8, w = (s.w || .3) * .5, h = s.h;
    let prev = null, head = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, f = L * .5 - L * t, side = R.wave(i * .8) * .09 * (t + .3);
      const p = [f, side, h + (i === 0 ? .04 : 0)];
      if (prev) R.bone(prev, p, w * (1 - (t - 1 / n) * .35), w * (1 - t * .35), i % 2 ? 'dark' : false);
      else head = p;
      if (s.legs && i > 0 && i < n) for (const leg of [1, -1]) {
        R.leg([f, side + leg * w * .6, h], [f, side + leg * (w + .2)], { ph: (i % 2 ? .5 : 0) + (leg > 0 ? 0 : .25), r: .05, stride: .07, lift: .5, mat: 'ink' });
      }
      prev = p;
    }
    R.ball(head, w * 1.02, 'dark');
    for (const side of [1, -1]) R.bone(head, [head[0] + .3, head[1] + side * .2, h + .12], .045, .04, 'ink');
    R.eyes(head, w);
  },
};
