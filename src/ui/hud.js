'use strict';
// The status card at the top left (level, species, grade and the food gauge as pips) and the name of the map
// at the top right. HTML, so every language renders with system fonts.
(() => {
  const TIER = ['#48a854', '#3e80e0', '#e0b020', '#e23c34'];
  const byId = id => document.getElementById(id);
  PI.ui.hud = {
    update() {
      const hud = byId('hud'), S = PI.state, p = S.player;
      byId('map-name').textContent = S.map ? PI.t('map.' + S.map.id) : '';
      if (!p || S.phase !== 'play') { hud.hidden = true; return; }
      hud.hidden = false;
      byId('hud-level').textContent = PI.t('hud.level', { lv: p.lv });
      byId('hud-level').style.color = TIER[PI.ui.stars.tier(p.lv)];
      byId('hud-name').textContent = PI.speciesName(p.sp.id);
      byId('hud-grade').textContent = p.grade;
      byId('hud-grade').dataset.grade = p.grade;
      byId('hud-grade').title = PI.t('hud.grade', { grade: p.grade });
      const pips = byId('hud-pips');
      pips.setAttribute('aria-label', PI.t('hud.food', { have: Math.min(S.gauge, S.need), need: S.need }));
      if (pips.children.length !== S.need) pips.innerHTML = '<i></i>'.repeat(S.need);
      [...pips.children].forEach((el, k) => el.classList.toggle('on', k < S.gauge));
    },
  };
  document.addEventListener('pi:lang', () => PI.ui.hud.update());
  document.addEventListener('pi:map', () => PI.ui.hud.update());
})();
