'use strict';
// Turns a species into capsules. A body template (src/creatures/bodies) describes the animal in its own
// frame: [forward, left, up], in units of the creature size. This file handles facing, gait, materials and drawing:
// eight facings, a stepped walk cycle, a faster longer-striding run cycle, wing beats and tail sway.
// Parts name a material (see palette.js): nothing or false = body, true or 'dark', 'light', 'bone', 'ink'.
(() => {
  const G = PI.gfx, TAU = Math.PI * 2, STEP = Math.PI / 4;
  const MIN_R = .085;                 // thinner parts collapse into a 1px dot
  const FRAMES = 4;                   // poses per gait cycle
  const FLAP = [1, .15, -.9, .15];    // wing poses per beat
  const INK = G.pack(26, 24, 38), WHITE = G.pack(255, 255, 255);
  const frac = v => v - Math.floor(v);
  let k = 1, px = 0, py = 0, cy = 1, sy = 0, lean = 0, bob = 0, baseZ = 0, mats = null, ramps = null, shadow = true, dim = false;
  const R = { s: null, t: 0, gait: { phase: 0, run: 0, moving: false, q: 0 }, flap: 0 };

  const rampOf = m => {
    const key = m === true ? 'dark' : m || 'body';
    return ramps[key] || (ramps[key] = G.ramp(mats[key] || mats.body));
  };
  function world(l) {
    const f = (l[0] + (l[2] - .3) * lean) * k, s = l[1] * k, u = (l[2] + bob) * k + baseZ;
    return [px + f * cy - s * sy, py + f * sy + s * cy, u < 0 ? 0 : u];
  }
  function planted(l) { // feet stay on the ground, so they get no bob and no lean
    const f = l[0] * k, s = l[1] * k;
    return [px + f * cy - s * sy, py + f * sy + s * cy, Math.max(0, l[2] * k) + baseZ];
  }
  function seg(a, b, ra, rb, mat) {
    ra = Math.max(ra * k, MIN_R); rb = Math.max(rb * k, MIN_R);
    G.capsule(a[0], a[1], a[2], b[0], b[1], b[2], ra, rb, rampOf(mat), G.STYLE.FLAT, G.KIND.BODY);
    if (shadow) G.shadowCapsule(a[0], a[1], a[2], b[0], b[1], b[2], ra, rb);
  }
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  R.bone = (a, b, ra, rb = ra, mat = false) => seg(world(a), world(b), ra, rb, mat);
  R.ball = (p, r, mat = false) => { const w = world(p); seg(w, w, r, r, mat); };
  R.chain = (points, r0, r1, mat = false) => {
    for (let i = 1; i < points.length; i++) {
      const a = (i - 1) / (points.length - 1), b = i / (points.length - 1);
      R.bone(points[i - 1], points[i], r0 + (r1 - r0) * a, r0 + (r1 - r0) * b, mat);
    }
  };
  // one limb or body part in n bands that alternate between two materials: stripes, rings, segments
  R.banded = (a, b, ra, rb, matA, matB, n) => {
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      R.bone(mix(a, b, t0), mix(a, b, t1), ra + (rb - ra) * t0, ra + (rb - ra) * t1, i % 2 ? matB : matA);
    }
  };
  // a body part with a paler underside: the lower third of the capsule is painted in the light material
  R.belly = (a, b, ra, rb = ra) => {
    G.under = rampOf('light');
    seg(world(a), world(b), ra, rb, false);
    G.under = null;
  };
  // hip: [f, s, u]. foot: [f, s] where the foot rests. o.ph / o.phRun: where in the cycle this leg steps.
  // o.mat: the leg's material (dark by default). o.foot: material of a paw, hoof or claw at its end.
  R.leg = (hip, foot, o = {}) => {
    const g = R.gait, r = o.r || .08, mat = o.mat === undefined ? 'dark' : o.mat;
    let df = 0, lift = 0;
    if (g.moving) {
      const p = frac(g.phase + (g.run && o.phRun != null ? o.phRun : o.ph || 0));
      const reach = (o.stride == null ? .16 : o.stride) * (g.run ? 1.8 : 1);
      if (p < .5) df = reach * (1 - p * 4);                       // planted, sliding back under the body
      else { df = reach * ((p - .5) * 4 - 1); lift = Math.sin((p - .5) * TAU) * (g.run ? .22 : .1) * (o.lift == null ? 1 : o.lift); }
    }
    const top = world(hip), end = planted([foot[0] + df, foot[1], lift]);
    if (o.knee) {
      const knee = world([(hip[0] + foot[0] + df) / 2 + o.knee[0], (hip[1] + foot[1]) / 2 + o.knee[1], hip[2] / 2 + lift / 2 + o.knee[2]]);
      seg(top, knee, o.r0 || r * 1.3, r, mat);
      seg(knee, end, r, o.r1 || r * .9, o.sock || mat);
    } else if (o.sock) { // a differently coloured lower leg
      const mid = [(top[0] + end[0]) / 2, (top[1] + end[1]) / 2, (top[2] + end[2]) / 2];
      seg(top, mid, o.r0 || r * 1.2, r * 1.1, mat);
      seg(mid, end, r * 1.1, o.r1 || r, o.sock);
    } else seg(top, end, o.r0 || r * 1.2, o.r1 || r, mat);
    if (o.foot) { // the foot points the way the animal faces
      const fr = (o.footR || r * 1.15) * k, toe = [end[0] + cy * fr * .9, end[1] + sy * fr * .9, Math.max(fr * .7, end[2])];
      G.capsule(end[0], end[1], Math.max(fr * .7, end[2]), toe[0], toe[1], toe[2], Math.max(fr, MIN_R), Math.max(fr * .8, MIN_R), rampOf(o.foot), G.STYLE.FLAT, G.KIND.BODY);
    }
    return end;
  };
  // a wing from root out to the side; it beats up and down with R.flap.
  // o.chord > 0 fills a membrane behind the leading edge with a fan of thin ribs (o.web: their material).
  R.wing = (root, span, side, o = {}) => {
    const a = (o.rest == null ? .15 : o.rest) + R.flap * (o.amp == null ? .7 : o.amp), mat = o.mat === undefined ? 'dark' : o.mat;
    const reach = span * Math.cos(a), rise = span * Math.sin(a), sweep = (o.sweep || 0) * span;
    const mid = [root[0] + sweep * .4, root[1] + side * reach * .55, root[2] + rise * .7];
    const tip = [root[0] + sweep, root[1] + side * reach, root[2] + rise];
    if (o.chord) {
      const back = [root[0] - o.chord, root[1] + side * reach * .1, root[2]], web = o.web === undefined ? mat : o.web;
      const n = G.clamp(Math.ceil(Math.hypot(tip[0] - back[0], tip[1] - back[1], tip[2] - back[2]) * k * 5.5), 2, 10);
      for (let j = 1; j <= n; j++) {
        const t = j / (n + .5);
        R.bone(root, mix(tip, back, t), o.r || .09, o.r1 || .05, web);
      }
    }
    R.bone(root, mid, o.r0 || .12, o.r || .09, mat);
    R.bone(mid, tip, o.r || .09, o.r1 || .05, mat);
    return { tip, mid };
  };
  // travelling wave for tails, necks and anything that slithers; off shifts it along the body
  R.wave = off => R.gait.moving ? Math.sin(R.gait.phase * TAU - off) : Math.sin(Math.floor(R.t * 4) / 4 * 1.7 - off) * .4;
  // o.rings: a material for every second segment (ringed tails). Returns the tip.
  R.tail = (root, len, r0, r1, o = {}) => {
    const n = o.n || 4;
    let p = root;
    for (let i = 1; i <= n; i++) {
      const t = i / n, side = R.wave(i * .9) * (o.sway == null ? .07 : o.sway) * t * (R.gait.run ? 1.5 : 1);
      const q = [root[0] - len * t, root[1] + side + (o.curl || 0) * t * t * len, root[2] + (o.rise || 0) * len * t + (o.droop || 0) * len * t * t];
      R.bone(p, q, r0 + (r1 - r0) * (i - 1) / n, r0 + (r1 - r0) * t, o.rings && i % 2 === 0 ? o.rings : o.mat);
      p = q;
    }
    return p;
  };
  // Eyes, only where the head surface is actually visible. A big enough head gets a white of the eye with the
  // pupil on the side the animal is facing; a small head gets a single dark pixel.
  R.eyes = (head, r) => {
    const big = r * k * G.U >= 2.3, ahead = cy > .35 ? 1 : cy < -.35 ? -1 : 0;
    for (const side of [1, -1]) {
      const w = world([head[0] + r * .5, head[1] + side * r * .72, head[2] + r * .3]);
      const i = G.index(w[0], w[1], w[2]);
      if (i < 0 || G.kind[i] !== G.KIND.BODY || G.dep[i] - G.depthOf(w[1], w[2]) > Math.max(.06, r * k * .6)) continue;
      if (big && !dim) {
        const j = i - ahead; // the white sits behind the pupil
        if (ahead && G.kind[j] === G.KIND.BODY) G.col[j] = WHITE; else if (!ahead && G.kind[i - G.W] === G.KIND.BODY) G.col[i - G.W] = WHITE;
      }
      G.col[i] = INK;
    }
  };
  // true when the animal faces more toward the viewer than away: lets a template add face detail only when it shows
  R.front = () => sy > -.3;

  const B = PI.builder = {};
  B.radius = c => c.k * G.clamp((c.sp.sil.len || c.sp.sil.wing || 1) * .34, .3, .62);
  // advance the animation state of one creature. ratio: current speed / its own top speed.
  B.tick = (c, dt, vx, vy, ratio) => {
    const tmpl = PI.bodies[c.sp.body];
    c.gaitQ += (ratio - c.gaitQ) * Math.min(1, dt * 12);
    c.moving = c.gaitQ > .08;
    if (!c.running && c.gaitQ > .7) c.running = true; else if (c.running && c.gaitQ < .55) c.running = false;
    if (c.moving) {
      const cadence = (c.running ? 3.1 : 2) * (tmpl.cadence || 1); // cycles per second: 8 fps walking, 12 fps running
      c.gaitPhase = frac(c.gaitPhase + dt * cadence);
      const want = Math.atan2(vy, vx);
      let diff = want - c.face;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) > STEP * .62) c.face = Math.round(want / STEP) * STEP; // snap to one of eight facings
    }
    if (c.pop > 0) c.pop = Math.max(0, c.pop - dt * 3);
  };
  // c: { x, y, face, k, sp, color, gaitPhase, gaitQ, moving, running, pop }. opt.dim draws a dark silhouette.
  B.draw = (c, time, opt = {}) => {
    const tmpl = PI.bodies[c.sp.body], g = R.gait, s = c.sp.sil, pal = PI.palette;
    k = c.k * (1 + (c.pop || 0) * .3);
    // Draw at whole pixels. A body drawn at fractional positions changes shape from frame to frame as it moves.
    px = Math.round(c.x * G.U) / G.U; py = Math.round(c.y * G.U * G.SIN) / (G.U * G.SIN);
    cy = Math.cos(c.face); sy = Math.sin(c.face);
    dim = !!opt.dim;
    mats = dim ? pal.dim : pal.mats[c.color];
    ramps = mats.ramps || (mats.ramps = {});
    shadow = opt.shadow !== false;
    g.moving = !!c.moving; g.run = c.running ? 1 : 0; g.q = c.gaitQ || 0;
    g.phase = (Math.floor((c.gaitPhase || 0) * FRAMES) + .5) / FRAMES;
    const beat = Math.abs(Math.sin(g.phase * TAU));
    bob = !g.moving ? 0 : g.run ? beat * .1 * (tmpl.bounce == null ? 1 : tmpl.bounce) : beat * .03;
    lean = g.moving && g.run ? (tmpl.lean == null ? .12 : tmpl.lean) : 0;
    const hover = s.hover || 0, seed = c.seed || 0;
    baseZ = hover ? (hover + Math.round(Math.sin(Math.floor(time * 6) / 6 * 2.2 + seed) * 2) * .03) * k : 0;
    const rate = !hover && !g.moving ? 0 : g.run ? 6 : g.moving ? 4.2 : 2.6; // wing beats per second
    R.flap = rate ? FLAP[Math.floor(time * rate * FLAP.length + seed) & 3] : .15;
    R.s = s; R.t = time;
    tmpl.build(R);
    if (shadow && !hover) G.shadowBlob(px, py, 0, B.radius(c) * .7, 2); // contact shadow under the body
  };
  // how far above the ground the top of the creature is, for placing the stars
  B.headHeight = c => {
    const s = c.sp.sil, tmpl = PI.bodies[c.sp.body];
    return c.k * ((s.hover || 0) + (tmpl.height ? tmpl.height(s) : (s.h || .4) + .35));
  };
})();
