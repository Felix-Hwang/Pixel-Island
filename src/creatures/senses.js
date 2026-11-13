'use strict';
// Helpers every behaviour uses. They detect the player, apply the hunter and prey reaction, wander, and keep
// creatures away from the border of the map.
// A steering vector has length 0..1 (a fraction of the creature's top speed); slightly more than 1 is a sprint.
(() => {
  const cfg = PI.config, S = PI.state;
  const A = PI.ai = {};
  A.player = () => S.phase === 'play' && S.player && !S.player.ride ? S.player : null;
  A.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  // 'prey': the player can eat me. 'hunter': I can eat the player. 'peer': same level. 'none': no player.
  A.relation = self => {
    const p = A.player();
    return !p ? 'none' : p.lv > self.lv ? 'prey' : p.lv < self.lv ? 'hunter' : 'peer';
  };
  // range scales the creature's detection distance. A hidden player is only noticed up close.
  A.sees = (self, range = 1) => {
    const p = A.player();
    if (!p) return false;
    const d = A.dist(self, p);
    if (p.mods.hidden && d > p.mods.reveal) return false;
    return d < cfg.detect * self.mods.detect * range;
  };
  A.toward = (self, x, y, speed = 1) => {
    const dx = x - self.x, dy = y - self.y, l = Math.hypot(dx, dy) || 1;
    return { x: dx / l * speed, y: dy / l * speed };
  };
  A.away = (self, x, y, speed = 1) => {
    const v = A.toward(self, x, y, speed);
    v.x = -v.x; v.y = -v.y;
    return v;
  };
  // near the border, turn the vector back toward the middle of the map
  A.home = (self, v) => {
    const e = PI.island.edge(self.x, self.y);
    if (e < .72) return v;
    const k = Math.min(1, (e - .72) / .16), len = Math.hypot(v.x, v.y), l = Math.hypot(self.x, self.y) || 1;
    v.x = v.x * (1 - k) - self.x / l * len * k;
    v.y = v.y * (1 - k) - self.y / l * len * k;
    self.ai.t = Math.min(self.ai.t || 0, .4); // pick a new heading soon
    return v;
  };
  // hold a random heading for a while, sometimes stop
  A.wander = (self, dt, speed, minT = 1, maxT = 3, pause = .3) => {
    const s = self.ai;
    s.t = (s.t || 0) - dt;
    if (s.t <= 0 || s.wx == null) {
      s.t = minT + Math.random() * (maxT - minT);
      if (Math.random() < pause) { s.wx = 0; s.wy = 0; }
      else { const a = Math.random() * Math.PI * 2; s.wx = Math.cos(a); s.wy = Math.sin(a); }
    }
    return A.home(self, { x: s.wx * speed, y: s.wy * speed });
  };
  // The reaction every behaviour shares. Prey runs from the player and hunters go after the player.
  // o.fear / o.range scale how early it reacts; o.chase scales the chase speed. Returns null when there is nothing to react to.
  // Speeds are capped against the player's own speed. Prey is always slower than the player, and so is a hunter.
  // A hunter stops chasing after config.stamina seconds and ignores the player for config.rest seconds.
  A.react = (self, o = {}) => {
    const p = A.player();
    if (!p) return null;
    const rel = A.relation(self), own = self.speed * self.mods.speed || 1;
    if (rel === 'prey' && A.sees(self, (o.fear || 1) * .6)) {
      return A.home(self, A.away(self, p.x, p.y, Math.min(cfg.fleeFactor, p.speed * cfg.fleeCap / own)));
    }
    if (rel !== 'hunter') return null;
    const s = self.ai, now = S.time;
    if (now < (s.restUntil || 0) || !A.sees(self, o.range || 1)) return null;
    if (s.chaseAt == null || now - s.chaseSeen > .6) s.chaseAt = now; // a new chase starts
    s.chaseSeen = now;
    if (now - s.chaseAt > cfg.stamina * (o.chase || 1)) { s.restUntil = now + cfg.rest; s.chaseAt = null; return null; }
    return A.toward(self, p.x, p.y, Math.min(cfg.chaseFactor * (o.chase || 1), p.speed * Math.min(.98, cfg.chaseCap * (o.chase || 1)) / own));
  };
})();
