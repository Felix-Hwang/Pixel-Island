'use strict';
// Sound. Effects are short one-shots. Music is one track at a time, chosen from the state of the game every frame,
// with a chase track that takes over while a hunter is after the player. Nothing here changes the rules of the game.
// A browser only lets a page make sound after the player has pressed something, so everything waits for that.
// The files under assets/audio are made by tools/audio/build.js.
(() => {
  const DIR = 'assets/audio/', LOOP = 30, MUSIC = .5, SOUND = .85;
  const EFFECTS = ('ui_click ui_back ui_select game_start transition spawn eat_berry eat_creature food_bonus evolve guard_burst alert chase_end ' +
    'bump_edge push death gameover apex_start countdown_tick finale_pop ascend victory status_stun status_fast status_slow status_hidden ' +
    'status_safe status_blind status_end splash wave coconut_drop drink food_stall handcart_hit awning_bounce hawker clam jellyfish_zap ' +
    'boat_ride tide_change firefly light_grow mud bridge_break slip cloud_ride flag').split(' ').map(name => 'sfx_' + name);
  const Au = PI.audio = {};
  const buffers = new Map(), last = {}; // name -> a decoded sound, or the promise of one; name -> when it last played
  let ctx = null, musicOut = null, soundOut = null;
  let track = null, chase = null, calmAt = 0, hushUntil = 0; // a playing track is { name, gain, src, level }

  const ready = name => { const b = buffers.get(name); return b && !b.then ? b : null; };
  function load(name) {
    if (!ctx) return Promise.resolve(null);
    if (!buffers.has(name)) {
      buffers.set(name, fetch(DIR + (name.startsWith('bgm_') ? 'bgm/' : 'sfx/') + name + '.mp3')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => { buffers.set(name, buffer); return buffer; })
        .catch(() => { buffers.delete(name); return null; }));
    }
    return Promise.resolve(buffers.get(name));
  }
  const levels = () => {
    if (!ctx) return;
    musicOut.gain.value = PI.settings.on('music') ? MUSIC : 0;
    soundOut.gain.value = PI.settings.on('sound') ? SOUND : 0;
  };
  function unlock() {
    if (!ctx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      ctx = new Context();
      musicOut = ctx.createGain(); soundOut = ctx.createGain();
      musicOut.connect(ctx.destination); soundOut.connect(ctx.destination);
      levels();
      // the effects are small, so all of them are fetched now, a few at a time
      const queue = EFFECTS.slice(), next = () => { const name = queue.shift(); if (name) load(name).then(next); };
      for (let n = 0; n < 6; n++) next();
    }
    if (ctx.state !== 'running' && !document.hidden) ctx.resume();
  }
  for (const type of ['pointerdown', 'keydown', 'touchend']) addEventListener(type, unlock, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => { if (ctx) { if (document.hidden) ctx.suspend(); else ctx.resume(); } });
  document.addEventListener('pi:settings', levels);

  // o.volume 0..1, o.rate (1 = as recorded, higher = higher and shorter), o.delay (s), o.gap (s): the same sound is
  // not started twice within this time, so a burst of events does not pile up into noise
  Au.play = (name, o = {}) => {
    if (!ctx || ctx.state !== 'running' || !PI.settings.on('sound')) return;
    const now = ctx.currentTime, buffer = ready(name);
    if (now - (last[name] || -9) < (o.gap == null ? .05 : o.gap)) return;
    if (!buffer) { load(name); return; } // a sound that arrives late is worse than none
    last[name] = now;
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.value = o.rate || 1;
    gain.gain.value = o.volume == null ? 1 : o.volume;
    src.connect(gain); gain.connect(soundOut);
    src.start(now + (o.delay || 0));
  };
  // a sound that comes from a place on the map: quieter with distance from the middle of the view, and not heard
  // at all from far away or while no round is being played
  Au.at = (name, x, y, o = {}) => {
    const S = PI.state, cam = PI.loop.cam, range = o.range || 24;
    if (S.phase !== 'play' && S.phase !== 'finale') return;
    const d = Math.hypot(x - cam.x, y - cam.y);
    if (d < range) Au.play(name, { ...o, volume: (o.volume == null ? 1 : o.volume) * Math.min(1, 1.3 * (1 - d / range)) });
  };
  // a sound for something that happens to a creature: in full for the player, faintly for others nearby
  Au.on = (c, name, o = {}) => {
    if (c.isPlayer) { if (PI.state.phase === 'play') Au.play(name, o); }
    else Au.at(name, c.x, c.y, { ...o, volume: .4, gap: .25 });
  };
  // no music for this long, so a fanfare can be heard on its own
  Au.hush = seconds => { if (ctx) hushUntil = ctx.currentTime + seconds; };

  function ramp(layer, level, seconds) {
    if (layer.level === level) return;
    const g = layer.gain.gain, now = ctx.currentTime;
    layer.level = level;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(level, now + seconds);
  }
  function begin(name, loop, level, seconds) {
    const buffer = ready(name), src = ctx.createBufferSource(), gain = ctx.createGain();
    // A decoder that does not trim the silence an MP3 encoder adds returns a slightly longer sound. The loop skips it.
    const lead = buffer.duration > LOOP + .01 ? 1105 / 44100 : 0;
    src.buffer = buffer;
    if (loop) { src.loop = true; src.loopStart = lead; src.loopEnd = lead + LOOP; }
    gain.gain.value = 0;
    src.connect(gain); gain.connect(musicOut);
    src.start(ctx.currentTime, lead);
    const layer = { name, gain, src, level: 0 };
    ramp(layer, level, seconds);
    return layer;
  }
  function end(layer, seconds) {
    ramp(layer, 0, seconds);
    layer.src.stop(ctx.currentTime + seconds + .05);
  }
  // Called every frame. It looks at the state of the game and makes the music match it.
  Au.tick = () => {
    if (!ctx || ctx.state !== 'running') return;
    const S = PI.state, now = ctx.currentTime, playing = S.phase === 'play', on = PI.settings.on('music');
    let want = null;
    if (on && now >= hushUntil) {
      if (S.phase === 'start') want = 'bgm_menu';
      else if (playing) want = S.apexAt ? 'bgm_apex' : 'bgm_' + S.map.id;
      else if (S.phase === 'clear') want = 'bgm_ending';
    }
    if (on && playing) { // what the round may need next is fetched ahead of time
      load('bgm_chase');
      if (S.player && S.player.lv >= 9) load('bgm_apex');
      if (S.apexAt) load('bgm_ending');
    }
    const hunted = on && playing && !S.apexAt;
    if (hunted && PI.ai.chasing() > 0) calmAt = now + 1.2;
    const danger = hunted && now < calmAt;
    if ((track ? track.name : null) !== want) {
      if (track) { end(track, want ? .5 : .25); track = null; }
      if (want && ready(want)) {
        track = begin(want, want !== 'bgm_apex', danger && chase ? 0 : 1, .4);
        // decoded music is large, so only this track and the chase stay in memory
        for (const name of buffers.keys()) if (name.startsWith('bgm_') && name !== want && name !== 'bgm_chase' && ready(name)) buffers.delete(name);
      } else if (want) load(want);
    }
    if (danger && !chase && ready('bgm_chase')) chase = begin('bgm_chase', true, 1, .2);
    if (!danger && chase) {
      end(chase, .7); chase = null;
      if (playing && S.player) Au.play('sfx_chase_end', { volume: .8 });
    }
    if (track) ramp(track, chase ? 0 : 1, chase ? .3 : .9);
  };

  // every button answers with a sound; a button can name its own with data-sound
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button, a');
    if (!b) return;
    const kind = b.dataset.sound || (b.hasAttribute('aria-pressed') || b.getAttribute('role') === 'tab' ? 'select' : 'click');
    Au.play(kind.startsWith('sfx_') ? kind : 'sfx_ui_' + kind, { gap: 0 });
  }, true);
})();
