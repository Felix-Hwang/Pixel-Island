'use strict';
// A small chiptune synthesizer: pulse, stepped triangle and shift-register noise, the three kinds of sound an
// 8-bit console makes. Sound is drawn at four times the output rate and filtered down, which keeps square waves
// free of the harsh ringing they get when drawn at the output rate directly.
const fs = require('fs');

const SR = 44100, OS = 4, FS = SR * OS, CONTROL = 8;
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// 'A4' -> 440, 'C#5', 'Bb3'
function hz(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error('Bad note: ' + name);
  const semis = NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
}
const shift = (f, semis) => f * Math.pow(2, semis / 12);

// Pitch shapes. Each returns a function of the seconds since the tone began.
const slide = (f0, f1, seconds) => t => t >= seconds ? f1 : f0 * Math.pow(f1 / f0, t / seconds);
const steps = (list, each) => t => list[Math.min(list.length - 1, Math.floor(t / each))];
const vibrato = (f, rate, semis, delay = 0) => t => {
  const base = typeof f === 'function' ? f(t) : f;
  return t < delay ? base : shift(base, Math.sin((t - delay) * rate * 2 * Math.PI) * semis);
};
const wobble = (f, rate, semis) => t => shift(typeof f === 'function' ? f(t) : f, (Math.floor(t * rate * 2) % 2 ? 1 : -1) * semis);

// Loudness shapes. Each returns a function of (seconds since the tone began, length of the tone).
const adsr = (a, d, s, r) => (t, len) => {
  const body = t < a ? t / a : t < a + d ? 1 - (1 - s) * (t - a) / d : s;
  return t > len - r ? body * Math.max(0, (len - t) / r) : body;
};
const decay = rate => t => Math.exp(-t * rate);
const swell = peakAt => (t, len) => { const u = t / len; return u < peakAt ? u / peakAt : (1 - u) / (1 - peakAt); };
const flat = () => 1;

class Mix {
  constructor(seconds, stereo = false) {
    this.seconds = seconds;
    this.stereo = stereo;
    this.n = Math.ceil(seconds * FS);
    this.L = new Float32Array(this.n);
    this.R = stereo ? new Float32Array(this.n) : this.L;
  }
  // o.wave: 'pulse' | 'tri' | 'noise'. o.t, o.d: start and length in seconds. o.f: Hz or a pitch shape; for noise it
  // is how many times a second the register steps (high = hiss, low = rumble). o.v: loudness 0..1. o.env: a
  // loudness shape. o.duty: pulse width. o.pan: -1 left .. 1 right. o.metal: the short noise register, which buzzes.
  tone(o) {
    const wave = o.wave || 'pulse', duty = o.duty || .5, vol = o.v == null ? .5 : o.v, env = o.env || flat;
    const len = o.d, pan = o.pan || 0;
    const gl = this.stereo ? vol * Math.min(1, 1 - pan) : vol, gr = this.stereo ? vol * Math.min(1, 1 + pan) : 0;
    const i0 = Math.max(0, Math.round(o.t * FS)), i1 = Math.min(this.n, Math.round((o.t + len) * FS));
    const edge = Math.min(.004, len / 4) * FS; // every tone gets a short ramp at both ends so it never clicks
    const fIsFn = typeof o.f === 'function', tap = o.metal ? 6 : 1;
    let phase = 0, f = fIsFn ? o.f(0) : o.f, amp = 0, reg = 1, out = 1;
    for (let i = i0; i < i1; i++) {
      const k = i - i0;
      if (k % CONTROL === 0) {
        const t = k / FS;
        if (fIsFn) f = o.f(t);
        amp = env(t, len) * Math.min(1, (k + 1) / edge, (i1 - i) / edge);
      }
      phase += f / FS;
      let s;
      if (wave === 'noise') {
        while (phase >= 1) { phase -= 1; const bit = (reg ^ (reg >> tap)) & 1; reg = (reg >> 1) | (bit << 14); out = reg & 1 ? 1 : -1; }
        s = out;
      } else {
        if (phase >= 1) phase -= Math.floor(phase);
        if (wave === 'tri') { const st = Math.floor(phase * 32); s = (st < 16 ? 15 - st : st - 16) / 7.5 - 1; }
        else s = phase < duty ? 1 : -1;
      }
      this.L[i] += s * amp * gl;
      if (this.stereo) this.R[i] += s * amp * gr;
    }
  }
}

