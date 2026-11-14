'use strict';
// The seven body colours. Only the base RGB is defined; the renderer derives the five-tone ramp.
// Colour only changes how a creature looks. It never changes speed, level or behaviour.
// Every creature is painted with five materials made from its body colour:
//   body   the colour itself            dark   legs, wing bones, frills
//   light  belly, wing membranes        bone   horns, claws, tusks, beaks, shells (the same ivory for every colour)
//   ink    stripes, spots, hooves
(() => {
  const rgb = {
    red: [214, 64, 56], orange: [236, 136, 50], yellow: [238, 204, 68], green: [86, 168, 80],
    blue: [64, 132, 214], indigo: [70, 78, 168], violet: [156, 88, 192],
  };
  const CREAM = [255, 244, 214], BONE = [240, 230, 206], SHADE = [46, 44, 70], SHADE_DARK = [36, 34, 58];
  const order = Object.keys(rgb), mats = {};
  for (const key of order) {
    const c = rgb[key];
    mats[key] = {
      body: c,
      dark: c.map(v => Math.round(v * .72)),
      light: c.map((v, i) => Math.round(v + (CREAM[i] - v) * .55)),
      bone: BONE,
      ink: c.map(v => Math.round(v * .38 + 14)),
    };
  }
  PI.palette = {
    order, rgb, mats,
    // outside the light on the night map every material is drawn in these two dark tones
    dim: { body: SHADE, dark: SHADE_DARK, light: SHADE, bone: SHADE, ink: SHADE_DARK },
    // a body made of light, shown for a moment while a creature changes shape
    flash: { body: [255, 250, 226], dark: [255, 238, 190], light: [255, 255, 246], bone: [255, 255, 246], ink: [250, 226, 170] },
    random: () => order[Math.random() * order.length | 0],
  };
})();
