'use strict';
// The main menu, the guide, the settings and the two end screens. HTML over the live map; all words come from
// the language files, except the name of the game.
(() => {
  const NAME = 'Pixel Island';
  const GUIDE = ['goal', 'eat', 'danger', 'stars', 'grade', 'move', 'maps'];
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const button = (text, cls, onClick) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };
  const heading = text => { const h = el('h1', null, text); h.id = 'screen-title'; return h; };
  const Sc = PI.ui.screens = { current: null };

  function nextRound() {
    Sc.hide();
    PI.ui.toast.clear();
    PI.game.loadMap(PI.mapCycle.upcoming());
    PI.game.start();
  }
  function toMenu() {
    PI.ui.toast.clear();
    PI.game.loadMap(PI.mapCycle.upcoming());
    PI.state.phase = 'start';
    Sc.show('title');
  }
  const builders = {
    // the name of the game, one wide start button, and three small buttons in a row
    title() {
      const panel = el('div', 'panel title'), logo = heading(NAME), row = el('div', 'row');
      logo.classList.add('logo'); logo.lang = 'en';
      const start = button(PI.t('menu.start'), 'primary', () => { Sc.hide(); PI.game.start(); });
      start.autofocus = true;
      row.append(
        button(PI.t('menu.language'), null, () => PI.ui.language.open(() => Sc.show('title'))),
        button(PI.t('menu.guide'), null, () => Sc.show('guide')),
        button(PI.t('menu.settings'), null, () => Sc.show('settings')));
      panel.append(logo, start, row);
      return { panel, look: 'bare' };
    },
    // opt.first: shown right after the first language choice, so its button leads on to the main menu
    guide(opt) {
      const panel = el('div', 'panel guide');
      panel.append(heading(PI.t('guide.title')));
      for (const key of GUIDE) panel.append(el('h2', null, PI.t('guide.' + key + '.h')), el('p', null, PI.t('guide.' + key + '.p')));
      const done = button(PI.t(opt.first ? 'menu.next' : 'menu.back'), 'primary', () => Sc.show('title'));
      done.autofocus = true;
      const actions = el('div', 'buttons');
      actions.append(done);
      panel.append(actions);
      return { panel };
    },
    settings() {
      const panel = el('div', 'panel settings');
      panel.append(heading(PI.t('settings.title')));
      for (const key of PI.settings.keys()) {
        const row = el('div', 'setting'), label = el('span', 'label', PI.t('settings.' + key)), choices = el('div', 'choices');
        const named = key === 'zoom'; // zoom has named choices, the others are on or off
        for (const value of PI.settings.choices(key)) {
          const b = button(PI.t(named ? 'settings.zoom.' + value : 'settings.' + value), null, () => {
            PI.settings.set(key, value);
            for (const other of choices.children) other.setAttribute('aria-pressed', other === b);
          });
          b.setAttribute('aria-pressed', PI.settings.get(key) === value);
          choices.append(b);
        }
        row.append(label, choices);
        panel.append(row);
      }
      const back = button(PI.t('menu.back'), 'primary', () => Sc.show('title'));
      back.autofocus = true;
      const actions = el('div', 'buttons');
      actions.append(back);
      panel.append(actions);
      return { panel };
    },
    // the camera is following the killer, so this card sits low and leaves the middle of the screen free
    over() {
      const panel = el('div', 'panel over'), killer = PI.state.killer;
      panel.append(heading(PI.t('screen.gameover')));
      if (killer) panel.append(el('p', null, PI.t('screen.eatenBy', killer.words)), el('p', 'muted', PI.t('screen.reached', { lv: killer.reached })));
      panel.append(endButtons());
      return { panel, look: 'low' };
    },
    clear() {
      const panel = el('div', 'panel clear');
      panel.append(heading(PI.t('screen.clear')), el('p', null, PI.t('screen.clearBody')), endButtons());
      return { panel };
    },
  };
  function endButtons() {
    const actions = el('div', 'buttons'), again = button(PI.t('screen.again'), 'primary', nextRound);
    again.autofocus = true;
    actions.append(again, button(PI.t('screen.home'), 'quiet', toMenu));
    return actions;
  }
  Sc.hide = () => { PI.ui.modal.hide(); Sc.current = null; };
  Sc.show = (kind, opt = {}) => {
    Sc.current = kind;
    PI.ui.hud.update();
    const made = builders[kind](opt);
    PI.ui.modal.show(made.panel, made.look);
  };
})();
