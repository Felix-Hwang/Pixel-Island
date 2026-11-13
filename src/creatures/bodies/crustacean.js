'use strict';
// Crab: wide flat body, claws held forward, eyes on stalks, optionally a borrowed ivory shell.
// sil: len, w, claws, legs, shell
PI.bodies.crustacean = {
  cadence: 1.6, bounce: .2, lean: 0,
  height: s => s.shell ? .75 : .45,
  build(R) {
    const s = R.s, w = s.w, h = .22;
    if (s.shell) {
      R.ball([-.12, 0, h + .2], .3, 'bone');
      R.ball([-.2, .03, h + .36], .2, 'dark');   // the whorl
      R.ball([-.26, .05, h + .47], .11, 'bone'); // the spire
    }
    R.bone([.02, -w * .2, h], [.02, w * .2, h], .17, .17);
    for (const side of [1, -1]) {
      const big = side > 0 ? 1.25 : 1, tip = [.45 + s.claws * .1, side * w * .35, h + .02];
      R.chain([[.1, side * w * .3, h], [.3, side * w * .55, h + .05], tip], .08 * big, .11 * big);
      R.ball([tip[0] + .07, tip[1], tip[2]], .06 * big, 'bone'); // pincer tips
      for (let i = 0; i < (s.legs || 6) / 2; i++) {
        const f = .05 - i * .13;
        R.leg([f, side * .15, h], [f - .03, side * (w * .5 + .26)], { ph: (i + (side > 0 ? 0 : 1)) % 2 ? .5 : 0, r: .05, stride: .1, knee: [0, side * .08, .22] });
      }
      R.bone([.15, side * .08, h + .1], [.2, side * .1, h + .3], .04, .05); // eye stalk
    }
    R.eyes([.16, 0, h + .26], .14);
  },
};
