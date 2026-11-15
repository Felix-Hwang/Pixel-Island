'use strict';
// The player's settings, kept in localStorage. Each one has a list of choices and a default.
(() => {
  const CHOICES = {
    zoom: ['near', 'normal', 'far'],
    chase: ['on', 'off'], // off: higher levels no longer come after the player, but touching one is still fatal
  };
  const DEFAULT = { zoom: 'normal', chase: 'on' };
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
