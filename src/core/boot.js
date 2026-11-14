'use strict';
// This file loads last. It bakes the first map, sizes the view to fill the screen and opens the first screen.
(() => {
  const G = PI.gfx, canvas = document.getElementById('c');
  G.init(canvas);
  // The view fills the whole window. Its scale is a whole number of device pixels per game pixel, chosen so the
  // shorter side shows about as many game pixels as the Zoom setting asks for, and never so small that the edge
  // of the map would show.
  function fit() {
    const vw = Math.max(32, innerWidth), vh = Math.max(32, innerHeight), dpr = window.devicePixelRatio || 1; // a hidden tab reports 0
    const short = PI.config.zoom[PI.settings.get('zoom')];
    let scale = Math.max(1, Math.round(Math.min(vw, vh) / short * dpr) / dpr);
    const least = Math.max(vw / G.MW, vh / G.MH);
    if (scale < least) scale = Math.ceil(least * dpr) / dpr;
    G.setView(Math.ceil(vw / scale), Math.ceil(vh / scale));
    canvas.style.width = G.VW * scale + 'px';
    canvas.style.height = G.VH * scale + 'px';
    G.scale = scale;
    document.documentElement.classList.toggle('portrait', vh > vw);
  }
  PI.input.init();
  PI.game.loadMap(PI.mapCycle.upcoming());
  fit();
  G.toView();
  addEventListener('resize', fit);
  document.addEventListener('pi:settings', e => { if (e.detail === 'zoom') fit(); });
  PI.state.phase = 'start';
  PI.loop.start();
  // The first run goes: choose a language, read how to play, main menu. Later runs open the main menu at once.
  if (PI.lang()) PI.ui.screens.show('title');
  else PI.ui.language.open(() => PI.ui.screens.show('guide', { first: true }));
})();
