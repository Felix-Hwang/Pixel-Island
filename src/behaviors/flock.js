'use strict';
// Flock. It keeps loosely to others of its own species and moves the way they move. A group stays small:
// once three others are near, it stops closing in, so a flock never grows into a crowd.
PI.behaviors.flock = {
  steer(self, dt) {
    const A = PI.ai, reaction = A.react(self);
    if (reaction) return reaction;
    const v = A.wander(self, dt, .45, 1.2, 3, .2);
    let n = 0, cx = 0, cy = 0, hx = 0, hy = 0;
    for (const o of PI.state.creatures) {
      if (o === self || o.sp.id !== self.sp.id || A.dist(self, o) > 7) continue;
      n++; cx += o.x; cy += o.y; hx += o.vx; hy += o.vy;
    }
    if (!n) return v;
    cx /= n; cy /= n;
    const d = Math.hypot(cx - self.x, cy - self.y);
    if (n <= 3 && d > 3) { const to = A.toward(self, cx, cy, .25); v.x += to.x; v.y += to.y; } // close the gap, but keep some room
    const hl = Math.hypot(hx, hy);
    if (hl > .01) { v.x += hx / hl * .15; v.y += hy / hl * .15; }                               // match their heading
    return v;
  },
};
