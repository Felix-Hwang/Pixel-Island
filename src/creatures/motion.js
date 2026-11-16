'use strict';
// How each kind of body carries itself. Behaviour files decide where a creature wants to go; this file turns
// that wish into the movement of a living thing: it turns at its own rate, and it darts, scurries, hops, weaves,
// hovers or plods according to its body. It also makes an idle creature look around.
(() => {
  const STEP = Math.PI / 4;
  // turn: how fast the body can change heading, in radians per second
  const KINDS = {
    dart: { turn: 14 },    // insects and lizards: a quick run, a dead stop, another run
    scurry: { turn: 11 },  // small mammals: short runs with pauses and the odd hop
    hop: { turn: 9 },      // ground birds: speed comes in pulses
    stride: { turn: 7 },   // two-legged dinosaurs
    weave: { turn: 6 },    // worms and snakes: the path snakes from side to side
    hover: { turn: 5 },    // fliers: wide arcs, never quite still
    glide: { turn: 4 },    // swimmers: long smooth curves
    sidle: { turn: 10 },   // crabs: they walk sideways
    heavy: { turn: 3.2 },  // big four-legged animals: slow to turn, steady once moving
  };
  const BY_BODY = {
    hexapod: 'dart', reptile: 'dart', quadsmall: 'scurry', bird: 'hop', biped: 'stride', worm: 'weave', serpent: 'weave',
    winged: 'hover', pterosaur: 'hover', aquatic: 'glide', crustacean: 'sidle', quadlarge: 'heavy', quaddino: 'heavy', longneck: 'heavy', horned: 'heavy',
  };
  const M = PI.motion = {};
  M.kindOf = c => (c.sp.sil.hover ? 'hover' : BY_BODY[c.sp.body] || 'stride');
  // v: the steering the behaviour asked for, changed in place. busy: it is chasing or fleeing, so no dawdling.
  M.shape = (c, v, dt, busy) => {
    const mo = c.mo, kind = M.kindOf(c), k = KINDS[kind], t = PI.state.time + c.seed;
    let len = Math.hypot(v.x, v.y);
    if (mo.a == null) mo.a = c.face;
    if (len > .04) { // turn toward the wanted heading at the body's own rate, so paths curve
      let want = Math.atan2(v.y, v.x);
      if (kind === 'weave') want += Math.sin(t * 5) * .55;
      if (kind === 'hover') want += Math.sin(t * 1.3) * .5;
      let d = want - mo.a;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      const most = k.turn * (busy ? 1.7 : 1) * dt;
      mo.a += Math.max(-most, Math.min(most, d));
      mo.still = 0;
    } else mo.still = (mo.still || 0) + dt;
    if (!busy) { // the rhythm of an unhurried walk
      if (kind === 'dart' || kind === 'scurry') {
        mo.t = (mo.t || 0) - dt;
        if (mo.t <= 0) {
          mo.go = !mo.go;
          mo.t = mo.go ? (kind === 'dart' ? .3 + Math.random() * .5 : .6 + Math.random() * .9) : (kind === 'dart' ? .15 + Math.random() * .4 : .2 + Math.random() * .6);
          if (mo.go && kind === 'scurry' && Math.random() < .3) c.sqv += 4; // a little hop into the run
        }
        len *= mo.go ? 1.35 : 0;
      } else if (kind === 'hop') {
        const beat = Math.abs(Math.sin(t * 6.5));
        if (len > .04 && beat < .12 && !mo.hopped) { c.sqv += 3.5; mo.hopped = true; } else if (beat > .5) mo.hopped = false;
        len *= .5 + beat * .9;
      } else if (kind === 'hover' && len < .16) len = .16; // it circles on the spot instead of hanging still
      else if (kind === 'heavy') len *= .9 + Math.sin(t * 1.7) * .1;
    }
    v.x = Math.cos(mo.a) * len; v.y = Math.sin(mo.a) * len;
    // Standing still, it looks around: the body turns an eighth of a circle now and then.
    if (mo.still > 1.2) {
      mo.look = (mo.look || 1.5 + Math.random() * 2.5) - dt;
      if (mo.look <= 0) {
        c.face += (Math.random() < .5 ? 1 : -1) * STEP;
        mo.a = c.face; mo.look = 1.2 + Math.random() * 3;
        if (c.lv < 4 && Math.random() < .35) c.sqv += 3; // small ones also give a start
      }
    }
  };
  // crabs face a quarter turn away from the way they walk
  M.faceOffset = c => (M.kindOf(c) === 'sidle' ? Math.PI / 2 : 0);
})();
