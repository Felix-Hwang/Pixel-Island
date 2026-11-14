'use strict';
// Movement input. The keyboard uses the arrow keys or WASD, in eight directions. With touch or a mouse, press
// anywhere and drag. The press point becomes the centre of a floating stick, so one thumb is enough.
(() => {
  const In = PI.input = { x: 0, y: 0 };
  const DEAD = 6, FULL = 42;
  const keys = new Set();
  let pointer = null, base = null, knob = null;
  const KEYMAP = {
    ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1], A: [-1, 0], D: [1, 0], W: [0, -1], S: [0, 1],
  };
  function fromKeys() {
    let x = 0, y = 0;
    for (const k of keys) { x += KEYMAP[k][0]; y += KEYMAP[k][1]; }
    const len = Math.hypot(x, y);
    return len ? [x / len, y / len] : [0, 0];
  }
  function showStick(on) {
    if (!base) return;
    base.hidden = knob.hidden = !on || !PI.settings.on('stick');
  }
  function moveStick() {
    if (!base || !pointer) return;
    base.style.transform = 'translate(' + (pointer.x0 - 28) + 'px,' + (pointer.y0 - 28) + 'px)';
    const dx = pointer.x - pointer.x0, dy = pointer.y - pointer.y0, len = Math.hypot(dx, dy) || 1, cap = Math.min(len, FULL);
    knob.style.transform = 'translate(' + (pointer.x0 + dx / len * cap - 11) + 'px,' + (pointer.y0 + dy / len * cap - 11) + 'px)';
  }
  // the world vector to steer along, length 0..1
  In.read = () => {
    if (pointer) {
      const dx = pointer.x - pointer.x0, dy = pointer.y - pointer.y0, len = Math.hypot(dx, dy);
      if (len < DEAD) { In.x = 0; In.y = 0; return In; }
      // the ground is seen at an angle, so a screen direction is stretched along y to get the world direction
      const wx = dx, wy = dy / PI.gfx.SIN, wl = Math.hypot(wx, wy), mag = Math.min(1, (len - DEAD) / (FULL - DEAD));
      In.x = wx / wl * mag; In.y = wy / wl * mag;
      return In;
    }
    const [x, y] = fromKeys();
    In.x = x; In.y = y;
    return In;
  };
  In.init = () => {
    base = document.getElementById('stick-base'); knob = document.getElementById('stick-knob');
    addEventListener('keydown', e => {
      if (!KEYMAP[e.key] || e.metaKey || e.ctrlKey || e.altKey) return;
      if (PI.state.phase === 'play') e.preventDefault();
      keys.add(e.key);
    });
    addEventListener('keyup', e => keys.delete(e.key));
    addEventListener('blur', () => { keys.clear(); pointer = null; showStick(false); });
    document.addEventListener('pointerdown', e => {
      if (PI.state.phase !== 'play' || e.button !== 0 || pointer || (e.target.closest && e.target.closest('button, a'))) return; // primary button, one finger
      pointer = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
      showStick(true); moveStick();
    });
    document.addEventListener('pointermove', e => {
      if (!pointer || e.pointerId !== pointer.id) return;
      pointer.x = e.clientX; pointer.y = e.clientY;
      moveStick();
    });
    const end = e => { if (pointer && e.pointerId === pointer.id) { pointer = null; showStick(false); } };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
  };
  In.release = () => { pointer = null; showStick(false); };
})();
