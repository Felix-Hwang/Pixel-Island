'use strict';
// Loads script files on demand, so a visit only fetches what it uses: one language, and one map at a time.
(() => {
  const asked = {};
  PI.load = src => asked[src] || (asked[src] = new Promise((done, fail) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => done();
    s.onerror = () => { delete asked[src]; s.remove(); fail(new Error('could not load ' + src)); }; // a later call tries again
    document.head.append(s);
  }));
  PI.loadAll = list => Promise.all(list.map(PI.load));
  // one map: its definition and its five terrain effects, as listed in src/world/manifest.js
  PI.needMap = id => PI.loadAll(['src/world/maps/' + id + '.js', ...PI.mapParts[id].map(part => 'src/world/interactions/' + id + '/' + part + '.js')]);
  PI.needLang = lang => PI.loadAll(['data/i18n/' + lang + '.js', 'data/i18n/species/' + lang + '.js']);
  PI.needFacts = lang => PI.load('data/i18n/facts/' + lang + '.js');
})();
