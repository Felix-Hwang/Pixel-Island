'use strict';
// Top speed of every species in px/s. Starting values are (95 + level x 9) x a factor of 0.8 to 1.25;
// edit a number here to rebalance one species. Fast species need one more food to evolve, slow ones one less.
PI.speeds = {
  // level 1 (mean 104)
  ant: 104, ladybug: 88, housefly: 125, mosquito: 114, termite: 94, weevil: 83, shrew: 120, treefrog: 104, gecko: 114, hummingbird: 130,
  // level 2 (mean 113)
  grasshopper: 124, dragonfly: 141, stagbeetle: 96, mantis: 102, cicada: 107, mouse: 130, sparrow: 124, chameleon: 90, hermitcrab: 90, newt: 102,
  // level 3 (mean 122)
  rhinobeetle: 104, atlasmoth: 116, hornet: 146, waterbug: 110, rat: 140, kingfisher: 153, mudskipper: 116, squirrel: 140, tarsier: 122, compsognathus: 146,
  // level 4 (mean 131)
  goliathbeetle: 111, stickinsect: 105, titanbeetle: 124, slowloris: 105, mongoose: 157, colugo: 138, civet: 138, hornbill: 144, microraptor: 157, psittacosaurus: 131,
  // level 5 (mean 140)
  herculesbeetle: 119, gianthornet: 168, macaque: 154, otter: 147, mousedeer: 168, pangolin: 112, beardedpig: 140, velociraptor: 175, protoceratops: 126, oviraptor: 154,
  // level 6 (mean 149)
  atlasbeetle: 127, meganeura: 179, sunbear: 142, cloudedleopard: 179, orangutan: 127, watermonitor: 149, dilophosaurus: 164, gallimimus: 186, pachycephalosaurus: 149, dimorphodon: 171,
  // level 7 (mean 158)
  meganeuropsis: 190, saltwatercroc: 142, tapir: 150, banteng: 166, python: 126, carnotaurus: 190, parasaurolophus: 158, styracosaurus: 150, pteranodon: 190, baryonyx: 166,
  // level 8 (mean 167)
  gigatitan: 184, elephant: 150, sumatranrhino: 167, gaur: 175, allosaurus: 192, stegosaurus: 134, triceratops: 159, iguanodon: 167, ankylosaurus: 134, kentrosaurus: 142,
  // level 9 (mean 176)
  arthropleura: 150, paraceratherium: 167, megatherium: 141, tyrannosaurus: 194, spinosaurus: 176, giganotosaurus: 202, therizinosaurus: 158, quetzalcoatlus: 220, shantungosaurus: 167, amargasaurus: 158,
  // level 10 (mean 185)
  palaeoloxodon: 176, deinotherium: 167, elasmotherium: 194, brachiosaurus: 157, argentinosaurus: 148, diplodocus: 167, apatosaurus: 157, mamenchisaurus: 167, dreadnoughtus: 157, patagotitan: 148,
};
