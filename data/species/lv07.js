'use strict';
// Level 7: 1 insect, 4 animals, 5 dinosaurs.
PI.species.lv7 = [
  { id: 'meganeuropsis',  cls: 'insect', body: 'winged',   sil: { len: .8, wing: 2, tail: 1.4, hover: .9, legLen: .15, thin: 1, bands: 1 }, behavior: 'glide' },
  { id: 'saltwatercroc',  cls: 'animal', body: 'reptile',  sil: { len: 1.5, h: .25, tail: 1.3, legLen: .3, snout: .8, ridges: 1, bands: 1 }, behavior: 'ambush' },
  { id: 'tapir',          cls: 'animal', body: 'quadlarge', sil: { len: 1.1, h: .5, legLen: .4, neck: .3, snout: .5, trunk: .3, tail: .1, saddle: 1 }, behavior: 'wander' },
  { id: 'banteng',        cls: 'animal', body: 'quadlarge', sil: { len: 1.2, h: .55, legLen: .5, neck: .3, horn: .6, hump: .3, tail: .5, socks: 1 }, behavior: 'charge' },
  { id: 'python',         cls: 'animal', body: 'serpent',  sil: { len: 2.2, h: .2 }, behavior: 'lurk' },
  { id: 'carnotaurus',    cls: 'dino',   body: 'biped',    sil: { len: 1.4, h: .6, tail: 1.3, neck: .5, head: .7, arms: .1, horn: .6 }, behavior: 'charge' },
  { id: 'parasaurolophus', cls: 'dino',  body: 'biped',    sil: { len: 1.5, h: .66, tail: 1.3, neck: .85, head: .6, arms: .5, crest: 1.3, backCrest: 1 }, behavior: 'flock' },
  { id: 'styracosaurus',  cls: 'dino',   body: 'horned',   sil: { len: 1.2, h: .45, horns: 1, frill: 1, spikes: 1, beak: .4, tail: .6, noseHorn: 1 }, behavior: 'charge' },
  { id: 'pteranodon',     cls: 'dino',   body: 'pterosaur', sil: { wing: 1.9, head: 1, crest: 1, tail: .1, hover: .9 }, behavior: 'glide' },
  { id: 'baryonyx',       cls: 'dino',   body: 'biped',    sil: { len: 1.5, h: .55, tail: 1.4, neck: .6, head: .8, arms: .5, snout: 1, claw: 1, rings: 1 }, behavior: 'ambush' },
];
