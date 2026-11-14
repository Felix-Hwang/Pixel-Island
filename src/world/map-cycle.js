'use strict';
// Every round is played on a map picked at random. The same map never comes twice in a row.
(() => {
  const C = PI.mapCycle = {};
  // the map the next round will be played on
  C.upcoming = () => {
    let forced = null;
    try { forced = new URLSearchParams(location.search).get('map'); } catch {}
    if (forced && PI.maps[forced]) return forced; // ?map=kinabalu, for testing one map
    const last = PI.store.get('map'), others = PI.mapOrder.filter(id => id !== last);
    return others[Math.random() * others.length | 0];
  };
  // call when a map is put on screen, so the next pick is a different one
  C.played = id => PI.store.set('map', id);
})();
