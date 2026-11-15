'use strict';
// Draws every sound and writes it as an MP3 under assets/audio. It needs ffmpeg.
//   node tools/audio/build.js            all sounds
//   node tools/audio/build.js menu eat   only the sounds whose name contains one of these words
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { Mix, finish, writeWav } = require('./synth');
const sfx = require('./sfx'), { tracks, render } = require('./bgm');

const ROOT = path.join(__dirname, '..', '..', 'assets', 'audio'), TMP = path.join(os.tmpdir(), 'pixel-island-audio');
const only = process.argv.slice(2), wanted = name => !only.length || only.some(word => name.includes(word));
// Music sits a little under the effects, so an effect is always heard over it.
const LEVEL = { bgm: { loudness: -16, peakDb: -1.5 }, sfx: { loudness: -14, peakDb: -1.5 } };

function findFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch { /* not on the path */ }
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(base)) for (const pack of fs.readdirSync(base)) {
    if (!pack.startsWith('Gyan.FFmpeg')) continue;
    for (const build of fs.readdirSync(path.join(base, pack))) {
      const exe = path.join(base, pack, build, 'bin', 'ffmpeg.exe');
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error('ffmpeg was not found. Install it and run this again.');
}
const ffmpeg = findFfmpeg();

function save(kind, name, mix, loop) {
  const { channels, stats } = finish(mix, { ...LEVEL[kind], loop });
  const wav = path.join(TMP, name + '.wav'), mp3 = path.join(ROOT, kind, name + '.mp3');
  writeWav(wav, channels);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', '-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0', mp3]);
  const kb = (fs.statSync(mp3).size / 1024).toFixed(1).padStart(6);
  console.log(`${(kind + '/' + name + '.mp3').padEnd(34)} ${mix.seconds.toFixed(2).padStart(5)} s  ${stats.loudness.toFixed(1).padStart(6)} LUFS  peak ${stats.peak.toFixed(1).padStart(5)} dB ${kb} KB`);
}

fs.mkdirSync(TMP, { recursive: true });
for (const kind of ['bgm', 'sfx']) fs.mkdirSync(path.join(ROOT, kind), { recursive: true });
for (const track of tracks) if (wanted(track.name)) save('bgm', track.name, render(track), track.loop !== false);
for (const [name, [seconds, draw]] of Object.entries(sfx)) {
  if (!wanted(name)) continue;
  const mix = new Mix(seconds);
  draw(mix);
  save('sfx', name, mix, false);
}
