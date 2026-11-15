'use strict';
// The player's best round, kept in localStorage: the highest level reached and the longest time survived.
(() => {
  const stored = key => Number(PI.store.get(key)) || 0;
  PI.records = {
    best: () => ({ lv: stored('best.lv'), time: stored('best.time') }),
    // Takes the result of a round and returns which of the two records it beat. The first round a player
    // finishes sets both records and beats neither.
    submit(lv, time) {
      const old = PI.records.best(), seconds = Math.floor(time);
      if (lv > old.lv) PI.store.set('best.lv', lv);
      if (seconds > old.time) PI.store.set('best.time', seconds);
      return { lv: old.lv > 0 && lv > old.lv, time: old.time > 0 && seconds > old.time };
    },
  };
})();
