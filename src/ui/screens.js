'use strict';
// The main menu, the guide, the settings, the field guide to all species, the guide to the maps, and the two
// end screens. HTML over the live map; all words come from the language files, except the name of the game.
(() => {
  const NAME = 'Pixel Island', REPO = 'https://github.com/Felix-Hwang/Pixel-Island';
  const GUIDE = ['goal', 'eat', 'danger', 'stars', 'grade', 'move', 'maps'];
  const AGILITY = { D: 1, C: 2, B: 3, A: 4, S: 5 };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const button = (text, cls, onClick) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };
  const heading = text => { const h = el('h1', null, text); h.id = 'screen-title'; return h; };
  const clock = s => PI.t('time.ms', { m: Math.floor(s / 60), s: Math.floor(s % 60) });
  const Sc = PI.ui.screens = { current: null };
  let tabCount = 0;

  // both leave the round through a transition, so the old map never jumps straight to the new one
  // put a map on screen, fetching its files first; if they cannot be fetched, the map already loaded is used again
  async function enter(id) {
    try { await PI.needMap(id); } catch { id = PI.state.map.id; }
    PI.game.loadMap(id);
  }
  function nextRound() {
    Sc.hide();
    PI.ui.transition(async () => {
      PI.ui.toast.clear();
      await enter(PI.mapCycle.upcoming());
      PI.game.start();
    });
  }
  function toMenu(id) {
    Sc.hide();
    PI.ui.transition(async () => {
      PI.ui.toast.clear();
      await enter(typeof id === 'string' ? id : PI.mapCycle.upcoming());
      PI.state.phase = 'start';
    }).then(() => Sc.show('title'));
  }
  function endButtons() {
    const actions = el('div', 'buttons'), again = button(PI.t('screen.again'), 'primary', nextRound);
    again.autofocus = true;
    actions.append(again, button(PI.t('screen.home'), 'quiet', toMenu));
    return actions;
  }
  function backButton(onClick = () => Sc.show('title')) {
    const actions = el('div', 'buttons'), back = button(PI.t('menu.back'), 'primary', onClick);
    back.autofocus = true;
    actions.append(back);
    return actions;
  }
  // A row of tabs over one panel. The arrow keys move along the row, and a tab opens when it is pressed,
  // because opening one can be costly (the map guide loads a map).
  function tabs(labels, open, label) {
    const list = el('div', 'tabs'), panel = el('div', 'tabpanel');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', label);
    panel.setAttribute('role', 'tabpanel');
    const select = n => {
      if (PI.ui.transition.busy()) return; // a scene change is still running
      [...list.children].forEach((tab, k) => { tab.setAttribute('aria-selected', k === n); tab.tabIndex = k === n ? 0 : -1; });
      panel.setAttribute('aria-labelledby', list.children[n].id);
      if (list.isConnected) list.children[n].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      open(n, panel);
    };
    labels.forEach((item, n) => {
      const tab = button(item.text, null, () => select(n));
      tab.id = 'tab-' + ++tabCount;
      tab.setAttribute('role', 'tab');
      if (item.name) tab.setAttribute('aria-label', item.name);
      tab.addEventListener('keydown', e => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        list.children[(n + step + labels.length) % labels.length].focus();
      });
      list.append(tab);
    });
    return { list, panel, select };
  }
  // a row of five pips, n of them filled
  function meter(n) {
    const m = el('span', 'meter');
    m.innerHTML = '<i class="on"></i>'.repeat(n) + '<i></i>'.repeat(5 - n);
    return m;
  }
  // a speed ratio of .75 .. 1.35 against the mean of the level, as 1 .. 5 pips
  const pips = ratio => Math.max(1, Math.min(5, Math.round((ratio - .75) / .15) + 1));
  function codexEntry(sp, lv, color) {
    const cfg = PI.config, grade = PI.grades[sp.id] || 'B', speed = (PI.speeds[sp.id] || 100) * cfg.grades[grade].speed;
    const card = el('article', 'entry'), art = PI.ui.walker(sp, color), body = el('div', 'body'), name = el('h3', null, PI.speciesName(sp.id));
    art.className = 'art';
    const badge = el('span', 'grade', grade);
    badge.dataset.grade = grade;
    name.append(badge);
    const stat = (label, value) => { const row = el('div', 'stat'); row.append(el('span', 'label', label), value instanceof Node ? value : el('span', null, value)); return row; };
    const stats = el('div', 'stats');
    stats.append(
      stat(PI.t('codex.speed'), meter(pips(speed / cfg.meanSpeed(lv)))),
      stat(PI.t('codex.agility'), meter(AGILITY[grade])),
      stat(PI.t('codex.food'), lv >= 10 ? '-' : String(PI.game.need(lv, sp.id))),
      stat(PI.t('codex.sense'), PI.t('sense.' + (PI.senses[sp.id] || 'medium'))),
      stat(PI.t('codex.style'), PI.t('style.' + ((PI.styles[PI.state.map.id] || {})[sp.id] || 'neutral'))));
    body.append(name, el('p', 'fact', PI.fact(sp.id)), stats, el('p', 'habit', PI.t('behavior.' + sp.behavior)));
    card.append(art, body);
    return card;
  }
  // what one map looks like, what stands on it, and what its five terrain effects do
  function mapInfo(id) {
    const shot = el('img', 'mapshot'), effects = el('dl', 'effects');
    shot.src = PI.gfx.mapImage(3); shot.alt = '';
    for (const key of PI.mapParts[id]) {
      effects.append(el('dt', null, PI.t('fx.' + id + '.' + key + '.n')), el('dd', null, PI.t('fx.' + id + '.' + key + '.d')));
    }
    return [shot, el('h2', null, PI.t('maps.look')), el('p', null, PI.t('mapinfo.' + id + '.look')),
      el('h2', null, PI.t('maps.things')), el('p', null, PI.t('mapinfo.' + id + '.things')),
      el('h2', null, PI.t('maps.effects')), effects];
  }

  const builders = {
    // the icon and the name of the game, a wide start button, a row of three small buttons, and a row of two
    title() {
      const panel = el('div', 'panel title'), icon = el('img', 'icon'), logo = heading(NAME), row = el('div', 'row'), books = el('div', 'row two');
      icon.src = 'icons/icon-192.png'; icon.alt = ''; icon.width = 96; icon.height = 96;
      logo.classList.add('logo'); logo.lang = 'en';
      const start = button(PI.t('menu.start'), 'primary', () => { Sc.hide(); PI.game.start(); });
      start.autofocus = true;
      row.append(
        button(PI.t('menu.language'), null, () => PI.ui.language.open(() => Sc.show('title'))),
        button(PI.t('menu.guide'), null, () => Sc.show('guide')),
        button(PI.t('menu.settings'), null, () => Sc.show('settings')));
      books.append(button(PI.t('menu.codex'), null, () => Sc.show('codex')), button(PI.t('menu.maps'), null, () => Sc.show('maps')));
      panel.append(icon, logo, start, row, books);
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
        const row = el('div', 'setting'), choices = el('div', 'choices');
        const named = key === 'zoom'; // zoom has named choices; the chase is on or off
        for (const value of PI.settings.choices(key)) {
          const b = button(PI.t(named ? 'settings.' + key + '.' + value : 'settings.' + value), null, () => {
            PI.settings.set(key, value);
            for (const other of choices.children) other.setAttribute('aria-pressed', other === b);
          });
          b.setAttribute('aria-pressed', PI.settings.get(key) === value);
          choices.append(b);
        }
        row.append(el('span', 'label', PI.t('settings.' + key)), choices);
        panel.append(row);
      }
      panel.append(backButton());
      return { panel };
    },
    // every species, ten at a time by level, walking, in a body colour the reader picks
    codex() {
      const panel = el('div', 'panel codex'), swatches = el('div', 'swatches');
      let lv = 1, color = PI.palette.order[3];
      const fill = into => into.replaceChildren(...PI.species['lv' + lv].map(sp => codexEntry(sp, lv, color)));
      const levels = Array.from({ length: 10 }, (v, n) => ({ text: String(n + 1), name: PI.t('hud.level', { lv: n + 1 }) }));
      const t = tabs(levels, (n, into) => { lv = n + 1; fill(into); }, PI.t('codex.title'));
      for (const key of PI.palette.order) {
        const b = button('', 'swatch', () => {
          color = key;
          for (const other of swatches.children) other.setAttribute('aria-pressed', other === b);
          fill(t.panel);
        });
        b.style.background = 'rgb(' + PI.palette.rgb[key].join(',') + ')';
        b.setAttribute('aria-label', PI.t('color.' + key));
        b.setAttribute('aria-pressed', key === color);
        swatches.append(b);
      }
      panel.append(heading(PI.t('codex.title')), el('p', 'muted small', PI.t('codex.intro', { map: PI.t('map.' + PI.state.map.id) })), t.list, swatches, t.panel, backButton());
      t.select(0);
      PI.ui.animate(panel);
      return { panel, look: 'wide' };
    },
    // One tab per map. Opening a tab puts that map on screen behind the panel, and the picture in the panel is
    // taken from it. Leaving puts back the map the next round was going to be played on.
    maps() {
      const ids = PI.mapOrder, first = PI.state.map.id, panel = el('div', 'panel maps');
      const t = tabs(ids.map(id => ({ text: PI.t('map.' + id) })), (n, into) => {
        const fill = () => into.replaceChildren(...mapInfo(PI.state.map.id));
        if (ids[n] === PI.state.map.id) fill();
        else PI.ui.transition(async () => { await enter(ids[n]); PI.state.phase = 'start'; fill(); });
      }, PI.t('maps.title'));
      panel.append(heading(PI.t('maps.title')), t.list, t.panel, backButton(() => (PI.state.map.id === first ? Sc.show('title') : toMenu(first))));
      t.select(ids.indexOf(first));
      return { panel, look: 'wide' };
    },
    // the camera is following the killer, so this card sits low and leaves the middle of the screen free
    over() {
      const panel = el('div', 'panel over'), killer = PI.state.killer;
      panel.append(heading(PI.t('screen.gameover')));
      if (killer) panel.append(el('p', null, PI.t('screen.eatenBy', killer.words)), el('p', 'muted', PI.t('screen.reached', { lv: killer.reached })));
      panel.append(endButtons());
      return { panel, look: 'low' };
    },
    // the report of a won round: the map, the time, every species the player was on the way up, and the credit
    report() {
      const S = PI.state, panel = el('div', 'panel report'), facts = el('div', 'facts'), rows = el('ol', 'path');
      const total = S.history.length ? S.history[S.history.length - 1].to - S.history[0].from : 0;
      const fact = (label, value) => { const box = el('div', 'fact'); box.append(el('span', 'label', label), el('b', null, value)); return box; };
      facts.append(fact(PI.t('report.map'), PI.t('map.' + S.map.id)), fact(PI.t('report.time'), clock(total)));
      for (const h of S.history) {
        const row = el('li'), art = el('img', 'art');
        art.src = PI.ui.portrait(PI.speciesById(h.id), h.color); art.alt = '';
        row.append(el('span', 'lv', PI.t('hud.level', { lv: h.lv })), art,
          el('span', 'who', PI.t('report.form', { color: PI.t('color.' + h.color), species: PI.speciesName(h.id) })), el('span', 'time', clock(h.to - h.from)));
        rows.append(row);
      }
      const credit = el('a', 'credit');
      credit.href = REPO; credit.target = '_blank'; credit.rel = 'noopener';
      credit.append(el('span', null, PI.t('report.thanks')), el('span', null, PI.t('report.maker')));
      const actions = endButtons();
      actions.prepend(credit);
      panel.append(heading(PI.t('report.title')), facts, el('h2', null, PI.t('report.path')), rows, actions);
      return { panel, look: 'wide' };
    },
  };
  Sc.hide = () => { PI.ui.modal.hide(); Sc.current = null; };
  // leave a round at once and go back to the main menu
  Sc.exit = () => { if (PI.state.phase === 'play' && !PI.ui.transition.busy()) toMenu(); };
  Sc.show = (kind, opt = {}) => {
    if (kind === 'codex' && !PI.i18n.facts[PI.lang()]) { // the facts are only fetched when the field guide is opened
      const open = () => { PI.i18n.facts[PI.lang()] = PI.i18n.facts[PI.lang()] || {}; Sc.show(kind, opt); };
      PI.needFacts(PI.lang()).then(open, open);
      return;
    }
    Sc.current = kind;
    PI.ui.hud.update();
    const made = builders[kind](opt);
    PI.ui.modal.show(made.panel, made.look);
  };
})();
