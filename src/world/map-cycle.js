'use strict';
// The five maps take turns. The last map played is remembered, so the next round starts on the one after it.
(() => {
  const C = PI.mapCycle = {};
  // the map the next round will be played on
  C.upcoming = () => {
    const order = PI.mapOrder;
    let forced = null;
    try { forced = new URLSearchParams(location.search).get('map'); } catch {}
    if (forced && PI.maps[forced]) return forced; // ?map=kinabalu, for testing one map
    const last = order.indexOf(PI.store.get('map'));
    return order[(last + 1) % order.length];
  };
  // call when a round really starts on this map
  C.played = id => PI.store.set('map', id);
})();
