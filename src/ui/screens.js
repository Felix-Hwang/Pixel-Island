'use strict';
// Start, game-over and clear screens. HTML over the live map; all words come from the language files.
(() => {
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const button = (text, cls, onClick) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };
  const Sc = PI.ui.screens = { current: null };

  function nextRound() {
    Sc.hide();
    PI.ui.toast.clear();
    PI.game.loadMap(PI.mapCycle.upcoming());
    PI.game.start();
  }
  Sc.hide = () => { PI.ui.modal.hide(); Sc.current = null; };
  Sc.show = kind => {
    const S = PI.state, t = PI.t;
    const panel = el('div', 'panel ' + kind), actions = el('div', 'buttons');
    const heading = text => { const h = el('h1', null, text); h.id = 'screen-title'; return h; };
    Sc.current = kind;
    PI.ui.hud.update();
    let main;
    if (kind === 'start') {
      panel.append(heading(t('screen.title')), el('p', 'muted', t('screen.tagline')));
      panel.append(el('p', 'map', t('screen.map', { map: t('map.' + S.map.id) })));
      const rules = el('ol', 'rules');
      for (let n = 1; n <= 4; n++) rules.append(el('li', null, t('rules.' + n)));
      panel.append(rules, el('p', 'muted small', t('screen.controls')));
      main = button(t('screen.start'), 'primary', () => { Sc.hide(); PI.game.start(); });
    } else if (kind === 'over') {
      panel.append(heading(t('screen.gameover')));
      if (S.killer) {
        panel.append(el('p', null, t('screen.eatenBy', { lv: S.killer.lv, species: PI.speciesName(S.killer.id) })));
        panel.append(el('p', 'muted', t('screen.reached', { lv: S.killer.reached })));
      }
      main = button(t('screen.again'), 'primary', nextRound);
    } else {
      panel.append(heading(t('screen.clear')), el('p', null, t('screen.clearBody')));
      main = button(t('screen.again'), 'primary', nextRound);
    }
    main.autofocus = true;
    // the language can be changed here, never in the middle of a round
    actions.append(main, button(t('screen.language'), 'quiet', () => PI.ui.language.open(() => Sc.show(kind))));
    panel.append(actions);
    PI.ui.modal.show(panel);
  };
})();
