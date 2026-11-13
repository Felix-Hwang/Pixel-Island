'use strict';
// Level 4: 3 insects, 5 animals, 2 dinosaurs.
PI.species.lv4 = [
  { id: 'goliathbeetle', cls: 'insect', body: 'hexapod',  sil: { len: 1.1, h: .35, legLen: .3, abdomen: 1.3, dome: 1, antenna: .2, bands: 1 }, behavior: 'wander' },
  { id: 'stickinsect',   cls: 'insect', body: 'hexapod',  sil: { len: 1.5, h: .4, legLen: .7, abdomen: 1, thin: 1, antenna: .9 }, behavior: 'lurk' },
  { id: 'titanbeetle',   cls: 'insect', body: 'hexapod',  sil: { len: 1.3, h: .3, legLen: .35, abdomen: 1.1, pincer: .6, antenna: .5 }, behavior: 'charge' },
  { id: 'slowloris',     cls: 'animal', body: 'quadsmall', sil: { len: .8, h: .5, legLen: .5, tail: .1, head: 1.2, ears: .1, upright: 1, face: 1 }, behavior: 'lurk' },
  { id: 'mongoose',      cls: 'animal', body: 'quadsmall', sil: { len: 1.2, h: .3, legLen: .3, tail: .7, snout: .4, ears: .15 }, behavior: 'charge' },
  { id: 'colugo',        cls: 'animal', body: 'quadsmall', sil: { len: .9, h: .3, legLen: .4, tail: .5, membrane: 1, head: .9 }, behavior: 'glide' },
  { id: 'civet',         cls: 'animal', body: 'quadsmall', sil: { len: 1.2, h: .42, legLen: .35, tail: 1.3, snout: .4, ears: .4, rings: 1, spots: 1 }, behavior: 'wander' },
  { id: 'hornbill',      cls: 'animal', body: 'bird',     sil: { len: .9, legLen: .3, beak: 1, neck: .3, tail: .7, hover: 0, casque: 1 }, behavior: 'glide' },
  { id: 'microraptor',   cls: 'dino',   body: 'biped',    sil: { len: 1, h: .45, tail: 1.1, neck: .4, head: .4, arms: .6, wings: 1 }, behavior: 'glide' },
  { id: 'psittacosaurus', cls: 'dino',  body: 'horned',   sil: { len: 1, h: .4, horns: 0, frill: .2, beak: .5, tail: .8 }, behavior: 'flock' },
];
