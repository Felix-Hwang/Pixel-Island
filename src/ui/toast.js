'use strict';
// Notices at the top right, directly under the name of the map.
// show() is for the start of a round and for evolutions: the cards queue and show one at a time.
// flash() is for eating: one short card that the next one replaces, so quick meals never pile up.
(() => {
  const queue = [];
  let card = null, timer = 0, quick = null, quickTimer = 0;
  const box = () => document.getElementById('toasts');
  const make = (text, cls) => {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    return el;
  };
  function close() {
    clearTimeout(timer);
    if (card) card.remove();
    card = null;
  }
  function closeQuick() {
    clearTimeout(quickTimer);
    if (quick) quick.remove();
    quick = null;
  }
  function pump() {
    if (card || !queue.length) return;
    const next = queue.shift();
    card = make(next.text, 'toast');
    box().prepend(card);
    timer = setTimeout(() => {
      card.classList.add('out');
      timer = setTimeout(() => { close(); pump(); }, 220);
    }, next.ms);
  }
  PI.ui.toast = {
    show(text, ms = PI.config.toastMs) { queue.push({ text, ms }); if (queue.length > 2) queue.shift(); closeQuick(); pump(); },
    flash(text) {
      if (card) return; // a start or evolution card has the corner to itself
      closeQuick();
      quick = make(text, 'toast quick');
      box().append(quick);
      quickTimer = setTimeout(closeQuick, PI.config.eatToastMs);
    },
    // at the start of a new round, remove the cards on screen and empty the queue
    clear() { queue.length = 0; close(); closeQuick(); },
  };
})();
