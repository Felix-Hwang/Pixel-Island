'use strict';
// Four-legged plant-eating dinosaur: plates, tail spikes, a tail club or a duck bill decide the silhouette.
// Pale belly, dark plates, ivory spikes, club and beak, dark toes.
// sil: len, h, legLen, tail, neck, plates, spikes, club, wide, arch, frontLow, duckbill
PI.bodies.quaddino = {
  cadence: .9, bounce: .6, lean: .06,
  height: s => s.legLen + .5 + (s.plates ? .32 * s.plates : 0) + (s.arch ? .1 : 0) + (s.neck > .5 ? s.neck * .25 : 0),
  build(R) {
    const s = R.s, L = s.len, leg = s.legLen, rb = s.wide ? .3 : .25, h = leg + rb * .5;
    const hipZ = h + (s.arch ? .12 * s.arch : 0) + (s.frontLow ? .1 : 0), shZ = h - (s.frontLow ? .05 : 0);
    const rear = [-L * .3, 0, hipZ], mid = [-L * .02, 0, hipZ + .03], front = [L * .25, 0, shZ];
    R.torso(rear, mid, rb, rb * .93);
    R.torso(mid, front, rb * .93, rb * .85);
    R.haunch(rear[0] + .06, hipZ, rb * .84, rb * .6);    // haunches
    R.haunch(front[0] - .05, shZ + .02, rb * .7, rb * .6); // shoulders
    if (s.wide) for (const side of [1, -1]) R.bone([-L * .25, side * .14, h], [L * .15, side * .14, h], rb * .85, rb * .75); // broad armoured back
    const head = [front[0] + .15 + s.neck * .35, 0, shZ - .05 + s.neck * .35 - (s.plates ? .12 : 0)];
    R.bone(front, head, rb * .55, .12);
    R.bone(head, [head[0] + .2, 0, head[2] - .04], .12, s.duckbill ? .1 : .07, s.duckbill ? 'bone' : false);
    if (s.plates) for (let i = 0; i < 5; i++) {
      const f = -L * .35 + (L * .55) * i / 4, top = (i < 3 ? hipZ : shZ + (hipZ - shZ) * .4) + rb * .8;
      const size = .1 + .13 * s.plates * (1 - Math.abs(i - 2) / 3);
      R.bone([f, 0, top], [f, 0, top + size * 1.6], .09, .05, 'dark');
    }
    const tip = R.tail(rear, s.tail * .6, rb * .7, .06, { sway: .1, n: 4, droop: -.1 });
    if (s.club) R.ball(tip, .16, 'bone');
    else if (s.spikes) for (const side of [1, -1]) R.bone(tip, [tip[0] - .1, tip[1] + side * .25 * s.spikes, tip[2] + .2 * s.spikes], .05, .04, 'bone');
    if (s.spikes > 1) for (const side of [1, -1]) R.bone([L * .15, side * rb * .7, h + .05], [L * .1, side * (rb + .3), h + .25], .06, .04, 'bone'); // shoulder spikes
    if (s.wide && s.spikes) for (const f of [-.2, 0, .18]) for (const side of [1, -1]) R.ball([f * L, side * (rb + .12), h], .07, 'bone'); // armour studs
    const stride = .16 + leg * .2;
    const legs = [[L * .2, 1, 0, 0], [L * .2, -1, .5, .1], [-L * .28, 1, .5, .5], [-L * .28, -1, 0, .6]];
    for (const [f, side, ph, phRun] of legs) {
      R.leg([f, side * rb * .95, h * .9], [f, side * (rb * 1.05 + .03)], { ph, phRun, r: .09, stride, knee: [f > 0 ? .03 : -.06, 0, .02], foot: 'ink', footR: .085 });
    }
    R.eyes(head, .12);
  },
};
