'use strict';
// Legless slitherer. The whole body is one travelling wave; running widens and quickens it.
// Dark saddles cross the back every third segment, and the tongue flicks.
// sil: len, h
PI.bodies.serpent = {
  cadence: 1.1, bounce: 0, lean: 0,
  height: s => s.h + .35,
  build(R) {
    const s = R.s, L = s.len, n = 12, r = s.h * .85, amp = R.gait.run ? .24 : .17;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([L * .5 - L * t, R.wave(i * 1.05) * amp * (t < .12 ? .4 : 1), r + (i === 0 ? .14 : i === 1 ? .06 : 0)]);
    }
    const taper = t => r * (t < .12 ? .8 + t * 1.6 : 1 - Math.max(0, t - .45) * 1.3);
    for (let i = 1; i <= n; i++) R.bone(pts[i - 1], pts[i], taper((i - 1) / n), Math.max(.05, taper(i / n)), i % 3 === 2 ? 'ink' : false);
    R.ball(pts[0], r * .95);
    if (Math.floor(R.t * 3) % 2) R.bone(pts[0], [pts[0][0] + r + .22, pts[0][1], pts[0][2] - .04], .035, .03, 'ink'); // tongue
    R.eyes(pts[0], r * .95);
  },
};
