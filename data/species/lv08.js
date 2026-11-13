'use strict';
// Level 8: 1 insect, 3 animals, 6 dinosaurs.
PI.species.lv8 = [
  { id: 'gigatitan',     cls: 'insect', body: 'winged',   sil: { len: 1, wing: 1.6, tail: 1, hover: .3, legLen: .4, hindLeg: 1 }, behavior: 'glide' },
  { id: 'elephant',      cls: 'animal', body: 'quadlarge', sil: { len: 1.2, h: .6, legLen: .55, neck: .1, trunk: 1, ears: 1, tusk: .4, tail: .4, bulky: 1 }, behavior: 'wander' },
  { id: 'sumatranrhino', cls: 'animal', body: 'quadlarge', sil: { len: 1.2, h: .5, legLen: .4, neck: .2, horn: .5, noseHorn: 1, tail: .2, bulky: 1 }, behavior: 'charge' },
  { id: 'gaur',          cls: 'animal', body: 'quadlarge', sil: { len: 1.3, h: .6, legLen: .5, neck: .3, horn: .8, hump: .6, tail: .5, socks: 1 }, behavior: 'charge' },
  { id: 'allosaurus',    cls: 'dino',   body: 'biped',    sil: { len: 1.5, h: .65, tail: 1.5, neck: .6, head: .8, arms: .35, horn: .3, rings: 1 }, behavior: 'charge' },
  { id: 'stegosaurus',   cls: 'dino',   body: 'quaddino', sil: { len: 1.4, h: .5, tail: 1.1, plates: 1, spikes: 1, neck: .3, legLen: .4, arch: 1 }, behavior: 'wander' },
  { id: 'triceratops',   cls: 'dino',   body: 'horned',   sil: { len: 1.4, h: .5, horns: 1.2, frill: 1.1, beak: .5, tail: .6, noseHorn: .5 }, behavior: 'charge' },
  { id: 'iguanodon',     cls: 'dino',   body: 'quaddino', sil: { len: 1.4, h: .55, tail: 1.3, neck: .6, legLen: .5, frontLow: 1, thumb: 1 }, behavior: 'flock' },
  { id: 'ankylosaurus',  cls: 'dino',   body: 'quaddino', sil: { len: 1.5, h: .4, tail: 1, club: 1, wide: 1, neck: .2, legLen: .3, spikes: .5 }, behavior: 'wander' },
  { id: 'kentrosaurus',  cls: 'dino',   body: 'quaddino', sil: { len: 1.3, h: .45, tail: 1.2, plates: .6, spikes: 1.3, neck: .3, legLen: .35, arch: .6 }, behavior: 'wander' },
];
