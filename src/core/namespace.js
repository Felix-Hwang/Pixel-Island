'use strict';
// Global PI namespace. Every other file adds to it; nothing else is global.
// Every file is a classic script. index.html loads them in order.
window.PI = {
  config: {},
  state: {},
  species: {},        // lv1 to lv10, each an array of species definitions (data/species)
  speeds: {},         // speed in px/s by species id (data/speeds.js)
  grades: {},         // grade by species id (data/grades.js)
  senses: {},         // detection range by species id (data/senses.js)
  styles: {},         // temperament by map id, then species id (data/styles.js)
  i18n: { species: {}, facts: {} }, // strings by language, and species names by language under species
  bodies: {},         // body templates (src/creatures/bodies)
  behaviors: {},      // steering styles (src/behaviors)
  maps: {},           // map definitions by id (src/world/maps)
  mapOrder: [],       // play order of maps
  interactions: {},   // interaction definitions by 'map/id' (src/world/interactions)
  ui: {},
  tools: {},
};
PI.register = (group, id, def) => { PI[group][id] = def; return def; };
// A map may list only the temperament numbers it changes; the rest come from config.styles.
PI.registerMap = def => {
  const styles = {};
  for (const key of Object.keys(PI.config.styles)) styles[key] = { ...PI.config.styles[key], ...((def.styles || {})[key] || {}) };
  def.styles = styles;
  PI.maps[def.id] = def;
  return def;
};
PI.registerInteraction = (mapId, id, def) => { def.id = id; def.map = mapId; PI.interactions[mapId + '/' + id] = def; return def; };
PI.allSpecies = () => Object.keys(PI.species).sort().flatMap(k => PI.species[k]);
PI.speciesById = id => PI.allSpecies().find(s => s.id === id);
PI.levelOf = id => { for (let lv = 1; lv <= 10; lv++) if (PI.species['lv' + lv].some(s => s.id === id)) return lv; return 0; };
// A test parameter from the page address. It is null when absent and '' when given without a value, which means random.
PI.param = name => { try { const q = new URLSearchParams(location.search); return q.has(name) ? q.get(name) : null; } catch { return null; } };
// Settings and the language are kept in localStorage. A browser may refuse storage (some private windows do), so
// every value is also kept in memory and still holds for the rest of the visit.
const kept = {};
PI.store = {
  get(key) {
    if (key in kept) return kept[key];
    try { return localStorage.getItem('pixel-island.' + key); } catch { return null; }
  },
  set(key, value) {
    kept[key] = String(value);
    try { localStorage.setItem('pixel-island.' + key, value); } catch {}
  },
  session(key, value) {
    try {
      if (value === undefined) { const v = sessionStorage.getItem('pixel-island.' + key); sessionStorage.removeItem('pixel-island.' + key); return v; }
      sessionStorage.setItem('pixel-island.' + key, value);
    } catch { return null; }
  },
};
