'use strict';
// The player's settings, kept in localStorage. Each one has a list of choices and a default.
(() => {
  const CHOICES = {
    zoom: ['near', 'normal', 'far'],
    // off: higher levels no longer come after the player, but touching one is still fatal.
    // peace: they do not come after the player either, and touching one only pushes.
    chase: ['peace', 'off', 'on'],
    music: ['off', 'on'],
    sound: ['off', 'on'],
  };
  const DEFAULT = { zoom: 'normal', chase: 'on', music: 'on', sound: 'on' };
  const St = PI.settings = {
    keys: () => Object.keys(CHOICES),
    choices: key => CHOICES[key].slice(),
    get(key) { const v = PI.store.get('set.' + key); return CHOICES[key].includes(v) ? v : DEFAULT[key]; },
    set(key, value) {
      if (!CHOICES[key].includes(value)) return;
      PI.store.set('set.' + key, value);
      document.dispatchEvent(new CustomEvent('pi:settings', { detail: key }));
    },
    on: key => St.get(key) === 'on',
  };
})();
