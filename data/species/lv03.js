'use strict';
// Level 3: 4 insects, 5 animals, 1 dinosaur.
PI.species.lv3 = [
  { id: 'rhinobeetle',   cls: 'insect', body: 'hexapod',  sil: { len: 1, h: .35, legLen: .3, abdomen: 1.2, horn: 1, dome: 1 }, behavior: 'charge' },
  { id: 'atlasmoth',     cls: 'insect', body: 'winged',   sil: { len: .6, wing: 1.6, tail: .4, hover: .4, legLen: .1, broad: 1 }, behavior: 'glide' },
  { id: 'hornet',        cls: 'insect', body: 'winged',   sil: { len: .8, wing: .9, tail: .7, hover: .6, legLen: .25, bands: 1 }, behavior: 'charge' },
  { id: 'waterbug',      cls: 'insect', body: 'hexapod',  sil: { len: 1.1, h: .2, legLen: .45, abdomen: 1.2, flat: 1, antenna: .1 }, behavior: 'ambush' },
  { id: 'rat',           cls: 'animal', body: 'quadsmall', sil: { len: 1.1, h: .35, legLen: .3, tail: 1.1, snout: .4, ears: .3 }, behavior: 'erratic' },
  { id: 'kingfisher',    cls: 'animal', body: 'bird',     sil: { len: .7, legLen: .2, beak: .7, neck: .15, tail: .3, hover: .2, crest: .3 }, behavior: 'glide' },
  { id: 'mudskipper',    cls: 'animal', body: 'aquatic',  sil: { len: 1, h: .25, legs: 2, legLen: .3, tail: .5, eyes: 1, fin: .6, spots: 1 }, behavior: 'erratic' },
  { id: 'squirrel',      cls: 'animal', body: 'quadsmall', sil: { len: .9, h: .4, legLen: .3, tail: 1, bushy: 1, ears: .3, snout: .25 }, behavior: 'skittish' },
  { id: 'tarsier',       cls: 'animal', body: 'quadsmall', sil: { len: .6, h: .5, legLen: .5, tail: 1.1, ears: .5, head: 1.3, upright: 1, face: 1 }, behavior: 'lurk' },
  { id: 'compsognathus', cls: 'dino',   body: 'biped',    sil: { len: 1.1, h: .45, tail: 1.1, neck: .5, head: .5, arms: .2, rings: 1 }, behavior: 'flock' },
];
