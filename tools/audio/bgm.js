'use strict';
// The background music: a small step sequencer and nine tracks written for it.
// A bar is a string of tokens 'NOTE:STEPS'. In a tune the note is a name such as E5; in a part that follows the
// chords it is R (root), T (third), F (fifth), O (root an octave up) or a number counting up the chord tones.
// '-' is a rest. Every bar must add up to the steps of a bar, which is checked.
const { hz, shift, slide, vibrato, adsr, decay, swell, Mix } = require('./synth');

const TAIL = 1.5; // room after the end for notes that ring on; in a loop it is folded back onto the start
const QUALITY = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus4: [0, 5, 7], dim: [0, 3, 6] };
const rep = (x, n) => Array(n).fill(x);

function parseBar(text, steps, where) {
  let at = 0;
  const out = text.trim().split(/\s+/).map(tok => {
    const [name, len = '1'] = tok.split(':'), o = { name, start: at, len: Number(len) };
    at += o.len;
    return o;
  });
  if (at !== steps) throw new Error(`${where}: the bar adds up to ${at} steps, not ${steps}: "${text}"`);
  return out.filter(o => o.name !== '-');
}
function chordAt(track, bar, step) {
  const parts = track.chords[bar].split(' '), name = parts[Math.floor(step / (track.steps / parts.length))];
  const m = /^([A-G][#b]?)(m7|maj7|m|7|sus4|dim)?$/.exec(name);
  if (!m) throw new Error('Bad chord: ' + name);
  return { root: m[1], tones: QUALITY[m[2] || ''] };
}
// the pitch of a chord token; the root is the lowest one at or above the part's floor note
function chordPitch(chord, token, floor) {
  let root = hz(chord.root + '0');
  while (root < hz(floor) * .999) root *= 2;
  const t = chord.tones, named = { R: 0, T: t[1], F: t[2], O: 12, S: t[3] || 10 };
  if (token in named) return shift(root, named[token]);
  const n = Number(token);
  return shift(root, t[n % t.length] + 12 * Math.floor(n / t.length));
}
function play(mix, inst, t, len, f) {
  const d = Math.max(.03, inst.ring || len * (inst.gate || .9));
  const pitch = inst.vib && d > inst.vib.delay + .08 ? vibrato(f, inst.vib.rate, inst.vib.semis, inst.vib.delay) : f;
  const base = { wave: inst.wave || 'pulse', duty: inst.duty, d, f: pitch, env: inst.env };
  mix.tone({ ...base, t, v: inst.v, pan: inst.pan || 0 });
  if (inst.echo) mix.tone({ ...base, t: t + inst.echo.after, v: inst.v * inst.echo.v, pan: inst.echo.pan || 0 });
}
const DRUMS = {
  k: (m, t, v) => { m.tone({ wave: 'tri', t, d: .12, f: slide(175, 45, .09), v: .95 * v, env: decay(20) }); m.tone({ wave: 'noise', t, d: .012, f: 4000, v: .25 * v }); },
  s: (m, t, v) => { m.tone({ wave: 'noise', t, d: .12, f: 5200, v: .5 * v, env: decay(26) }); m.tone({ wave: 'tri', t, d: .05, f: slide(270, 180, .04), v: .4 * v, env: decay(40) }); },
  S: (m, t, v) => DRUMS.s(m, t, v * 1.35),
  h: (m, t, v) => m.tone({ wave: 'noise', t, d: .03, f: 14000, v: .26 * v, env: decay(90), pan: .25 }),
  o: (m, t, v) => m.tone({ wave: 'noise', t, d: .13, f: 13000, v: .24 * v, env: decay(20), pan: .25 }),
  c: (m, t, v) => m.tone({ wave: 'noise', t, d: .7, f: 9500, v: .42 * v, env: decay(5) }),
  t: (m, t, v) => m.tone({ wave: 'noise', t, d: .022, f: 16000, metal: true, v: .16 * v, pan: -.4 }),
};

function render(track) {
  const seconds = track.seconds || 30, loop = track.loop !== false, bars = track.chords.length;
  const stepDur = seconds / (bars * track.steps);
  const mix = new Mix(seconds + (loop ? TAIL : 0), true);
  for (const [n, voice] of track.voices.entries()) {
    for (let b = 0; b < bars; b++) {
      let src = Array.isArray(voice.bars) ? voice.bars[b] : voice.bars, up = voice.up || 0;
      if (!src) continue;
      if (typeof src === 'object') { up += src.up || 0; src = src.bar; }
      const where = `${track.name} voice ${n} bar ${b + 1}`, t0 = b * track.steps * stepDur;
      if (voice.kind === 'drums') {
        if (src.length !== track.steps) throw new Error(`${where}: ${src.length} drum steps, not ${track.steps}`);
        [...src].forEach((ch, k) => { if (ch !== '.') DRUMS[ch](mix, t0 + k * stepDur, voice.v || 1); });
        continue;
      }
      for (const tok of parseBar(src, track.steps, where)) {
        const f = voice.kind === 'tune' ? hz(tok.name) : chordPitch(chordAt(track, b, tok.start), tok.name, voice.floor);
        play(mix, voice.inst, t0 + tok.start * stepDur, tok.len * stepDur, shift(f, up));
      }
    }
  }
  if (track.extra) track.extra(mix, stepDur * track.steps);
  if (!loop) {
    const fade = Math.round(.03 * mix.n / mix.seconds);
    for (let i = 0; i < fade; i++) { const k = i / fade; mix.L[mix.n - 1 - i] *= k; mix.R[mix.n - 1 - i] *= k; }
    return mix;
  }
  const out = new Mix(seconds, true);
  out.L.set(mix.L.subarray(0, out.n)); out.R.set(mix.R.subarray(0, out.n));
  for (let i = out.n; i < mix.n; i++) { out.L[i - out.n] += mix.L[i]; out.R[i - out.n] += mix.R[i]; }
  return out;
}

// ---- instruments
const echo = (after, v = .3, pan = .5) => ({ after, v, pan });
const lead = (o = {}) => ({ duty: .5, v: .3, gate: .92, env: adsr(.005, .06, .75, .04), vib: { rate: 6, semis: .22, delay: .2 }, ...o });
const stab = (o = {}) => ({ duty: .25, v: .3, gate: .55, env: adsr(.003, .05, .65, .03), ...o });
const pluck = (o = {}) => ({ duty: .25, v: .3, gate: 1, env: decay(7), ...o });
const soft = (o = {}) => ({ duty: .25, v: .26, gate: .96, env: adsr(.02, .1, .7, .1), vib: { rate: 5, semis: .2, delay: .3 }, ...o });
const chime = (o = {}) => ({ duty: .125, v: .13, gate: 1, env: decay(12), pan: -.35, ...o });
const bass = (o = {}) => ({ wave: 'tri', v: .5, gate: .9, env: adsr(.004, .04, .85, .03), ...o });

const tracks = [];

// ---- main menu: C major, 112 BPM, 14 bars (4 + 4 + 4 + a 2-bar tag)
{
  const a1 = 'E5:2 G5:2 C6:4 B5:2 A5:2 G5:4', a2 = 'A5:2 G5:2 D5:4 G5:2 B5:2 D6:4';
  const step = 30 / (14 * 16);
  tracks.push({
    name: 'bgm_menu', steps: 16,
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F G', 'C', 'F', 'G', 'Em', 'Am', 'F', 'G'],
    voices: [
      { kind: 'tune', inst: lead({ echo: echo(step * 3) }), bars: [
        a1, a2, 'C6:2 E6:2 C6:4 B5:2 A5:2 E5:4', 'F5:2 A5:2 C6:2 A5:2 G5:4 -:4',
        a1, a2, 'C6:2 A5:2 F5:2 A5:2 B5:2 G5:2 D6:4', 'C6:8 -:2 G5:2 C6:2 E6:2',
        'F6:4 E6:2 D6:2 C6:4 A5:4', 'D6:4 C6:2 B5:2 G5:4 B5:4', 'E6:4 D6:2 B5:2 G5:4 E5:4', 'A5:2 C6:2 E6:4 D6:2 C6:2 A5:4',
        'F5:2 A5:2 C6:2 F6:2 E6:2 C6:2 A5:2 C6:2', 'D6:2 B5:2 G5:2 B5:2 D6:2 G6:2 -:2 G5:2',
      ] },
      { kind: 'chord', floor: 'C5', inst: chime(), bars: '0:1 1:1 2:1 3:1 2:1 1:1 2:1 3:1 0:1 1:1 2:1 3:1 2:1 1:1 2:1 3:1' },
      { kind: 'chord', floor: 'E2', inst: bass(), bars: 'R:2 O:2 R:2 O:2 F:2 O:2 R:2 O:2' },
      { kind: 'drums', v: .8, bars: [...rep('k.h.s.h.k.k.s.h.', 7), 'k.h.s.h.k.s.s.ss', ...rep('k.h.s.hhk.k.s.h.', 5), 'k.h.s.h.k.s.ssss'] },
    ],
  });
}

// ---- beach: F major, 96 BPM, 12 bars, calypso
{
  const a = ['A5:3 C6:3 A5:2 F5:3 A5:3 C6:2', 'D6:3 Bb5:3 D6:2 F6:3 D6:3 Bb5:2', 'E6:3 C6:3 G5:2 Bb5:3 G5:3 E5:2'];
  tracks.push({
    name: 'bgm_beach', steps: 16,
    chords: ['F', 'Bb', 'C7', 'F', 'Dm', 'Bb', 'Gm', 'C', 'F', 'Bb', 'C7', 'F C'],
    voices: [
      { kind: 'tune', inst: pluck({ v: .34, env: decay(5), echo: echo(30 / (12 * 16) * 3, .28) }), bars: [
        ...a, 'F5:3 A5:3 C6:2 F6:4 -:4',
        'D6:3 F6:3 D6:2 A5:3 D6:3 F6:2', 'D6:3 Bb5:3 F5:2 Bb5:3 D6:3 Bb5:2', 'Bb5:3 G5:3 Bb5:2 D6:3 Bb5:3 G5:2', 'G5:3 C6:3 E6:2 G6:4 E6:2 C6:2',
        ...a, 'F5:3 A5:3 C6:2 C6:3 Bb5:3 G5:2',
      ] },
      { kind: 'chord', floor: 'F4', inst: stab({ duty: .125, v: .13, gate: .5, pan: -.35 }), bars: '-:2 1:2 -:2 2:2 -:2 1:2 -:2 2:2' },
      { kind: 'chord', floor: 'E2', inst: bass(), bars: 'R:3 R:3 F:2 R:3 F:3 O:2' },
      { kind: 'drums', v: .65, bars: [...rep('k.hkh.s.k.hkh.sh', 11), 'k.hkh.s.k.hks.ss'] },
    ],
    // a far-off wave rolls in every two bars
    extra: (mix, bar) => {
      for (let b = 0; b < 12; b += 2) mix.tone({ wave: 'noise', t: b * bar + .4, d: 3.6, f: t => 2500 + 5000 * Math.sin(Math.PI * t / 3.6), v: .07, env: swell(.45), pan: b % 4 ? .4 : -.4 });
    },
  });
}

// ---- market: G major, 128 BPM, 16 bars
{
  const a1 = 'D5:2 E5:2 G5:2 A5:2 B5:2 A5:2 G5:2 E5:2', em = 'G5:2 B5:2 E6:2 B5:2 G5:2 E5:2 G5:2 B5:2', cd = 'C6:2 E6:2 C6:2 G5:2 A5:2 D6:2 F#5:2 A5:2';
  tracks.push({
    name: 'bgm_market', steps: 16,
    chords: ['G', 'G', 'C', 'D', 'G', 'Em', 'C D', 'G', 'C', 'G', 'Am', 'D', 'G', 'Em', 'C D', 'G'],
    voices: [
      { kind: 'tune', inst: stab({ v: .32, gate: .6, echo: echo(30 / 256 * 3, .22) }), bars: [
        a1, 'D5:2 G5:2 B5:2 D6:2 B5:4 -:4', 'E5:2 G5:2 C6:2 E6:2 D6:2 C6:2 G5:2 E5:2', 'A5:2 D6:2 A5:2 F#5:2 A5:4 -:2 D5:2',
        a1, em, cd, 'G5:4 B5:2 D6:2 G6:4 -:4',
        'E6:2 E6:2 G6:4 -:2 C5:2 E5:2 G5:2', 'D6:2 D6:2 G6:4 -:2 B4:2 D5:2 G5:2', 'C6:2 C6:2 E6:4 -:2 A4:2 C5:2 E5:2', 'A5:2 D6:2 F#6:2 A6:2 F#6:2 D6:2 A5:2 D5:2',
        a1, em, cd, 'G5:2 D5:2 B5:2 G5:2 D6:2 B5:2 G6:4',
      ] },
      { kind: 'chord', floor: 'G4', inst: chime({ v: .11, env: decay(16) }), bars: '0:1 1:1 2:1 3:1 0:1 1:1 2:1 3:1 0:1 1:1 2:1 3:1 0:1 1:1 2:1 3:1' },
      { kind: 'chord', floor: 'E2', inst: bass({ gate: .7 }), bars: 'R:2 O:2 R:2 O:2 F:2 O:2 R:2 O:2' },
      { kind: 'drums', v: .8, bars: [...rep('k.h.s.h.k.h.s.hh', 7), 'k.h.s.h.s.s.ssss', ...rep('k.h.s.h.k.h.s.hh', 7), 'k.h.s.h.s.s.ssss'] },
    ],
  });
}

// ---- islands: D major, 6/8, 20 bars of six eighth notes
tracks.push({
  name: 'bgm_islands', steps: 6,
  chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A', 'D', 'G', 'A', 'A7'],
  voices: [
    { kind: 'tune', inst: lead({ duty: .25, v: .3, echo: echo(.25, .25) }), bars: [
      'F#5:3 A5:2 D6:1', 'E6:3 C#6:2 A5:1', 'D6:3 B5:2 F#5:1', 'G5:2 B5:1 D6:3',
      'F#5:3 A5:2 D6:1', 'E6:3 C#6:2 E6:1', 'D6:2 B5:1 G5:2 B5:1', 'A5:3 -:1 C#6:1 E6:1',
      'F#6:3 D6:2 B5:1', 'G6:2 F#6:1 D6:3', 'F#6:3 D6:2 A5:1', 'E6:2 D6:1 C#6:3',
      'D6:3 F#6:2 B5:1', 'B5:2 D6:1 G6:3', 'G6:2 E6:1 B5:2 G5:1', 'A5:2 C#6:1 E6:3',
      'D6:3 F#6:2 A6:1', 'G6:3 D6:2 B5:1', 'C#6:2 E6:1 A5:2 C#6:1', 'E6:4 -:2',
    ] },
    { kind: 'chord', floor: 'D4', inst: chime({ v: .16, env: decay(7) }), bars: '0:1 1:1 2:1 3:1 2:1 1:1' },
    { kind: 'chord', floor: 'E2', inst: bass(), bars: 'R:3 F:2 O:1' },
    { kind: 'drums', v: .55, bars: [...rep('k.hs.h', 19), 'k.hsss'] },
  ],
});

// ---- swamp: A minor, 3/4, 16 bars of six eighth notes
tracks.push({
  name: 'bgm_swamp', steps: 6,
  chords: ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'E', 'E', 'Am', 'C', 'F', 'E', 'Am', 'Dm', 'E', 'Am'],
  voices: [
    { kind: 'tune', inst: soft({ v: .3, echo: echo(.3125 * 2, .35) }), bars: [
      'A4:4 C5:2', 'E5:4 D5:1 C5:1', 'A4:4 C5:2', 'F5:6', 'D5:4 F5:2', 'A5:4 G5:1 F5:1', 'E5:4 G#5:2', 'B5:4 -:2',
      'C6:2 B5:2 A5:2', 'G5:4 E5:2', 'A5:2 G5:2 F5:2', 'E5:4 G#4:2', 'A4:2 C5:2 E5:2', 'F5:2 E5:2 D5:2', 'E5:2 D5:2 B4:2', 'A4:4 -:2',
    ] },
    // fireflies: tiny high blips that echo from side to side
    { kind: 'chord', floor: 'A5', inst: chime({ v: .13, env: decay(18), pan: -.6, echo: echo(.3125 * 1.5, .5, .6) }), bars: [
      '-:1 2:1 -:2 4:1 -:1', '-:3 3:1 -:1 5:1', '-:2 4:1 -:3', '-:1 5:1 -:1 3:1 -:2', '-:1 2:1 -:2 4:1 -:1', '-:4 5:1 -:1', '-:2 3:1 -:1 4:1 -:1', '-:5 2:1',
      '-:1 4:1 -:4', '-:3 5:1 -:2', '-:1 3:1 -:2 4:1 -:1', '-:4 2:1 -:1', '-:2 5:1 -:3', '-:1 4:1 -:3 3:1', '-:3 2:1 -:2', '-:1 3:1 -:1 5:1 -:2',
    ] },
    { kind: 'chord', floor: 'E2', inst: bass({ v: .55, gate: .95 }), bars: 'R:4 -:1 F:1' },
    { kind: 'drums', v: .7, bars: ['k..tt.', 'k...t.', 'k..tt.', 'k.t..t', 'k..tt.', 'k...t.', 'k..tt.', 'k.t.tt', 'k..tt.', 'k...t.', 'k..tt.', 'k.t..t', 'k..tt.', 'k...t.', 'k..tt.', 'k.t.tt'] },
  ],
});

// ---- mountain: E major, 120 BPM, 15 bars (4 + 4 + 4 + a 3-bar ending with a drum roll), a march
{
  const a1 = 'E5:4 G#5:2 B5:2 E6:6 B5:2', a2 = 'C#6:4 A5:2 C#6:2 E6:6 C#6:2';
  tracks.push({
    name: 'bgm_mountain', steps: 16,
    chords: ['E', 'A', 'B', 'E', 'E', 'A', 'B', 'C#m', 'A', 'B', 'G#m', 'C#m', 'A', 'B', 'B7'],
    voices: [
      { kind: 'tune', up: -12, inst: lead({ v: .32, echo: echo(.125 * 3, .28) }), bars: [
        a1, a2, 'D#6:4 B5:2 D#6:2 F#6:6 D#6:2', 'E6:8 -:2 B5:2 E6:2 G#6:2',
        a1, a2, 'D#6:2 F#6:2 B6:4 A6:2 F#6:2 D#6:4', 'E6:6 C#6:2 G#5:4 -:4',
        'A5:2 C#6:2 E6:4 C#6:2 E6:2 A6:4', 'B5:2 D#6:2 F#6:4 D#6:2 F#6:2 B6:4', 'G#6:4 D#6:2 B5:2 G#5:4 B5:4', 'C#6:4 E6:2 G#6:2 E6:8',
        'A6:3 A6:1 A6:2 E6:2 C#6:4 E6:4', 'B6:3 B6:1 B6:2 F#6:2 D#6:4 B5:4', 'B5:2 D#6:2 F#6:2 B6:2 -:8',
      ] },
      { kind: 'chord', floor: 'E4', inst: chime({ v: .13, env: decay(9) }), bars: '0:2 2:2 1:2 2:2 0:2 2:2 1:2 2:2' },
      { kind: 'chord', floor: 'E2', inst: bass({ gate: .8 }), bars: 'R:4 F:4 R:4 F:4' },
      { kind: 'drums', v: .8, bars: [...rep('k.ssk.s.k.ssk.ss', 14), 'k.s.s.sssssSSSSS'] },
    ],
  });
}

// ---- chase: E minor, 160 BPM, 20 bars
{
  const r1 = 'E5:2 -:1 E5:1 G5:2 E5:2 B5:2 -:2 A5:2 G5:2', r2 = 'E5:2 -:1 E5:1 G5:2 E5:2 B5:4 -:4', r3 = 'E5:2 -:1 E5:1 G5:2 E5:2 C6:2 -:2 B5:2 G5:2';
  const r4 = 'F#5:2 -:1 F#5:1 A5:2 F#5:2 D6:4 -:4', x4 = s => rep(s, 4).join(' ');
  const fast = '0:1 1:1 2:1 1:1 0:1 1:1 2:1 1:1 0:1 1:1 2:1 1:1 0:1 1:1 2:1 1:1';
  tracks.push({
    name: 'bgm_chase', steps: 16,
    chords: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B', 'G', 'D', 'C', 'B', 'Em', 'Em', 'C', 'D', 'Em', 'C', 'B', 'B7'],
    voices: [
      { kind: 'tune', inst: stab({ v: .32, gate: .7, echo: echo(30 / 320 * 2, .2) }), bars: [
        r1, r2, r3, r4, r1, r2, r3, 'F#5:2 -:1 F#5:1 B5:2 D#6:2 F#6:4 -:4',
        'D6:2 B5:2 G5:2 B5:2 D6:2 B5:2 G5:2 B5:2', 'D6:2 A5:2 F#5:2 A5:2 D6:2 A5:2 F#5:2 A5:2', 'E6:2 C6:2 G5:2 C6:2 E6:2 C6:2 G5:2 C6:2', 'D#6:2 B5:2 F#5:2 B5:2 D#6:2 F#6:2 B6:4',
        r1, r2, r3, r4,
        x4('E6:1 D6:1 B5:1 G5:1'), x4('E6:1 C6:1 G5:1 E5:1'), x4('D#6:1 B5:1 F#5:1 D#5:1'), 'B5:2 -:2 B5:2 -:2 B5:1 B5:1 B5:1 B5:1 B5:2 -:2',
      ] },
      { kind: 'chord', floor: 'E4', inst: chime({ v: .1, env: decay(20) }), bars: [...rep(fast, 8), ...rep(null, 4), ...rep(fast, 4), ...rep(null, 4)] },
      { kind: 'chord', floor: 'E2', inst: bass({ v: .55, gate: .8 }), bars: 'R:1 R:1 O:1 R:1 R:1 R:1 O:1 R:1 R:1 R:1 O:1 R:1 R:1 R:1 O:1 R:1' },
      { kind: 'drums', v: .85, bars: [...rep('khhhshhhkhhhshhh', 7), 'khhhshhhk.s.ssss', ...rep('k.h.s.hkk.h.s.h.', 4), ...rep('khhhshhhkhhhshhh', 7), 'k.s.k.s.ssssSSSS'] },
    ],
  });
}

// ---- apex: the last 30 seconds. C major, then up to D and to E, 144 BPM, 18 bars. It builds and ends; no loop.
{
  const t1 = 'C5:3 C5:1 E5:2 G5:2 C6:4 G5:2 E5:2', t2 = 'F5:3 F5:1 A5:2 C6:2 F6:4 C6:2 A5:2', t3 = 'G5:3 G5:1 B5:2 D6:2 G6:4 D6:2 B5:2';
  const toHome = 'G6:2 F6:2 E6:2 D6:2 G5:2 A5:2 B5:2 D6:2', toNext = 'A5:3 A5:1 C#6:2 E6:2 A6:4 E6:2 C#6:2';
  const up = (list, n) => list.map(bar => ({ bar, up: n }));
  const theme = [t1, t2, t3, toHome, t1, t2, t3, toNext, ...up([t1, t2, t3, toNext], 2), ...up([t1, t2, t3, toHome], 4)];
  const run = 'B4:1 C#5:1 D#5:1 E5:1 F#5:1 G#5:1 A5:1 B5:1 C#6:1 D#6:1 E6:1 F#6:1 G#6:1 A6:1 B6:1 B6:1';
  const ring = { env: adsr(.005, .3, .6, .9), gate: 1 };
  const arp8 = '0:2 1:2 2:2 3:2 2:2 1:2 2:2 3:2', arp16 = '0:1 1:1 2:1 3:1 2:1 1:1 2:1 3:1 0:1 1:1 2:1 3:1 2:1 1:1 2:1 3:1';
  tracks.push({
    name: 'bgm_apex', steps: 16, loop: false,
    chords: ['C', 'F', 'G', 'G7', 'C', 'F', 'G', 'A', 'D', 'G', 'A', 'B', 'E', 'A', 'B', 'B', 'B7', 'E'],
    voices: [
      { kind: 'tune', inst: lead({ v: .3, echo: echo(30 / 288 * 3, .25) }), bars: [...theme, run, null] },
      { kind: 'tune', up: 12, inst: lead({ duty: .125, v: .13, pan: .3 }), bars: [...rep(null, 12), ...theme.slice(12), null, null] },
      { kind: 'tune', inst: lead({ v: .3, ...ring }), bars: [...rep(null, 17), 'E6:16'] },
      { kind: 'tune', inst: lead({ duty: .25, v: .2, pan: -.3, ...ring }), bars: [...rep(null, 17), 'G#5:16'] },
      { kind: 'tune', inst: lead({ duty: .125, v: .2, pan: .3, ...ring }), bars: [...rep(null, 17), 'B5:16'] },
      { kind: 'chord', floor: 'C4', inst: chime({ v: .13 }), bars: [...rep(null, 4), ...rep(arp8, 4), ...rep(arp16, 8), null, null] },
      { kind: 'chord', floor: 'E2', inst: bass({ v: .55 }), bars: [...rep('R:4 R:4 F:4 R:4', 4), ...rep('R:2 R:2 O:2 R:2 R:2 R:2 O:2 F:2', 12), 'R:2 R:2 R:2 R:2 R:2 R:2 R:2 R:2', 'R:16'] },
      { kind: 'drums', v: .85, bars: [
        ...rep('k...k...k...k...', 3), 'k...k...k.s.s.ss', ...rep('k.h.k.h.k.h.k.h.', 3), 'k.h.k.h.s.s.ssss',
        ...rep('k.h.s.h.k.h.s.h.', 3), 'k.h.s.h.s.s.ssss', ...rep('k.hhs.hhk.hhs.hh', 3), 'k.hhs.hhssssSSSS', 'ssssssssSSSSSSSS', 'k...............',
      ] },
      { kind: 'drums', v: .9, bars: [...rep(null, 4), 'c...............', ...rep(null, 3), 'c...............', ...rep(null, 3), 'c...............', ...rep(null, 4), 'c...............'] },
    ],
  });
}

// ---- ending: C major, 80 BPM, 10 bars (4 + 4 + a 2-bar tag), a lullaby
tracks.push({
  name: 'bgm_ending', steps: 16,
  chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F G', 'C', 'F', 'G7'],
  voices: [
    { kind: 'tune', inst: soft({ v: .3, echo: echo(.1875 * 3, .25) }), bars: [
      'E5:4 G5:2 E5:2 C6:4 G5:4', 'A5:4 C6:2 A5:2 E5:8', 'F5:4 A5:2 F5:2 C6:4 A5:4', 'G5:4 B5:2 G5:2 D6:8',
      'E6:4 D6:2 C6:2 G5:4 E5:4', 'A5:4 G5:2 E5:2 C5:8', 'F5:2 A5:2 C6:4 B5:2 G5:2 D5:4', 'C5:4 E5:4 C6:8',
      'A5:4 C6:4 F6:4 C6:4', 'B5:4 D6:4 G5:6 -:2',
    ] },
    { kind: 'chord', floor: 'C5', inst: chime({ v: .15, env: decay(6), echo: echo(.1875 * 3, .3, .35) }), bars: '0:2 1:2 2:2 3:2 2:2 1:2 2:2 1:2' },
    { kind: 'chord', floor: 'E2', inst: bass({ v: .5, gate: .97 }), bars: 'R:8 F:4 O:4' },
    { kind: 'drums', v: .5, bars: '..h...h...h...h.' },
  ],
});

module.exports = { tracks, render };
