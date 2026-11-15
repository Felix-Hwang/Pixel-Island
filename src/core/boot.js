'use strict';
// This file loads last. It fetches the language and the first map, sizes the view to fill the screen and opens
// the first screen.
(async () => {
  const G = PI.gfx, canvas = document.getElementById('c');
  G.init(canvas);
  // The view fills the whole window. Its scale is a whole number of device pixels per game pixel, chosen so the
  // shorter side shows about as many game pixels as the Zoom setting asks for, and never so small that the edge
  // of the map would show. On a small or low-density screen two settings can round to the same scale, so Near
  // and Far are kept at least one device pixel away from Normal.
  function fit() {
    const vw = Math.max(32, innerWidth), vh = Math.max(32, innerHeight), dpr = window.devicePixelRatio || 1; // a hidden tab reports 0
    const steps = key => Math.max(1, Math.round(Math.min(vw, vh) / PI.config.zoom[key] * dpr)); // device pixels per game pixel
    const zoom = PI.settings.get('zoom'), normal = steps('normal');
    let scale = (zoom === 'near' ? Math.max(steps('near'), normal + 1) : zoom === 'far' ? Math.max(1, Math.min(steps('far'), normal - 1)) : normal) / dpr;
    const least = Math.max(vw / G.MW, vh / G.MH);
    if (scale < least) scale = Math.ceil(least * dpr) / dpr;
    G.setView(Math.ceil(vw / scale) + 1, Math.ceil(vh / scale) + 1); // one spare pixel for smooth scrolling
    canvas.style.width = G.VW * scale + 'px';
    canvas.style.height = G.VH * scale + 'px';
    G.scale = scale;
    document.documentElement.classList.toggle('portrait', vh > vw);
  }
  PI.input.init();
  const first = PI.mapCycle.upcoming();
  // The language and the map come over the network together; a returning player has a language already.
  // Nothing can be shown without them, so a file that fails to arrive is asked for again until it does.
  const need = async fetchIt => { for (;;) { try { return await fetchIt(); } catch { await new Promise(done => setTimeout(done, 1500)); } } };
  await Promise.all([PI.lang() ? need(() => PI.needLang(PI.lang())) : null, need(() => PI.needMap(first))]);
  PI.game.loadMap(first);
  fit();
  G.toView();
  // The window changes size when a phone turns or its address bar slides away.
  addEventListener('resize', fit);
  if (window.visualViewport) visualViewport.addEventListener('resize', fit);
  document.addEventListener('pi:settings', e => { if (e.detail === 'zoom') fit(); });
  PI.state.phase = 'start';
  PI.loop.start();
  // On the first run the player chooses a language and then reaches the main menu. Later runs open the menu at once.
  if (PI.lang()) PI.ui.screens.show('title');
  else PI.ui.language.open(() => PI.ui.screens.show('title'));
})();
