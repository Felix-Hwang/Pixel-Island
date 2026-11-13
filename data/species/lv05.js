'use strict';
// Level 5: 2 insects, 5 animals, 3 dinosaurs.
PI.species.lv5 = [
  { id: 'herculesbeetle', cls: 'insect', body: 'hexapod',  sil: { len: 1.2, h: .35, legLen: .35, abdomen: 1.1, horn: 1.3, dome: 1 }, behavior: 'charge' },
  { id: 'gianthornet',    cls: 'insect', body: 'winged',   sil: { len: .9, wing: 1.1, tail: .8, hover: .6, legLen: .3, bands: 1 }, behavior: 'charge' },
  { id: 'macaque',        cls: 'animal', body: 'quadsmall', sil: { len: .9, h: .5, legLen: .5, tail: .6, head: 1.1, upright: .5, arms: 1, face: 1 }, behavior: 'erratic' },
  { id: 'otter',          cls: 'animal', body: 'quadsmall', sil: { len: 1.3, h: .3, legLen: .25, tail: .8, snout: .3, sleek: 1 }, behavior: 'wander' },
  { id: 'mousedeer',      cls: 'animal', body: 'quadlarge', sil: { len: .9, h: .55, legLen: .55, neck: .4, tail: .1, thin: 1 }, behavior: 'skittish' },
  { id: 'pangolin',       cls: 'animal', body: 'quadsmall', sil: { len: 1.2, h: .35, legLen: .25, tail: 1, snout: .5, scales: 1 }, behavior: 'wander' },
  { id: 'beardedpig',     cls: 'animal', body: 'quadlarge', sil: { len: 1.1, h: .45, legLen: .35, neck: .2, snout: .5, tail: .2 }, behavior: 'charge' },
  { id: 'velociraptor',   cls: 'dino',   body: 'biped',    sil: { len: 1.2, h: .5, tail: 1.3, neck: .5, head: .55, arms: .4, claw: 1, rings: 1 }, behavior: 'charge' },
  { id: 'protoceratops',  cls: 'dino',   body: 'horned',   sil: { len: 1.1, h: .4, horns: 0, frill: .7, beak: .5, tail: .7 }, behavior: 'wander' },
  { id: 'oviraptor',      cls: 'dino',   body: 'biped',    sil: { len: 1, h: .55, tail: .9, neck: .6, head: .5, arms: .4, crest: .6, rings: 1 }, behavior: 'erratic' },
];
