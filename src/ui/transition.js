'use strict';
// A change of scene: the picture closes to black, the scene changes while nothing can be seen, and the new one
// opens. One of three curtains is picked at random (see Fx.curtain). People who asked for less motion get the
// plain fade, which has no movement in it.
(() => {
  const KINDS = ['fade', 'iris', 'blinds'], CLOSE = 380, HOLD = 140, OPEN = 480;
  const ease = t => t * t * (3 - 2 * t);
  let busy = false;
  // Frames drive the picture, but a timer ends the step, so a tab that is not being painted cannot stall a change of scene.
  const run = (ms, each) => new Promise(done => {
    const from = performance.now();
    let over = false;
    const step = now => { if (over) return; each(Math.min(1, (now - from) / ms)); requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(() => { over = true; each(1); done(); }, ms);
  });
  // change() runs while the screen is black and may be async (it may have to fetch a map). The curtain opens
  // again even if change() fails, so an error can never leave the screen black.
  PI.ui.transition = async change => {
    if (busy) { await change(); return; }
    busy = true;
    const Fx = PI.fx, kind = PI.gfx.still() ? 'fade' : KINDS[Math.random() * KINDS.length | 0];
    document.body.classList.add('switching');
    try {
      await run(CLOSE, u => Fx.curtain(kind, ease(u)));
      await change();
      await run(HOLD, () => Fx.curtain(kind, 1));
    } catch (error) {
      console.error(error);
    } finally {
      await run(OPEN, u => Fx.curtain(kind, 1 - ease(u)));
      Fx.curtain(kind, 0);
      document.body.classList.remove('switching');
      busy = false;
    }
  };
})();