// low-pass at 18 kHz, then keep every fourth sample
const TAPS = (() => {
  const n = 127, mid = (n - 1) / 2, fc = 18000 / FS, h = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = i - mid, sinc = x === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);
    const win = .42 - .5 * Math.cos(2 * Math.PI * i / (n - 1)) + .08 * Math.cos(4 * Math.PI * i / (n - 1));
    h[i] = sinc * win; sum += h[i];
  }
  for (let i = 0; i < n; i++) h[i] /= sum;
  return h;
})();
// wrap: the sound is a loop, so the filter reads across the seam instead of into silence
function downsample(x, count, wrap) {
  const out = new Float32Array(count), mid = (TAPS.length - 1) / 2, n = x.length;
  for (let j = 0; j < count; j++) {
    let acc = 0;
    const base = j * OS - mid;
    for (let k = 0; k < TAPS.length; k++) {
      let i = base + k;
      if (i < 0 || i >= n) { if (!wrap) continue; i = ((i % n) + n) % n; }
      acc += x[i] * TAPS[k];
    }
    out[j] = acc;
  }
  return out;
}

function biquad(x, b0, b1, b2, a1, a2) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
// The K-weighting of ITU-R BS.1770: it weighs sound the way the ear does, so a thin high beep and a low thump
// that measure the same also sound about equally loud.
function weighted(x) {
  let K = Math.tan(Math.PI * 1681.974450955533 / SR), Q = .7071752369554196, a0 = 1 + K / Q + K * K;
  const Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, .4996667741545416);
  const shelf = biquad(x, (Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0);
  K = Math.tan(Math.PI * 38.13547087602444 / SR); Q = .5003270373238773; a0 = 1 + K / Q + K * K;
  return biquad(shelf, 1, -2, 1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0);
}
// Brings a finished sound to a set loudness (in LUFS, measured over its audible part), and turns it down further
// if a peak would pass peakDb. A one-channel sound is measured as it will be heard, from both speakers.
function level(channels, loudness, peakDb) {
  let peak = 0, sum = 0, count = 0;
  for (const c of channels) for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]));
  if (!peak) return { peak: -Infinity, loudness: -Infinity };
  for (const c of channels) {
    const w = weighted(c);
    let top = 0;
    for (let i = 0; i < w.length; i++) top = Math.max(top, Math.abs(w[i]));
    for (let i = 0; i < w.length; i++) if (Math.abs(w[i]) > top * .02) { sum += w[i] * w[i]; count++; }
  }
  const now = -.691 + 10 * Math.log10(2 * sum / Math.max(1, count));
  const gain = Math.min(Math.pow(10, (loudness - now) / 20), Math.pow(10, peakDb / 20) / peak);
  for (const c of channels) for (let i = 0; i < c.length; i++) c[i] *= gain;
  return { peak: 20 * Math.log10(peak * gain), loudness: now + 20 * Math.log10(gain) };
}

function writeWav(file, channels) {
  const n = channels[0].length, ch = channels.length, buf = Buffer.alloc(44 + n * ch * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * ch * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(ch, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * ch * 2, 28); buf.writeUInt16LE(ch * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * ch * 2, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, channels[c][i])) * 32767), 44 + (i * ch + c) * 2);
  }
  fs.writeFileSync(file, buf);
}

// Turns a mix into finished channels at the output rate. loop: see downsample.
function finish(mix, { loudness, peakDb, loop = false }) {
  const count = Math.round(mix.seconds * SR);
  const channels = mix.stereo ? [downsample(mix.L, count, loop), downsample(mix.R, count, loop)] : [downsample(mix.L, count, loop)];
  const stats = level(channels, loudness, peakDb);
  return { channels, stats };
}

module.exports = { SR, hz, shift, slide, steps, vibrato, wobble, adsr, decay, swell, flat, Mix, finish, writeWav };
