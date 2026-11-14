'use strict';
// The maps and the terrain effects of each, by file name. Map files are loaded when a round needs them
// (PI.needMap), so this list is what the menus and the map picker know before that.
PI.mapParts = {
  beach: ['wave', 'coconut-fall', 'parasol', 'beach-bar', 'tide-pool'],
  market: ['food-stall', 'handcart', 'alley', 'awning-bounce', 'hawker'],
  islands: ['current', 'tide', 'pearl-clam', 'jellyfish', 'boat-ride'],
  swamp: ['firefly', 'mud-pit', 'rotten-bridge', 'tree-rest', 'slippery-mud'],
  mountain: ['cloud-platform', 'granite-wall', 'fog', 'high-altitude', 'summit-flag'],
};
PI.mapOrder = Object.keys(PI.mapParts);
