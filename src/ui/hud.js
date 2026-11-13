'use strict';
// The small status line: level, species and the food gauge as pips. HTML, so every language renders with system fonts.
(() => {
  const TIER = ['#48a854', '#3e80e0', '#e0b020', '#e23c34'];
  PI.ui.hud = {
    update() {
      const hud = document.getElementById('hud'), S = PI.state, p = S.player;
      if (!p || S.phase !== 'play') { hud.hidden = true; return; }
      hud.hidden = false;
      document.getElementById('hud-level').textContent = PI.t('hud.level', { lv: p.lv });
      document.getElementById('hud-level').style.color = TIER[PI.ui.stars.tier(p.lv)];
      document.getElementById('hud-name').textContent = PI.speciesName(p.sp.id);
      const pips = document.getElementById('hud-pips');
      pips.setAttribute('aria-label', PI.t('hud.food', { have: Math.min(S.gauge, S.need), need: S.need }));
      if (pips.children.length !== S.need) pips.innerHTML = '<i></i>'.repeat(S.need);
      [...pips.children].forEach((el, k) => el.classList.toggle('on', k < S.gauge));
    },
  };
  document.addEventListener('pi:lang', () => PI.ui.hud.update());
})();
