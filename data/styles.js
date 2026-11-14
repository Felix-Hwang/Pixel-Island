'use strict';
// The temperament of every species on every map: passive, neutral or aggressive.
// What a temperament does is set in config.styles, and each map can change those numbers in its own `styles`.
PI.styles = {
  beach: {
    // level 1
    ant: 'passive', ladybug: 'neutral', housefly: 'aggressive', mosquito: 'neutral', termite: 'passive', weevil: 'passive', shrew: 'aggressive', treefrog: 'passive', gecko: 'aggressive', hummingbird: 'passive',
    // level 2
    grasshopper: 'aggressive', dragonfly: 'aggressive', stagbeetle: 'neutral', mantis: 'neutral', cicada: 'neutral', mouse: 'passive', sparrow: 'passive', chameleon: 'passive', hermitcrab: 'aggressive', newt: 'neutral',
    // level 3
    rhinobeetle: 'aggressive', atlasmoth: 'aggressive', hornet: 'aggressive', waterbug: 'neutral', rat: 'neutral', kingfisher: 'aggressive', mudskipper: 'neutral', squirrel: 'neutral', tarsier: 'aggressive', compsognathus: 'aggressive',
    // level 4
    goliathbeetle: 'neutral', stickinsect: 'passive', titanbeetle: 'neutral', slowloris: 'neutral', mongoose: 'aggressive', colugo: 'passive', civet: 'passive', hornbill: 'passive', microraptor: 'passive', psittacosaurus: 'neutral',
    // level 5
    herculesbeetle: 'aggressive', gianthornet: 'passive', macaque: 'aggressive', otter: 'passive', mousedeer: 'aggressive', pangolin: 'passive', beardedpig: 'passive', velociraptor: 'neutral', protoceratops: 'aggressive', oviraptor: 'passive',
    // level 6
    atlasbeetle: 'passive', meganeura: 'neutral', sunbear: 'neutral', cloudedleopard: 'neutral', orangutan: 'neutral', watermonitor: 'aggressive', dilophosaurus: 'passive', gallimimus: 'neutral', pachycephalosaurus: 'aggressive', dimorphodon: 'aggressive',
    // level 7
    meganeuropsis: 'aggressive', saltwatercroc: 'aggressive', tapir: 'neutral', banteng: 'passive', python: 'neutral', carnotaurus: 'passive', parasaurolophus: 'neutral', styracosaurus: 'neutral', pteranodon: 'neutral', baryonyx: 'neutral',
    // level 8
    gigatitan: 'aggressive', elephant: 'neutral', sumatranrhino: 'passive', gaur: 'neutral', allosaurus: 'neutral', stegosaurus: 'neutral', triceratops: 'aggressive', iguanodon: 'neutral', ankylosaurus: 'aggressive', kentrosaurus: 'neutral',
    // level 9
    arthropleura: 'neutral', paraceratherium: 'passive', megatherium: 'aggressive', tyrannosaurus: 'neutral', spinosaurus: 'aggressive', giganotosaurus: 'passive', therizinosaurus: 'aggressive', quetzalcoatlus: 'passive', shantungosaurus: 'aggressive', amargasaurus: 'neutral',
    // level 10
    palaeoloxodon: 'aggressive', deinotherium: 'passive', elasmotherium: 'neutral', brachiosaurus: 'aggressive', argentinosaurus: 'neutral', diplodocus: 'neutral', apatosaurus: 'passive', mamenchisaurus: 'passive', dreadnoughtus: 'aggressive', patagotitan: 'neutral',
  },
  market: {
    // level 1
    ant: 'aggressive', ladybug: 'neutral', housefly: 'aggressive', mosquito: 'aggressive', termite: 'neutral', weevil: 'aggressive', shrew: 'aggressive', treefrog: 'neutral', gecko: 'aggressive', hummingbird: 'passive',
    // level 2
    grasshopper: 'aggressive', dragonfly: 'passive', stagbeetle: 'neutral', mantis: 'neutral', cicada: 'aggressive', mouse: 'passive', sparrow: 'aggressive', chameleon: 'aggressive', hermitcrab: 'neutral', newt: 'aggressive',
    // level 3
    rhinobeetle: 'passive', atlasmoth: 'neutral', hornet: 'neutral', waterbug: 'neutral', rat: 'aggressive', kingfisher: 'neutral', mudskipper: 'passive', squirrel: 'passive', tarsier: 'neutral', compsognathus: 'neutral',
    // level 4
    goliathbeetle: 'passive', stickinsect: 'neutral', titanbeetle: 'neutral', slowloris: 'aggressive', mongoose: 'aggressive', colugo: 'neutral', civet: 'neutral', hornbill: 'aggressive', microraptor: 'passive', psittacosaurus: 'passive',
    // level 5
    herculesbeetle: 'neutral', gianthornet: 'aggressive', macaque: 'aggressive', otter: 'passive', mousedeer: 'passive', pangolin: 'neutral', beardedpig: 'neutral', velociraptor: 'neutral', protoceratops: 'neutral', oviraptor: 'aggressive',
    // level 6
    atlasbeetle: 'passive', meganeura: 'passive', sunbear: 'passive', cloudedleopard: 'aggressive', orangutan: 'neutral', watermonitor: 'neutral', dilophosaurus: 'neutral', gallimimus: 'neutral', pachycephalosaurus: 'neutral', dimorphodon: 'neutral',
    // level 7
    meganeuropsis: 'neutral', saltwatercroc: 'passive', tapir: 'neutral', banteng: 'neutral', python: 'aggressive', carnotaurus: 'aggressive', parasaurolophus: 'neutral', styracosaurus: 'neutral', pteranodon: 'aggressive', baryonyx: 'neutral',
    // level 8
    gigatitan: 'neutral', elephant: 'passive', sumatranrhino: 'passive', gaur: 'aggressive', allosaurus: 'neutral', stegosaurus: 'aggressive', triceratops: 'neutral', iguanodon: 'aggressive', ankylosaurus: 'neutral', kentrosaurus: 'neutral',
    // level 9
    arthropleura: 'neutral', paraceratherium: 'neutral', megatherium: 'aggressive', tyrannosaurus: 'neutral', spinosaurus: 'neutral', giganotosaurus: 'aggressive', therizinosaurus: 'passive', quetzalcoatlus: 'passive', shantungosaurus: 'neutral', amargasaurus: 'passive',
    // level 10
    palaeoloxodon: 'neutral', deinotherium: 'neutral', elasmotherium: 'aggressive', brachiosaurus: 'neutral', argentinosaurus: 'passive', diplodocus: 'neutral', apatosaurus: 'passive', mamenchisaurus: 'aggressive', dreadnoughtus: 'neutral', patagotitan: 'aggressive',
  },
  islands: {
    // level 1
    ant: 'passive', ladybug: 'passive', housefly: 'passive', mosquito: 'aggressive', termite: 'passive', weevil: 'neutral', shrew: 'aggressive', treefrog: 'neutral', gecko: 'passive', hummingbird: 'passive',
    // level 2
    grasshopper: 'passive', dragonfly: 'passive', stagbeetle: 'neutral', mantis: 'passive', cicada: 'passive', mouse: 'neutral', sparrow: 'aggressive', chameleon: 'aggressive', hermitcrab: 'passive', newt: 'passive',
    // level 3
    rhinobeetle: 'passive', atlasmoth: 'aggressive', hornet: 'neutral', waterbug: 'neutral', rat: 'passive', kingfisher: 'passive', mudskipper: 'passive', squirrel: 'passive', tarsier: 'passive', compsognathus: 'aggressive',
    // level 4
    goliathbeetle: 'passive', stickinsect: 'neutral', titanbeetle: 'passive', slowloris: 'neutral', mongoose: 'aggressive', colugo: 'neutral', civet: 'neutral', hornbill: 'neutral', microraptor: 'passive', psittacosaurus: 'neutral',
    // level 5
    herculesbeetle: 'aggressive', gianthornet: 'aggressive', macaque: 'aggressive', otter: 'passive', mousedeer: 'aggressive', pangolin: 'passive', beardedpig: 'passive', velociraptor: 'aggressive', protoceratops: 'passive', oviraptor: 'aggressive',
    // level 6
    atlasbeetle: 'passive', meganeura: 'neutral', sunbear: 'passive', cloudedleopard: 'passive', orangutan: 'neutral', watermonitor: 'neutral', dilophosaurus: 'neutral', gallimimus: 'passive', pachycephalosaurus: 'aggressive', dimorphodon: 'aggressive',
    // level 7
    meganeuropsis: 'aggressive', saltwatercroc: 'passive', tapir: 'passive', banteng: 'passive', python: 'aggressive', carnotaurus: 'passive', parasaurolophus: 'neutral', styracosaurus: 'neutral', pteranodon: 'passive', baryonyx: 'aggressive',
    // level 8
    gigatitan: 'passive', elephant: 'aggressive', sumatranrhino: 'neutral', gaur: 'passive', allosaurus: 'passive', stegosaurus: 'passive', triceratops: 'aggressive', iguanodon: 'neutral', ankylosaurus: 'neutral', kentrosaurus: 'aggressive',
    // level 9
    arthropleura: 'aggressive', paraceratherium: 'passive', megatherium: 'passive', tyrannosaurus: 'neutral', spinosaurus: 'passive', giganotosaurus: 'neutral', therizinosaurus: 'passive', quetzalcoatlus: 'neutral', shantungosaurus: 'neutral', amargasaurus: 'aggressive',
    // level 10
    palaeoloxodon: 'aggressive', deinotherium: 'passive', elasmotherium: 'passive', brachiosaurus: 'passive', argentinosaurus: 'passive', diplodocus: 'aggressive', apatosaurus: 'passive', mamenchisaurus: 'passive', dreadnoughtus: 'neutral', patagotitan: 'passive',
  },
  swamp: {
    // level 1
    ant: 'aggressive', ladybug: 'aggressive', housefly: 'neutral', mosquito: 'neutral', termite: 'passive', weevil: 'passive', shrew: 'neutral', treefrog: 'passive', gecko: 'aggressive', hummingbird: 'neutral',
    // level 2
    grasshopper: 'passive', dragonfly: 'neutral', stagbeetle: 'neutral', mantis: 'neutral', cicada: 'neutral', mouse: 'aggressive', sparrow: 'neutral', chameleon: 'neutral', hermitcrab: 'passive', newt: 'aggressive',
    // level 3
    rhinobeetle: 'aggressive', atlasmoth: 'passive', hornet: 'passive', waterbug: 'passive', rat: 'neutral', kingfisher: 'aggressive', mudskipper: 'neutral', squirrel: 'passive', tarsier: 'passive', compsognathus: 'aggressive',
    // level 4
    goliathbeetle: 'aggressive', stickinsect: 'aggressive', titanbeetle: 'neutral', slowloris: 'aggressive', mongoose: 'aggressive', colugo: 'neutral', civet: 'passive', hornbill: 'neutral', microraptor: 'passive', psittacosaurus: 'aggressive',
    // level 5
    herculesbeetle: 'passive', gianthornet: 'neutral', macaque: 'passive', otter: 'neutral', mousedeer: 'neutral', pangolin: 'passive', beardedpig: 'aggressive', velociraptor: 'passive', protoceratops: 'passive', oviraptor: 'passive',
    // level 6
    atlasbeetle: 'aggressive', meganeura: 'neutral', sunbear: 'aggressive', cloudedleopard: 'neutral', orangutan: 'aggressive', watermonitor: 'neutral', dilophosaurus: 'neutral', gallimimus: 'neutral', pachycephalosaurus: 'passive', dimorphodon: 'passive',
    // level 7
    meganeuropsis: 'aggressive', saltwatercroc: 'passive', tapir: 'passive', banteng: 'aggressive', python: 'neutral', carnotaurus: 'aggressive', parasaurolophus: 'aggressive', styracosaurus: 'aggressive', pteranodon: 'aggressive', baryonyx: 'neutral',
    // level 8
    gigatitan: 'passive', elephant: 'aggressive', sumatranrhino: 'passive', gaur: 'neutral', allosaurus: 'aggressive', stegosaurus: 'aggressive', triceratops: 'passive', iguanodon: 'neutral', ankylosaurus: 'aggressive', kentrosaurus: 'passive',
    // level 9
    arthropleura: 'passive', paraceratherium: 'neutral', megatherium: 'neutral', tyrannosaurus: 'neutral', spinosaurus: 'passive', giganotosaurus: 'neutral', therizinosaurus: 'passive', quetzalcoatlus: 'neutral', shantungosaurus: 'passive', amargasaurus: 'neutral',
    // level 10
    palaeoloxodon: 'neutral', deinotherium: 'neutral', elasmotherium: 'neutral', brachiosaurus: 'neutral', argentinosaurus: 'neutral', diplodocus: 'neutral', apatosaurus: 'passive', mamenchisaurus: 'neutral', dreadnoughtus: 'passive', patagotitan: 'passive',
  },
  mountain: {
    // level 1
    ant: 'neutral', ladybug: 'aggressive', housefly: 'aggressive', mosquito: 'aggressive', termite: 'neutral', weevil: 'passive', shrew: 'neutral', treefrog: 'neutral', gecko: 'neutral', hummingbird: 'neutral',
    // level 2
    grasshopper: 'neutral', dragonfly: 'neutral', stagbeetle: 'neutral', mantis: 'passive', cicada: 'neutral', mouse: 'neutral', sparrow: 'neutral', chameleon: 'aggressive', hermitcrab: 'passive', newt: 'passive',
    // level 3
    rhinobeetle: 'neutral', atlasmoth: 'neutral', hornet: 'passive', waterbug: 'neutral', rat: 'neutral', kingfisher: 'neutral', mudskipper: 'aggressive', squirrel: 'neutral', tarsier: 'neutral', compsognathus: 'passive',
    // level 4
    goliathbeetle: 'neutral', stickinsect: 'neutral', titanbeetle: 'neutral', slowloris: 'neutral', mongoose: 'neutral', colugo: 'neutral', civet: 'neutral', hornbill: 'neutral', microraptor: 'aggressive', psittacosaurus: 'passive',
    // level 5
    herculesbeetle: 'aggressive', gianthornet: 'passive', macaque: 'neutral', otter: 'aggressive', mousedeer: 'passive', pangolin: 'aggressive', beardedpig: 'neutral', velociraptor: 'neutral', protoceratops: 'neutral', oviraptor: 'aggressive',
    // level 6
    atlasbeetle: 'passive', meganeura: 'passive', sunbear: 'passive', cloudedleopard: 'neutral', orangutan: 'passive', watermonitor: 'neutral', dilophosaurus: 'aggressive', gallimimus: 'aggressive', pachycephalosaurus: 'neutral', dimorphodon: 'passive',
    // level 7
    meganeuropsis: 'neutral', saltwatercroc: 'passive', tapir: 'neutral', banteng: 'passive', python: 'neutral', carnotaurus: 'aggressive', parasaurolophus: 'neutral', styracosaurus: 'aggressive', pteranodon: 'aggressive', baryonyx: 'passive',
    // level 8
    gigatitan: 'neutral', elephant: 'passive', sumatranrhino: 'aggressive', gaur: 'aggressive', allosaurus: 'neutral', stegosaurus: 'aggressive', triceratops: 'neutral', iguanodon: 'aggressive', ankylosaurus: 'neutral', kentrosaurus: 'neutral',
    // level 9
    arthropleura: 'aggressive', paraceratherium: 'neutral', megatherium: 'passive', tyrannosaurus: 'passive', spinosaurus: 'aggressive', giganotosaurus: 'aggressive', therizinosaurus: 'aggressive', quetzalcoatlus: 'neutral', shantungosaurus: 'neutral', amargasaurus: 'passive',
    // level 10
    palaeoloxodon: 'aggressive', deinotherium: 'neutral', elasmotherium: 'neutral', brachiosaurus: 'neutral', argentinosaurus: 'neutral', diplodocus: 'neutral', apatosaurus: 'neutral', mamenchisaurus: 'passive', dreadnoughtus: 'aggressive', patagotitan: 'aggressive',
  },
};
