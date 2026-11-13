'use strict';
// Six-legged insect: abdomen, thorax, head. It walks on alternating tripods, and running only raises the step rate.
// Beetles (dome) get a dark pronotum and a seam down the wing cases.
// sil: len, h, legLen, abdomen, antenna, horn, pincer, snout, dome, thin, flat, raised, hindLeg, spots, bands
PI.bodies.hexapod = {
  cadence: 1.5, bounce: .3, lean: 0,
  height: s => s.h + (s.raised ? .55 : .28) + (s.horn ? .2 * s.horn : 0),
  build(R) {
    const s = R.s, L = s.len, thin = s.thin ? .55 : 1, flat = s.flat ? .75 : 1;
    const rt = .19 * thin * flat * (s.dome ? 1.2 : 1);   // thorax
    const ra = rt * (s.abdomen || 1) * 1.1;              // abdomen
    const h = Math.max(s.h, ra * .9), up = s.raised ? .3 : 0, lift = s.dome ? .06 : 0;
    const rear = [-L * .5 + ra, 0, h + lift], waist = [-L * .05, 0, h + lift];
    if (s.bands) R.banded(rear, waist, ra, ra * .8, false, 'ink', 4);
    else R.bone(rear, waist, ra, ra * (s.dome ? 1 : .8));
    if (s.dome) R.bone([rear[0], 0, h + lift + ra * .92], [waist[0], 0, h + lift + ra * .9], .035, .035, 'ink'); // the seam between the wing cases
    if (s.spots) for (const [f, side] of [[-.32, 1], [-.32, -1], [-.14, 1], [-.14, -1]]) R.ball([f * L, side * ra * .5, h + lift + ra * .72], .075, 'ink');
    R.bone([L * .02, 0, h], [L * .25, 0, h + up * .6], rt, rt * .85, s.dome ? 'dark' : false);
    const head = [L * .5 - rt * .7, 0, h + up];
    R.ball(head, rt * .8, s.spots ? 'ink' : false);
    const span = rt * .5 + s.legLen * .85, at = [L * .24, L * .04, -L * .18];
    for (let i = 0; i < 3; i++) for (const side of [1, -1]) {
      const hind = i === 2 && s.hindLeg;
      R.leg([at[i], side * rt * .5, h], [at[i] - (i - 1) * .1 - (hind ? .25 : 0), side * span * (hind ? 1.1 : 1)], {
        ph: (i + (side > 0 ? 0 : 1)) % 2 ? .5 : 0, r: .06, stride: .13 + s.legLen * .12, mat: hind ? 'dark' : 'ink',
        knee: [0, side * span * .15, s.legLen * (hind ? 1.1 : .55)],
      });
    }
    if (s.raised) for (const side of [1, -1]) { // a mantis holds its forelegs folded in front
      R.chain([[L * .25, side * rt * .5, h + up * .6], [L * .42, side * .16, h + up * .2], [L * .56, side * .12, h + up * .75]], .06, .05, 'dark');
    }
    if (s.antenna) for (const side of [1, -1]) R.bone(head, [head[0] + .35 * s.antenna, side * .22 * s.antenna, head[2] + .28 * s.antenna], .045, .04, 'ink');
    if (s.horn) R.bone(head, [head[0] + .42 * s.horn, 0, head[2] + .32 * s.horn], .08, .055, 'dark');
    if (s.pincer) for (const side of [1, -1]) R.chain([head, [head[0] + .22 * s.pincer, side * .2, head[2]], [head[0] + .42 * s.pincer, side * .08, head[2]]], .06, .045, 'dark');
    if (s.snout) R.bone(head, [head[0] + .38 * s.snout, 0, head[2] - .1], .07, .05);
    R.eyes(head, rt * .8);
  },
};
