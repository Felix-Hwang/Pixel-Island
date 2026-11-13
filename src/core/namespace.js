'use strict';
// Global PI namespace. Every other file adds to it; nothing else is global.
// Every file is a classic script. index.html loads them in order.
window.PI = {
  config: {},
  state: {},
  species: {},        // lv1 to lv10, each an array of species definitions (data/species)
  speeds: {},         // speed in px/s by species id (data/speeds.js)
  i18n: { species: {} }, // strings by language, and species names by language under species
  bodies: {},         // body templates (src/creatures/bodies)
  behaviors: {},      // steering styles (src/behaviors)
  maps: {},           // map definitions by id (src/world/maps)
  mapOrder: [],       // play order of maps
  interactions: {},   // interaction definitions by 'map/id' (src/world/interactions)
  ui: {},
  tools: {},
};
PI.register = (group, id, def) => { PI[group][id] = def; return def; };
PI.registerMap = def => { PI.maps[def.id] = def; PI.mapOrder[def.order - 1] = def.id; return def; };
PI.registerInteraction = (mapId, id, def) => { def.id = id; def.map = mapId; PI.interactions[mapId + '/' + id] = def; return def; };
PI.allSpecies = () => Object.keys(PI.species).sort().flatMap(k => PI.species[k]);
PI.speciesById = id => PI.allSpecies().find(s => s.id === id);
PI.levelOf = id => { for (let lv = 1; lv <= 10; lv++) if (PI.species['lv' + lv].some(s => s.id === id)) return lv; return 0; };
PI.store = {
  get(key) { try { return localStorage.getItem('pixel-island.' + key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem('pixel-island.' + key, value); } catch {} },
  session(key, value) {
    try {
      if (value === undefined) { const v = sessionStorage.getItem('pixel-island.' + key); sessionStorage.removeItem('pixel-island.' + key); return v; }
      sessionStorage.setItem('pixel-island.' + key, value);
    } catch { return null; }
  },
};
