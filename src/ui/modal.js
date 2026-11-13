'use strict';
// The one modal of the game: the native <dialog id="screen">. The language choice and the start, game-over and
// clear screens all show their panel in it. The browser makes the page behind it inert, keeps focus inside and
// draws the backdrop. These screens are only left through their own buttons, so Esc and the back gesture are refused.
(() => {
  const dialog = document.getElementById('screen');
  let wanted = false;
  dialog.addEventListener('cancel', e => e.preventDefault());
  dialog.addEventListener('close', () => { if (wanted) dialog.showModal(); }); // if something else closed it, open it again
  PI.ui.modal = {
    // panel: an element whose heading has id="screen-title" and whose main button has the autofocus attribute
    show(panel) {
      wanted = true;
      dialog.replaceChildren(panel);
      if (!dialog.open) dialog.showModal();
      else { const first = panel.querySelector('[autofocus]'); if (first) first.focus(); }
    },
    hide() {
      wanted = false;
      if (dialog.open) dialog.close();
      dialog.replaceChildren();
    },
  };
})();
