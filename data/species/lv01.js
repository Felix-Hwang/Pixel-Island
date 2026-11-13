'use strict';
// Level 1: 6 insects, 4 animals. Names live in data/i18n/species/*.js; speeds in data/speeds.js.
// sil: silhouette variables read by the body template (src/creatures/bodies/<body>.js). Values are relative to the level size.
PI.species.lv1 = [
  { id: 'ant',         cls: 'insect', body: 'hexapod',  sil: { len: .9, h: .3, legLen: .35, abdomen: 1.1, antenna: .7 }, behavior: 'flock' },
  { id: 'ladybug',     cls: 'insect', body: 'hexapod',  sil: { len: .8, h: .25, legLen: .2, abdomen: 1.4, dome: 1, antenna: .2, spots: 1 }, behavior: 'wander' },
  { id: 'housefly',    cls: 'insect', body: 'winged',   sil: { len: .6, wing: .9, tail: .4, hover: .5, legLen: .15 }, behavior: 'erratic' },
  { id: 'mosquito',    cls: 'insect', body: 'winged',   sil: { len: .5, wing: .7, tail: .6, hover: .8, legLen: .5, thin: 1 }, behavior: 'erratic' },
  { id: 'termite',     cls: 'insect', body: 'hexapod',  sil: { len: 1.05, h: .25, legLen: .25, abdomen: .95, antenna: .6 }, behavior: 'flock' },
  { id: 'weevil',      cls: 'insect', body: 'hexapod',  sil: { len: .8, h: .3, legLen: .3, abdomen: 1, snout: .6, antenna: .3 }, behavior: 'wander' },
  { id: 'shrew',       cls: 'animal', body: 'quadsmall', sil: { len: .9, h: .3, legLen: .25, tail: .6, snout: .5, ears: .1 }, behavior: 'skittish' },
  { id: 'treefrog',    cls: 'animal', body: 'aquatic',  sil: { len: .7, h: .35, legs: 4, legLen: .5, tail: 0, eyes: 1 }, behavior: 'erratic' },
  { id: 'gecko',       cls: 'animal', body: 'reptile',  sil: { len: .9, h: .2, tail: .9, legLen: .3, snout: .3, rings: 1 }, behavior: 'skittish' },
  { id: 'hummingbird', cls: 'animal', body: 'bird',     sil: { len: .5, legLen: .1, beak: .6, neck: .1, tail: .4, hover: .7, wing: .8 }, behavior: 'glide' },
];
