'use strict';
// Sauropod: pillar legs, a long tail and a longer neck. The options below are what tell one giant from another
// by outline alone: how steeply and how thickly the neck rises, how high the shoulders stand, the length and
// carriage of the tail, and what grows along the back.
// sil: len, h, legLen, neck, neckUp (0 level .. 1.3 upright), neckThick, head, crest (a dome on the skull),
//      frontHigh (shoulders above hips), bulk, hump, tail, tailThick, tailUp, whip, club,
//      spines (tall paired neck spines), backSpines (a low row down the back and tail), osteoderms (armour studs),
//      bands, rings, spots
PI.bodies.longneck = {
  cadence: .75, bounce: .4, lean: .04,
  height: s => s.legLen + .45 + (s.frontHigh || 0) * .3 + s.neck * (.2 + .62 * (s.neckUp || 0)),
  build(R) {
    const s = R.s, L = s.len, leg = s.legLen, bulk = s.bulk || (s.bulky ? 1.15 : 1), rb = .26 * bulk, h = leg + rb * .5;
    const lift = .32 * (s.frontHigh || 0), thick = s.neckThick || 1, hs = s.head || 1;
    const rear = [-L * .28, 0, h], front = [L * .25, 0, h + lift];
    R.torso(rear, front, rb, rb * .95);
    R.haunch(rear[0] + .06, h + .02, rb * .85, rb * .6);
    R.haunch(front[0] - .05, front[2] + .02, rb * .8, rb * .6);
    if (s.hump) R.ball([L * .12, 0, h + lift * .6 + rb * .55], rb * (.75 + .3 * s.hump));
    if (s.spots) for (const [f, side] of [[-.2, 1], [-.05, -1], [.1, 1], [.2, -1]]) R.ball([f * L, side * rb * .5, h + rb * .82], .08, 'ink');
    if (s.osteoderms) for (const f of [-.24, -.1, .04, .18]) for (const side of [1, -1]) R.ball([f * L, side * rb * .5, h + lift * (f + .28) / .53 + rb * .86], .075, 'bone');
    if (s.backSpines) for (let i = 0; i < 7; i++) {
      const f = -.3 + i * .09;
      R.bone([f * L, 0, h + rb * .85], [f * L - .03, 0, h + rb * .85 + .17 * s.backSpines], .05, .03, 'dark');
    }
    // the neck: six joints from the shoulders to the skull, steeper toward the top
    const up = s.neckUp || 0, reach = s.neck * .75, n = 6, neck = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (.15 + up) * (.6 + .4 * t);
      neck.push([front[0] + Math.cos(a) * reach * t, R.wave(i * .5) * .03 * t, front[2] + Math.sin(a) * reach * t]);
    }
    const r0 = rb * .62 * thick, r1 = .1 * Math.sqrt(thick) * hs;
    for (let i = 1; i <= n; i++) {
      const a = r0 + (r1 - r0) * (i - 1) / n, b = r0 + (r1 - r0) * i / n;
      if (s.bands) R.banded(neck[i - 1], neck[i], a, b, false, 'dark', 2);
      else R.bone(neck[i - 1], neck[i], a, b);
    }
    const head = neck[n], hr = .11 * hs;
    R.bone(head, [head[0] + .17 * hs, head[1], head[2] - .03], hr, hr * .72);
    if (s.crest) R.ball([head[0] + .03, 0, head[2] + hr * .85], hr * (.6 + .5 * s.crest));
    if (s.spines) for (let i = 1; i < n; i++) for (const side of [1, -1]) {
      R.bone(neck[i], [neck[i][0] - .07, side * .07, neck[i][2] + .34 * s.spines * (1 - Math.abs(i - 3) / 6)], .05, .035, 'dark');
    }
    const tip = R.tail(rear, s.tail * .7, rb * .7 * (s.tailThick || 1), s.whip ? .035 : .06, {
      sway: .1, n: s.rings || s.whip ? 8 : 5, droop: s.tailUp ? 0 : -.25, rise: s.tailUp ? .22 * s.tailUp : .02, rings: s.rings ? 'dark' : null,
    });
    if (s.club) R.ball(tip, .12 + .05 * s.club, 'bone');
    const stride = .18 + leg * .15, lr = .11 * Math.sqrt(bulk);
    const legs = [[L * .2, 1, 0, 0], [L * .2, -1, .5, .12], [-L * .24, 1, .5, .5], [-L * .24, -1, 0, .62]];
    for (const [f, side, ph, phRun] of legs) {
      R.leg([f, side * rb * .95, (h + (f > 0 ? lift : 0)) * .9], [f, side * (rb * 1.05 + .02)], { ph, phRun, r: lr, r1: lr, stride, knee: [f > 0 ? .02 : -.04, 0, .02], foot: 'ink', footR: lr * .9 });
    }
    R.eyes(head, hr);
  },
};
