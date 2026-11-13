'use strict';
// Level 6: 2 insects, 4 animals, 4 dinosaurs.
PI.species.lv6 = [
  { id: 'atlasbeetle',       cls: 'insect', body: 'hexapod',  sil: { len: 1.2, h: .35, legLen: .35, abdomen: 1.1, horn: 1, pincer: .8, dome: 1 }, behavior: 'charge' },
  { id: 'meganeura',         cls: 'insect', body: 'winged',   sil: { len: .7, wing: 1.8, tail: 1.3, hover: .8, legLen: .15, thin: 1, bands: 1 }, behavior: 'glide' },
  { id: 'sunbear',           cls: 'animal', body: 'quadlarge', sil: { len: 1, h: .5, legLen: .4, neck: .2, hump: .4, tail: 0, bulky: 1, chest: 1 }, behavior: 'ambush' },
  { id: 'cloudedleopard',    cls: 'animal', body: 'quadlarge', sil: { len: 1.2, h: .45, legLen: .4, neck: .3, tail: 1.1, sleek: 1, spots: 1 }, behavior: 'ambush' },
  { id: 'orangutan',         cls: 'animal', body: 'quadlarge', sil: { len: .9, h: .6, legLen: .4, neck: .2, arms: 1.3, hump: .3, tail: 0 }, behavior: 'wander' },
  { id: 'watermonitor',      cls: 'animal', body: 'reptile',  sil: { len: 1.3, h: .25, tail: 1.3, legLen: .35, snout: .5, spots: 1 }, behavior: 'lurk' },
  { id: 'dilophosaurus',     cls: 'dino',   body: 'biped',    sil: { len: 1.3, h: .55, tail: 1.3, neck: .6, head: .6, arms: .3, crest: .9 }, behavior: 'charge' },
  { id: 'gallimimus',        cls: 'dino',   body: 'biped',    sil: { len: 1.1, h: .65, tail: 1.2, neck: .9, head: .4, arms: .3, legLen: .7 }, behavior: 'flock' },
  { id: 'pachycephalosaurus', cls: 'dino',  body: 'biped',    sil: { len: 1.2, h: .55, tail: 1.1, neck: .4, head: .8, arms: .3, dome: 1 }, behavior: 'charge' },
  { id: 'dimorphodon',       cls: 'dino',   body: 'pterosaur', sil: { wing: 1.3, head: .8, crest: 0, tail: .9, hover: .7 }, behavior: 'glide' },
];
