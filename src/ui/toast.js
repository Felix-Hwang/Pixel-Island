'use strict';
// Notice cards on the right, shown when a round starts and on every evolution. Cards queue and show one at a time.
(() => {
  const queue = [];
  let card = null, timer = 0;
  function close() {
    clearTimeout(timer);
    if (card) card.remove();
    card = null;
  }
  function pump() {
    if (card || !queue.length) return;
    const { title, sub } = queue.shift(), b = document.createElement('b'), span = document.createElement('span');
    card = document.createElement('div');
    card.className = 'toast';
    b.textContent = title; span.textContent = sub || '';
    card.append(b, span);
    document.getElementById('toasts').append(card);
    timer = setTimeout(() => {
      card.classList.add('out');
      timer = setTimeout(() => { close(); pump(); }, 220);
    }, PI.config.toastMs);
  }
  PI.ui.toast = {
    show(title, sub) { queue.push({ title, sub }); pump(); },
    // at the start of a new round, remove the card on screen and empty the queue
    clear() { queue.length = 0; close(); },
  };
})();
