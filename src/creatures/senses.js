'use strict';
// Helpers every behaviour uses: detecting the player, the shared hunter and prey reaction, and wandering.
// Each creature stays around its own home point. Its temperament (PI.styleOf) scales pace, range and chase.
// A steering vector has length 0..1, a fraction of the creature's top speed.
(() => {
  const cfg = PI.config, S = PI.state, G = PI.gfx;
  const A = PI.ai = {};
  A.player = () => S.phase === 'play' && S.player && !S.player.ride ? S.player : null;
  A.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  // 'prey': the player can eat me. 'hunter': I can eat the player. 'peer': same level. 'none': no player.
  A.relation = self => {
    const p = A.player();
    return !p ? 'none' : p.lv > self.lv ? 'prey' : p.lv < self.lv ? 'hunter' : 'peer';
  };
  A.hunts = () => PI.settings.on('chase');
  // range scales the creature's own detection distance. A hidden player is only noticed up close.
  A.sees = (self, range = 1) => {
    const p = A.player();
    if (!p) return false;
    const d = A.dist(self, p);
    if (p.mods.hidden && d > p.mods.reveal) return false;
    return d < Math.min(cfg.senseMax, self.sense * self.mods.detect * range);
  };
  // a hunter only notices the player while the hunter itself is on screen
  A.spots = (self, range = 1) => {
    const p = A.player(), early = p ? cfg.earlyNotice[p.lv] || 1 : 1; // a small player gets a little more room
    return A.hunts() && G.visible(self.x, self.y, -4) && A.sees(self, range * PI.styleOf(self).notice * early);
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
  // near the border, turn the vector back toward the creature's own home point
  A.home = (self, v) => {
    const e = PI.island.edge(self.x, self.y);
    if (e < .72) return v;
    const k = Math.min(1, (e - .72) / .16), len = Math.hypot(v.x, v.y);
    const hx = self.home.x - self.x, hy = self.home.y - self.y, l = Math.hypot(hx, hy) || 1;
    v.x = v.x * (1 - k) + hx / l * len * k;
    v.y = v.y * (1 - k) + hy / l * len * k;
    self.ai.t = Math.min(self.ai.t || 0, .4);
    return v;
  };
  // Hold a random heading for a while, sometimes stop. One that has strayed past its roam distance heads home.
  A.wander = (self, dt, speed, minT = 1, maxT = 3, pause = .3) => {
    const s = self.ai, st = PI.styleOf(self), pace = self.temper * st.pace;
    s.t = (s.t || 0) - dt;
    if (s.t <= 0 || s.wx == null) {
      s.t = (minT + Math.random() * (maxT - minT)) / self.temper;
      if (Math.random() < pause * (1.5 - self.temper * .5)) { s.wx = 0; s.wy = 0; }
      else {
        const hx = self.home.x - self.x, hy = self.home.y - self.y;
        const a = Math.hypot(hx, hy) > self.roam * st.roam ? Math.atan2(hy, hx) + (Math.random() - .5) * 1.8 : Math.random() * Math.PI * 2;
        s.wx = Math.cos(a); s.wy = Math.sin(a);
      }
    }
    return A.home(self, { x: s.wx * speed * pace, y: s.wy * speed * pace });
  };
  // Prey runs from the player and hunters go after the player. o.fear / o.range scale how early it reacts and
  // o.chase the chase speed. Returns null when there is nothing to react to.
  // Both are capped below the player's own speed; the caps move with the grade of the player's species.
  A.react = (self, o = {}) => {
    const p = A.player();
    if (!p) return null;
    const rel = A.relation(self), st = PI.styleOf(self), own = self.speed * self.mods.speed || 1, edge = cfg.grades[p.grade].edge;
    const s = self.ai, now = S.time;
    if (rel === 'prey' && A.sees(self, (o.fear || 1) * st.fear * cfg.fleeRange)) {
      // Prey that has been running for config.fleeStamina seconds is out of breath and slows down, so a chase
      // across the map always ends in a catch.
      if (s.fleeAt == null || now - s.busy > .6) s.fleeAt = now;
      s.busy = now;
      if (now - s.fleeAt > cfg.fleeStamina) { s.windedUntil = now + cfg.winded; s.fleeAt = now + cfg.winded; }
      const pace = now < (s.windedUntil || 0) ? cfg.windedPace : 1;
      return A.home(self, A.away(self, p.x, p.y, Math.min(cfg.fleeFactor, p.speed * (cfg.fleeCap - edge) / own) * pace));
    }
    if (rel !== 'hunter') return null;
    if (now < (s.restUntil || 0) || !A.spots(self, o.range || 1)) return null;
    if (s.chaseAt == null || now - s.chaseSeen > .6) s.chaseAt = now;
    s.chaseSeen = now; s.busy = now;
    if (now - s.chaseAt > cfg.stamina * st.stamina) { s.restUntil = now + cfg.rest; s.chaseAt = null; return null; }
    const pace = (o.chase || 1) * st.chase;
    return A.toward(self, p.x, p.y, Math.min(cfg.chaseFactor * pace, p.speed * Math.min(.98, (cfg.chaseCap - edge) * pace) / own));
  };
})();
