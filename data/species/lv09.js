'use strict';
// Level 9: 1 bug, 2 animals, 7 dinosaurs.
PI.species.lv9 = [
  { id: 'arthropleura',     cls: 'insect', body: 'worm',     sil: { len: 2.4, h: .25, segments: 12, legs: 1, w: .45 }, behavior: 'wander' },
  { id: 'paraceratherium',  cls: 'animal', body: 'quadlarge', sil: { len: 1.4, h: .75, legLen: .85, neck: 1.05, tail: .3, head: .7, snout: .5, thin: 0 }, behavior: 'wander' },
  { id: 'megatherium',      cls: 'animal', body: 'quadlarge', sil: { len: 1.1, h: .7, legLen: .45, neck: .25, hump: .9, tail: .9, bulky: 1, arms: 1.1, rear: 1, head: .85, snout: .4 }, behavior: 'wander' },
  { id: 'tyrannosaurus',    cls: 'dino',   body: 'biped',    sil: { len: 1.5, h: .72, tail: 1.2, neck: .35, head: 1.3, arms: .13, belly: 1 }, behavior: 'charge' },
  { id: 'spinosaurus',      cls: 'dino',   body: 'biped',    sil: { len: 1.8, h: .5, tail: 1.7, neck: .6, head: .85, arms: .5, claw: 1, snout: 1.2, sail: 1.5 }, behavior: 'ambush' },
  { id: 'giganotosaurus',   cls: 'dino',   body: 'biped',    sil: { len: 1.9, h: .66, tail: 2, neck: .9, head: .9, arms: .4, ridge: 1, rings: 1, horn: .8, snout: .4 }, behavior: 'charge' },
  { id: 'therizinosaurus',  cls: 'dino',   body: 'biped',    sil: { len: 1.2, h: .8, tail: .7, neck: 1.3, head: .35, arms: 1.2, claw: 2.2, belly: 1 }, behavior: 'wander' },
  { id: 'quetzalcoatlus',   cls: 'dino',   body: 'pterosaur', sil: { wing: 2.4, head: 1.3, crest: .6, tail: .1, hover: 1, neck: 1 }, behavior: 'glide' },
  { id: 'shantungosaurus',  cls: 'dino',   body: 'quaddino', sil: { len: 1.8, h: .65, tail: 1.6, neck: .7, legLen: .55, frontLow: 1, duckbill: 1, backRidge: 1.4 }, behavior: 'flock' },
  { id: 'amargasaurus',     cls: 'dino',   body: 'longneck', sil: { len: 1.4, h: .5, neck: 1, neckUp: .45, tail: 1.3, legLen: .45, spines: 1.6, whip: 1 }, behavior: 'wander' },
];
