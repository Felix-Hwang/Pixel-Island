'use strict';
// The one modal of the game: the native <dialog id="screen">. The language choice, the main menu, the guide, the
// settings and the end screens all show their panel in it. The browser makes the page behind it inert, keeps focus
// inside and draws the backdrop. A screen is only left through its own buttons, so the dialog never closes by
// itself. Esc presses the button marked data-back, if the screen has one.
(() => {
  const dialog = document.getElementById('screen');
  let wanted = false;
  dialog.addEventListener('cancel', e => e.preventDefault());
  dialog.addEventListener('close', () => { if (wanted) dialog.showModal(); }); // if something else closed it, open it again
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.repeat || !dialog.open || dialog.inert) return;
    const back = dialog.querySelector('[data-back]');
    if (back) back.click();
  });
  PI.ui.modal = {
    // panel: an element whose heading has id="screen-title" and whose main button has the autofocus attribute.
    // look: '' for a white card in the middle, 'bare' for the main menu without a card, 'low' for a card at the
    // bottom that leaves the middle of the screen free.
    show(panel, look = '') {
      wanted = true;
      dialog.className = look;
      dialog.replaceChildren(panel);
      if (!dialog.open) dialog.showModal();
      else { const first = panel.querySelector('[autofocus]'); if (first) first.focus({ preventScroll: true }); }
      dialog.scrollTop = 0; // focus goes to a button at the bottom of a long panel, but reading starts at the top
    },
    hide() {
      wanted = false;
      if (dialog.open) dialog.close();
      dialog.replaceChildren();
    },
  };
})();
