'use strict';
// Language choice. Shown on the very first run, and again from the Language button on the start and end screens.
// Four large buttons, each written in its own language.
(() => {
  PI.ui.language = {
    open(done) {
      const guess = PI.lang() || PI.detectLang();
      const panel = document.createElement('div'), title = document.createElement('p'), list = document.createElement('div');
      panel.className = 'panel lang';
      title.className = 'muted';
      title.id = 'screen-title';
      // before a language is chosen, ask in all four
      title.textContent = PI.langs().map(l => PI.i18n[l]['screen.chooseLanguage']).join(' · ');
      list.className = 'buttons';
      for (const l of PI.langs()) {
        const b = document.createElement('button');
        b.type = 'button'; b.lang = l; b.textContent = PI.langName(l);
        if (l === guess) { b.className = 'hint'; b.autofocus = true; } // highlighted, but still the player's own choice
        b.addEventListener('click', () => { PI.setLang(l); done(); });
        list.append(b);
      }
      panel.append(title, list);
      PI.ui.modal.show(panel);
    },
  };
})();
