'use strict';
// Level 9: 1 bug, 2 animals, 7 dinosaurs.
PI.species.lv9 = [
  { id: 'arthropleura',     cls: 'insect', body: 'worm',     sil: { len: 2.4, h: .25, segments: 12, legs: 1, w: .45 }, behavior: 'wander' },
  { id: 'paraceratherium',  cls: 'animal', body: 'quadlarge', sil: { len: 1.4, h: .75, legLen: .7, neck: .8, tail: .3, head: .6 }, behavior: 'wander' },
  { id: 'megatherium',      cls: 'animal', body: 'quadlarge', sil: { len: 1.2, h: .7, legLen: .5, neck: .3, hump: .8, tail: .6, bulky: 1, arms: .8 }, behavior: 'wander' },
  { id: 'tyrannosaurus',    cls: 'dino',   body: 'biped',    sil: { len: 1.6, h: .7, tail: 1.5, neck: .5, head: 1, arms: .15 }, behavior: 'charge' },
  { id: 'spinosaurus',      cls: 'dino',   body: 'biped',    sil: { len: 1.7, h: .55, tail: 1.6, neck: .6, head: .9, arms: .4, snout: 1, sail: 1 }, behavior: 'ambush' },
  { id: 'giganotosaurus',   cls: 'dino',   body: 'biped',    sil: { len: 1.7, h: .7, tail: 1.6, neck: .75, head: .85, arms: .4, ridge: 1, rings: 1 }, behavior: 'charge' },
  { id: 'therizinosaurus',  cls: 'dino',   body: 'biped',    sil: { len: 1.3, h: .75, tail: .9, neck: 1, head: .4, arms: 1, claw: 1.5, belly: 1 }, behavior: 'wander' },
  { id: 'quetzalcoatlus',   cls: 'dino',   body: 'pterosaur', sil: { wing: 2.4, head: 1.3, crest: .6, tail: .1, hover: 1, neck: 1 }, behavior: 'glide' },
  { id: 'shantungosaurus',  cls: 'dino',   body: 'quaddino', sil: { len: 1.7, h: .65, tail: 1.5, neck: .7, legLen: .55, frontLow: 1, duckbill: 1 }, behavior: 'flock' },
  { id: 'amargasaurus',     cls: 'dino',   body: 'longneck', sil: { len: 1.5, h: .5, neck: .9, tail: 1.3, legLen: .45, spines: 1 }, behavior: 'wander' },
];
