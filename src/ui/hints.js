'use strict';
// Two notices in a player's very first round, for someone who has not opened the guide: how to move, and what to
// eat and what to keep away from. They are shown once.
PI.ui.hints = {
  firstRound() {
    if (PI.store.get('hinted')) return;
    PI.store.set('hinted', 1);
    const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    PI.ui.toast.show(PI.t(touch ? 'hint.move.touch' : 'hint.move.keys'), PI.config.hintMs);
    PI.ui.toast.show(PI.t('hint.goal'), PI.config.hintMs);
  },
};
