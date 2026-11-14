'use strict';
// The status card at the top left (level, species, grade, the food gauge or the level-10 countdown, and the
// effects the player is under) and the name of the map at the top right.
(() => {
  const TIER = ['#48a854', '#3e80e0', '#e0b020', '#e23c34'];
  const byId = id => document.getElementById(id);
  const iconUrl = {};
  PI.ui.hud = {
    update() {
      const hud = byId('hud'), S = PI.state, p = S.player;
      byId('map-name').textContent = S.map && PI.lang() ? PI.t('map.' + S.map.id) : '';
      if (!p || S.phase !== 'play') { hud.hidden = true; return; }
      hud.hidden = false;
      byId('hud-level').textContent = PI.t('hud.level', { lv: p.lv });
      byId('hud-level').style.color = TIER[PI.ui.stars.tier(p.lv)];
      byId('hud-name').textContent = PI.speciesName(p.sp.id);
      byId('hud-grade').textContent = p.grade;
      byId('hud-grade').dataset.grade = p.grade;
      byId('hud-grade').title = PI.t('hud.grade', { grade: p.grade });
      const pips = byId('hud-pips'), count = byId('hud-count');
      pips.hidden = !!S.apexAt; count.hidden = !S.apexAt;
      if (S.apexAt) count.textContent = PI.t('hud.ascend', { s: Math.max(0, Math.ceil(S.apexAt - S.time)) });
      else {
        pips.setAttribute('aria-label', PI.t('hud.food', { have: Math.min(S.gauge, S.need), need: S.need }));
        if (pips.children.length !== S.need) pips.innerHTML = '<i></i>'.repeat(S.need);
        [...pips.children].forEach((el, k) => el.classList.toggle('on', k < S.gauge));
      }
      const chips = PI.statusOf(p).map(key => {
        const chip = document.createElement('span'), icon = document.createElement('img');
        icon.src = iconUrl[key] || (iconUrl[key] = PI.ui.stars.image('icon', key));
        icon.alt = '';
        chip.append(icon, PI.t('status.' + key));
        chip.style.borderColor = 'rgb(' + PI.statusColors[key].join(',') + ')';
        return chip;
      });
      byId('hud-status').replaceChildren(...chips);
    },
  };
  document.addEventListener('pi:lang', () => PI.ui.hud.update());
  document.addEventListener('pi:map', () => PI.ui.hud.update());
})();
