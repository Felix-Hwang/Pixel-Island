'use strict';
// Language choice. Shown on the very first run, and again from the Language button of the main menu.
// Each button shows a flag, the language's own name and its English name.
(() => {
  const TITLE = 'Choose a language'; // always English, because no language is chosen yet on the first run
  PI.ui.language = {
    open(done) {
      const guess = PI.lang() || PI.detectLang();
      const panel = document.createElement('div'), title = document.createElement('h1'), list = document.createElement('div');
      panel.className = 'panel lang';
      title.id = 'screen-title';
      title.lang = 'en';
      title.textContent = TITLE;
      list.className = 'buttons';
      for (const l of PI.langs()) {
        const b = document.createElement('button'), name = document.createElement('span');
        b.type = 'button'; b.lang = l;
        name.className = 'name';
        name.textContent = PI.langName(l);
        b.append(PI.ui.flag(l), name);
        if (PI.langEnglish(l) !== PI.langName(l)) {
          const english = document.createElement('span');
          english.className = 'english'; english.lang = 'en';
          english.textContent = PI.langEnglish(l);
          b.append(english);
        }
        if (l === guess) { b.classList.add('hint'); b.autofocus = true; } // highlighted, but still the player's own choice
        b.addEventListener('click', () => { PI.setLang(l); done(); });
        list.append(b);
      }
      panel.append(title, list);
      PI.ui.modal.show(panel);
    },
  };
})();
