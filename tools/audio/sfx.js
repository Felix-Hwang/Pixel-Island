'use strict';
// The sound effects. Each entry is [seconds, a function that draws the sound into a mix].
const { hz: N, slide, steps, vibrato, wobble, adsr, decay, swell } = require('./synth');

const pulse = (m, t, d, f, o = {}) => m.tone({ wave: 'pulse', t, d, f, ...o });
const tri = (m, t, d, f, o = {}) => m.tone({ wave: 'tri', t, d, f, ...o });
const noise = (m, t, d, f, o = {}) => m.tone({ wave: 'noise', t, d, f, ...o });
const hold = adsr(.005, .04, .8, .05);
// a run of short notes, one after another: [[note, seconds], ...]
function run(m, t, list, o = {}) {
  for (const [note, d] of list) { if (note) pulse(m, t, d * (o.gate || .92), N(note), o); t += d; }
}
// a few high blips that twinkle and fade
function sparkle(m, t, notes, gap, v = .3) {
  notes.forEach((note, k) => pulse(m, t + k * gap, gap * 1.6, N(note), { duty: .125, v: v * (1 - k / notes.length * .7), env: decay(16) }));
}

module.exports = {
  // ---- menus and scene changes
  sfx_ui_click: [.15, m => pulse(m, 0, .1, N('G6'), { duty: .25, v: .5, env: decay(32) })],
  sfx_ui_back: [.2, m => { pulse(m, 0, .08, N('E6'), { duty: .25, env: decay(18) }); pulse(m, .08, .12, N('B5'), { duty: .25, env: decay(18) }); }],
  sfx_ui_select: [.2, m => { pulse(m, 0, .08, N('B5'), { duty: .125, env: decay(16) }); pulse(m, .08, .12, N('E6'), { duty: .125, env: decay(16) }); }],
  sfx_game_start: [1, m => {
    run(m, 0, [['C5', .07], ['E5', .07], ['G5', .07], ['C6', .07]], { duty: .25, v: .5 });
    pulse(m, .28, .68, vibrato(N('G6'), 6.5, .3, .2), { duty: .5, v: .5, env: adsr(.005, .1, .7, .3) });
    pulse(m, .28, .68, N('C6'), { duty: .125, v: .3, env: adsr(.005, .1, .7, .3) });
    pulse(m, .4, .5, N('G6'), { duty: .5, v: .14, env: decay(4) });
    tri(m, 0, .28, N('C4'), { v: .6, env: hold }); tri(m, .28, .6, N('C3'), { v: .7, env: adsr(.005, .1, .7, .3) });
  }],
  sfx_transition: [.8, m => noise(m, 0, .8, t => t < .4 ? 9000 * Math.pow(1200 / 9000, t / .4) : 1200 * Math.pow(9000 / 1200, (t - .4) / .4), { v: .5, env: swell(.5) })],
  sfx_spawn: [1.2, m => {
    pulse(m, 0, .85, wobble(slide(320, 2300, .8), 28, 3.5), { duty: .125, v: .4, env: swell(.75) });
    tri(m, 0, .85, slide(160, 640, .8), { v: .6, env: swell(.7) });
    sparkle(m, .82, ['C7', 'G7', 'E7', 'C8'], .07, .45);
  }],

  // ---- the core of play
  sfx_eat_berry: [.3, m => {
    tri(m, 0, .08, slide(280, 1000, .055), { v: .9, env: decay(14) });
    pulse(m, .075, .2, N('A6'), { duty: .125, v: .4, env: decay(16) });
  }],
  sfx_eat_creature: [.5, m => {
    noise(m, 0, .12, slide(6500, 900, .12), { v: .7, env: decay(16) });
    tri(m, 0, .16, slide(230, 52, .13), { v: 1, env: decay(10) });
    noise(m, .1, .07, 2800, { v: .5, env: decay(30) });
    pulse(m, .2, .085, N('G5'), { duty: .25, v: .45, env: hold });
    pulse(m, .29, .2, N('D6'), { duty: .25, v: .45, env: decay(9) });
  }],
  sfx_food_bonus: [.4, m => { pulse(m, 0, .07, N('B5'), { v: .45, env: hold }); pulse(m, .07, .33, N('E6'), { v: .45, env: decay(8) }); pulse(m, .07, .33, N('E7'), { duty: .125, v: .12, env: decay(12) }); }],
  sfx_evolve: [2, m => {
    const up = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'].map(N);
    pulse(m, 0, .6, steps(up, .06), { duty: .25, v: .45, env: swell(.9) });
    pulse(m, .03, .57, steps(up.map(f => f * 1.5), .06), { duty: .125, v: .2, env: swell(.9) });
    tri(m, 0, .6, slide(110, 880, .6), { v: .7, env: swell(.9) });
    noise(m, .6, .3, slide(13000, 2500, .3), { v: .55, env: decay(9) });
    for (const [note, duty, v] of [['C6', .5, .35], ['E6', .25, .3], ['G6', .125, .3]]) pulse(m, .6, .75, vibrato(N(note), 6, .25, .15), { duty, v, env: adsr(.005, .15, .6, .5) });
    tri(m, .6, .75, N('C4'), { v: .7, env: adsr(.005, .15, .6, .5) });
    sparkle(m, 1.02, ['G7', 'E7', 'C8', 'G7', 'C7', 'E7', 'G7', 'C8', 'E7', 'G7'], .09, .4);
  }],
  sfx_guard_burst: [.5, m => {
    noise(m, 0, .34, slide(8500, 600, .3), { v: .7, env: decay(9) });
    pulse(m, 0, .38, slide(520, 66, .3), { v: .55, env: decay(8) });
    tri(m, 0, .2, slide(180, 50, .18), { v: .8, env: decay(10) });
  }],
  sfx_alert: [.4, m => {
    pulse(m, 0, .08, N('F6'), { duty: .25, v: .5, env: hold });
    pulse(m, .1, .28, vibrato(N('B6'), 14, .35, .06), { duty: .25, v: .5, env: adsr(.004, .05, .8, .12) });
    tri(m, 0, .08, N('F5'), { v: .5, env: hold }); tri(m, .1, .2, N('B5'), { v: .5, env: decay(8) });
  }],
  sfx_chase_end: [.5, m => {
    let t = 0;
    for (const [note, d] of [['G5', .12], ['E5', .12], ['C5', .25]]) { pulse(m, t, d, slide(N(note), N(note) * .94, d), { v: .4, env: adsr(.01, .04, .7, .08) }); tri(m, t, d, N(note) / 2, { v: .4, env: adsr(.01, .04, .7, .08) }); t += d; }
  }],
  sfx_bump_edge: [.25, m => pulse(m, 0, .23, vibrato(t => 170 * Math.pow(2, Math.sin(Math.min(1, t / .2) * Math.PI) * 1.3), 30, 1.2), { duty: .25, v: .5, env: decay(7) })],
  sfx_push: [.15, m => { tri(m, 0, .11, slide(150, 68, .08), { v: .9, env: decay(22) }); noise(m, 0, .03, 1500, { v: .25, env: decay(60) }); }],
  sfx_death: [1, m => {
    noise(m, 0, .2, slide(5500, 500, .18), { v: .8, env: decay(11) });
    tri(m, 0, .2, slide(200, 45, .16), { v: 1, env: decay(9) });
    pulse(m, .16, .8, vibrato(slide(660, 82, .75), 9, .6, .1), { v: .5, env: adsr(.01, .1, .75, .4) });
    tri(m, .16, .8, slide(330, 41, .75), { v: .5, env: adsr(.01, .1, .75, .4) });
  }],
  sfx_gameover: [2.5, m => {
    let t = 0;
    for (const [note, d] of [['E5', .35], ['D5', .35], ['C5', .35], ['B4', .35]]) { pulse(m, t, d * .9, N(note), { duty: .25, v: .45, env: adsr(.01, .08, .7, .08) }); t += d; }
    pulse(m, 1.4, 1.05, vibrato(N('A4'), 5, .3, .3), { duty: .25, v: .45, env: adsr(.01, .1, .7, .6) });
    for (const [note, at, d] of [['A3', 0, .7], ['F3', .7, .35], ['E3', 1.05, .35], ['A2', 1.4, 1.05]]) tri(m, at, d * .96, N(note), { v: .6, env: adsr(.01, .08, .8, d > 1 ? .6 : .06) });
    pulse(m, 1.4, 1.05, N('E4'), { duty: .125, v: .2, env: adsr(.01, .1, .7, .6) });
  }],
  sfx_apex_start: [1.5, m => {
    const chord = (t, d, notes, bass, last) => {
      notes.forEach((note, k) => pulse(m, t, d, last ? vibrato(N(note), 6, .25, .2) : N(note), { duty: [.5, .25, .125][k % 3], v: .3, env: last ? adsr(.005, .12, .7, .35) : hold }));
      tri(m, t, d, N(bass), { v: .65, env: last ? adsr(.005, .12, .8, .35) : hold });
    };
    chord(0, .22, ['C5', 'E5', 'G5'], 'C3'); chord(.25, .22, ['F5', 'A5', 'C6'], 'F3'); chord(.5, .22, ['G5', 'B5', 'D6'], 'G3');
    chord(.78, .7, ['C6', 'E6', 'G6', 'C7'], 'C3', true);
    noise(m, .78, .3, slide(11000, 3000, .3), { v: .4, env: decay(10) });
  }],
  sfx_countdown_tick: [.15, m => pulse(m, 0, .08, N('A5'), { v: .5, env: decay(22) })],
  sfx_finale_pop: [.3, m => {
    pulse(m, 0, .06, slide(480, 1500, .05), { duty: .25, v: .5, env: decay(18) });
    noise(m, 0, .05, 7500, { v: .35, env: decay(40) });
    sparkle(m, .07, ['E7', 'G7', 'C8'], .06, .35);
  }],
  sfx_ascend: [2.8, m => {
    const whirl = base => t => { const u = Math.min(1, t / 2.5); return base * Math.pow(2, 3.4 * Math.pow(u, 1.4) + Math.sin(2 * Math.PI * (4 * t + 5 * t * t)) * .22); };
    pulse(m, 0, 2.5, whirl(190), { duty: .25, v: .45, env: (t, len) => (.45 + .55 * t / len) * (.75 + .25 * Math.sin(2 * Math.PI * (4 * t + 5 * t * t))) });
    tri(m, 0, 2.5, whirl(95), { v: .6, env: (t, len) => .5 + .5 * t / len });
    noise(m, 1.2, 1.3, slide(2500, 12000, 1.3), { v: .2, env: swell(.95) });
    noise(m, 2.45, .35, slide(14000, 4500, .3), { v: .7, env: decay(6) });
    for (const [note, duty] of [['C7', .5], ['E7', .25], ['G7', .125]]) pulse(m, 2.45, .35, N(note), { duty, v: .25, env: decay(7) });
  }],
  sfx_victory: [2.8, m => {
    const tune = [['G5', 0, .14], ['C6', .15, .14], ['E6', .3, .14], ['G6', .45, .4], ['E6', .9, .14], ['G6', 1.05, .14]];
    const under = [['E5', 0, .14], ['G5', .15, .14], ['C6', .3, .14], ['E6', .45, .4], ['C6', .9, .14], ['E6', 1.05, .14]];
    for (const [note, t, d] of tune) pulse(m, t, d, N(note), { v: .42, env: hold });
    for (const [note, t, d] of under) pulse(m, t, d, N(note), { duty: .125, v: .25, env: hold });
    pulse(m, 1.2, 1.5, vibrato(N('C7'), 6, .25, .3), { v: .42, env: adsr(.005, .15, .7, .7) });
    pulse(m, 1.2, 1.5, N('G6'), { duty: .25, v: .25, env: adsr(.005, .15, .7, .7) });
    pulse(m, 1.2, 1.5, N('E6'), { duty: .125, v: .25, env: adsr(.005, .15, .7, .7) });
    for (const [note, t, d] of [['C3', 0, .43], ['C3', .45, .42], ['G3', .9, .28], ['C3', 1.2, 1.5]]) tri(m, t, d, N(note), { v: .65, env: adsr(.005, .05, .8, d > 1 ? .7 : .05) });
    noise(m, 1.2, .35, slide(11000, 3500, .3), { v: .35, env: decay(9) });
    sparkle(m, 1.65, ['G7', 'E7', 'C8', 'G7', 'C7', 'E7', 'G7', 'C8'], .12, .25);
  }],

  // ---- status effects
  sfx_status_stun: [.6, m => {
    pulse(m, 0, .56, vibrato(slide(760, 520, .55), 11, 3), { duty: .25, v: .45, env: adsr(.01, .05, .8, .25) });
    pulse(m, .04, .5, vibrato(slide(1140, 780, .5), 11, 3), { duty: .125, v: .2, env: adsr(.01, .05, .8, .25) });
  }],
  sfx_status_fast: [.5, m => {
    pulse(m, 0, .3, slide(300, 1900, .28), { duty: .25, v: .45, env: adsr(.005, .05, .8, .05) });
    noise(m, 0, .28, slide(2500, 11000, .28), { v: .2, env: swell(.8) });
    pulse(m, .3, .19, N('E7'), { duty: .125, v: .4, env: decay(13) });
  }],
  sfx_status_slow: [.5, m => {
    pulse(m, 0, .48, vibrato(slide(540, 105, .45), 7, .7), { v: .45, env: adsr(.01, .1, .75, .2) });
    tri(m, 0, .48, slide(270, 52, .45), { v: .5, env: adsr(.01, .1, .75, .2) });
  }],
  sfx_status_hidden: [.4, m => { tri(m, 0, .34, slide(720, 250, .26), { v: .8, env: decay(8) }); noise(m, 0, .22, 1200, { v: .1, env: decay(12) }); }],
  sfx_status_safe: [.5, m => {
    pulse(m, 0, .2, N('E6'), { duty: .125, v: .4, env: decay(10) }); tri(m, 0, .2, N('E5'), { v: .5, env: decay(10) });
    pulse(m, .12, .38, vibrato(N('B6'), 18, .25), { duty: .125, v: .4, env: decay(6) }); tri(m, .12, .38, N('B5'), { v: .5, env: decay(7) });
  }],
  sfx_status_blind: [.6, m => { tri(m, 0, .45, slide(340, 170, .42), { v: .8, env: decay(5) }); noise(m, .12, .48, 3200, { v: .22, env: swell(.3) }); }],
  sfx_status_end: [.3, m => { pulse(m, 0, .1, N('D6'), { duty: .125, v: .35, env: decay(14) }); pulse(m, .11, .18, N('A5'), { duty: .125, v: .35, env: decay(11) }); }],

  // ---- terrain: shared, then beach, market, islands, swamp, mountain
  sfx_splash: [.3, m => { noise(m, 0, .29, slide(9500, 2500, .25), { v: .55, env: decay(11) }); tri(m, 0, .07, slide(900, 280, .06), { v: .5, env: decay(20) }); }],
  sfx_wave: [2, m => {
    const arc = t => Math.pow(Math.sin(Math.PI * Math.min(1, t / 2)), 1.4);
    noise(m, 0, 2, t => 1100 + 6000 * arc(t), { v: .55, env: t => arc(t) });
    noise(m, .7, 1.2, 14000, { v: .12, env: swell(.3) });
  }],
  sfx_coconut_drop: [.8, m => {
    pulse(m, 0, .55, slide(1900, 520, .55), { v: .35, env: adsr(.02, .05, .9, .04) });
    tri(m, .56, .22, slide(430, 150, .1), { v: 1, env: decay(13) });
    pulse(m, .56, .06, 300, { v: .3, env: decay(40) });
    noise(m, .56, .04, 2600, { v: .35, env: decay(50) });
  }],
  sfx_drink: [.7, m => {
    tri(m, 0, .13, slide(290, 640, .1), { v: .9, env: decay(8) }); tri(m, .17, .13, slide(270, 610, .1), { v: .9, env: decay(8) });
    pulse(m, .38, .09, N('G5'), { duty: .25, v: .4, env: hold }); pulse(m, .48, .22, N('E6'), { duty: .25, v: .4, env: decay(8) });
  }],
  sfx_food_stall: [.6, m => {
    noise(m, 0, .36, 11500, { v: .3, env: (t, len) => (.55 + .45 * Math.sin(t * 95)) * Math.min(1, (len - t) / .1) });
    pulse(m, .36, .24, N('A6'), { duty: .125, v: .42, env: decay(9) }); tri(m, .36, .24, N('A5'), { v: .5, env: decay(10) });
  }],
  sfx_handcart_hit: [.5, m => {
    tri(m, 0, .2, slide(170, 48, .16), { v: 1, env: decay(11) });
    [[0, 900, .7], [.06, 1400, .55], [.13, 700, .5], [.2, 1100, .4], [.28, 800, .3], [.36, 1000, .2]].forEach(([t, f, v]) => noise(m, t, .07, f, { metal: true, v, env: decay(24) }));
    pulse(m, 0, .03, 220, { v: .35, env: decay(50) }); pulse(m, .09, .03, 175, { v: .3, env: decay(50) }); pulse(m, .22, .03, 200, { v: .2, env: decay(50) });
  }],
  sfx_awning_bounce: [.4, m => pulse(m, 0, .38, vibrato(slide(180, 760, .3), 30, 1.1), { duty: .25, v: .5, env: decay(5) })],
  sfx_hawker: [.6, m => {
    pulse(m, 0, .14, slide(330, 520, .1), { duty: .25, v: .45, env: adsr(.01, .03, .8, .03) });
    pulse(m, .15, .2, vibrato(slide(610, 420, .18), 12, .4), { duty: .25, v: .45, env: adsr(.01, .03, .8, .06) });
    sparkle(m, .38, ['E7', 'G7', 'E7'], .07, .4);
  }],
  sfx_clam: [.6, m => {
    pulse(m, 0, .34, N('G6'), { duty: .125, v: .4, env: decay(8) }); pulse(m, .05, .32, N('D7'), { duty: .125, v: .35, env: decay(8) });
    noise(m, .4, .05, 3000, { metal: true, v: .55, env: decay(45) });
    pulse(m, .4, .05, 240, { v: .5, env: decay(40) }); tri(m, .4, .09, slide(310, 120, .06), { v: .8, env: decay(20) });
  }],
  sfx_jellyfish_zap: [.5, m => {
    pulse(m, 0, .46, wobble(slide(950, 480, .45), 45, 4), { duty: .125, v: .45, env: adsr(.004, .05, .8, .12) });
    noise(m, 0, .46, 5200, { metal: true, v: .25, env: decay(5) });
  }],
  sfx_boat_ride: [1.5, m => {
    for (const [t, d] of [[0, .28], [.36, .46]]) {
      pulse(m, t, d, vibrato(N('F4'), 6, .15), { v: .4, env: adsr(.02, .04, .85, .06) });
      pulse(m, t, d, vibrato(N('C5'), 6, .15), { duty: .25, v: .3, env: adsr(.02, .04, .85, .06) });
      tri(m, t, d, N('F3'), { v: .5, env: adsr(.02, .04, .85, .06) });
    }
    noise(m, .86, .62, t => 2500 + 4500 * Math.sin(Math.PI * t / .62), { v: .35, env: swell(.4) });
  }],
  sfx_tide_change: [1.5, m => {
    noise(m, 0, 1.5, t => 1800 + 4000 * Math.sin(Math.PI * t / 1.5), { v: .5, env: swell(.5) });
    tri(m, 0, 1.5, t => 180 * Math.pow(2, Math.sin(Math.PI * t / 1.5) * .6), { v: .45, env: swell(.5) });
  }],
  sfx_firefly: [.25, m => { pulse(m, 0, .04, N('B6'), { duty: .125, v: .4, env: hold }); pulse(m, .04, .21, N('E7'), { duty: .125, v: .42, env: decay(13) }); }],
  sfx_light_grow: [1, m => {
    tri(m, 0, .97, slide(220, 660, .8), { v: .8, env: swell(.6) });
    pulse(m, .15, .82, vibrato(slide(880, 1760, .6), 14, .35), { duty: .125, v: .25, env: swell(.6) });
  }],
  sfx_mud: [.5, m => {
    noise(m, 0, .42, wobble(slide(1700, 300, .36), 20, 6), { v: .55, env: decay(6) });
    tri(m, 0, .38, slide(240, 66, .3), { v: .8, env: decay(6) });
  }],
  sfx_bridge_break: [.9, m => {
    pulse(m, 0, .3, wobble(slide(110, 175, .3), 36, 2), { duty: .125, v: .4, env: adsr(.02, .05, .8, .05) });
    noise(m, .32, .08, 6000, { metal: true, v: .8, env: decay(32) });
    pulse(m, .32, .06, slide(520, 140, .05), { v: .5, env: decay(30) });
    noise(m, .46, .43, slide(9500, 1500, .4), { v: .6, env: decay(7) });
    tri(m, .46, .1, slide(700, 200, .08), { v: .6, env: decay(16) });
  }],
  sfx_slip: [.4, m => pulse(m, 0, .37, vibrato(slide(1500, 400, .34), 9, .3), { v: .4, env: adsr(.02, .05, .9, .09) })],
  sfx_cloud_ride: [.5, m => {
    noise(m, 0, .36, slide(3000, 7500, .3), { v: .28, env: swell(.25) });
    tri(m, .05, .43, slide(N('C6'), N('G6'), .3), { v: .7, env: swell(.4) });
  }],
  sfx_flag: [.9, m => {
    run(m, 0, [['C6', .1], ['E6', .1], ['G6', .1]], { v: .42 }); run(m, 0, [['G5', .1], ['C6', .1], ['E6', .1]], { duty: .125, v: .25 });
    pulse(m, .3, .58, vibrato(N('C7'), 6.5, .25, .15), { v: .42, env: adsr(.005, .1, .7, .3) });
    pulse(m, .3, .58, N('G6'), { duty: .125, v: .25, env: adsr(.005, .1, .7, .3) });
    tri(m, 0, .28, N('C4'), { v: .6, env: hold }); tri(m, .3, .58, N('C4'), { v: .65, env: adsr(.005, .1, .8, .3) });
  }],
};
