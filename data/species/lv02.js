'use strict';
// Level 2: 5 insects, 5 animals.
PI.species.lv2 = [
  { id: 'grasshopper', cls: 'insect', body: 'hexapod',  sil: { len: 1, h: .35, legLen: .4, hindLeg: 1, abdomen: 1, antenna: .9 }, behavior: 'erratic' },
  { id: 'dragonfly',   cls: 'insect', body: 'winged',   sil: { len: .6, wing: 1.3, tail: 1.1, hover: .7, legLen: .15, thin: 1, bands: 1 }, behavior: 'glide' },
  { id: 'stagbeetle',  cls: 'insect', body: 'hexapod',  sil: { len: 1, h: .3, legLen: .3, abdomen: 1.1, horn: .7, pincer: 1 }, behavior: 'charge' },
  { id: 'mantis',      cls: 'insect', body: 'hexapod',  sil: { len: 1.1, h: .5, legLen: .5, abdomen: .9, antenna: .5, raised: 1 }, behavior: 'ambush' },
  { id: 'cicada',      cls: 'insect', body: 'winged',   sil: { len: .8, wing: .8, tail: .3, hover: .3, legLen: .2, fat: 1 }, behavior: 'wander' },
  { id: 'mouse',       cls: 'animal', body: 'quadsmall', sil: { len: .9, h: .35, legLen: .3, tail: .9, snout: .3, ears: .4 }, behavior: 'skittish' },
  { id: 'sparrow',     cls: 'animal', body: 'bird',     sil: { len: .7, legLen: .3, beak: .25, neck: .15, tail: .5, hover: 0 }, behavior: 'flock' },
  { id: 'chameleon',   cls: 'animal', body: 'reptile',  sil: { len: .9, h: .4, tail: .8, legLen: .45, snout: .3, crest: .4, curl: 1, bands: 1 }, behavior: 'lurk' },
  { id: 'hermitcrab',  cls: 'animal', body: 'crustacean', sil: { len: .8, w: .7, claws: .5, legs: 6, shell: 1 }, behavior: 'wander' },
  { id: 'newt',        cls: 'animal', body: 'aquatic',  sil: { len: 1, h: .2, legs: 4, legLen: .25, tail: .9, eyes: 0, spots: 1 }, behavior: 'wander' },
];
