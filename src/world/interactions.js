'use strict';
// Runs the five interactions of the current map. Each interaction is one file under
// src/world/interactions/<map>/ and may define any of these hooks (cfg comes from the map file, st is its own state):
//   init(cfg, st)            set up state
//   bake(cfg, st)            draw static props into the baked frame
//   update(cfg, st, dt)      per frame; may stun, push or carry creatures
//   modify(cfg, st, c, m)    per creature per frame; change m.speed, m.accel, m.detect, m.hidden, m.safe, m.food, m.driftX/Y,
//                            and set m.ground to 'water' or 'mud' where the creature wades, which picks the sound
//   blocks(cfg, st, c, x, y) true if creature c may not stand at (x, y)
//   dim(cfg, st, c)          true if c should be drawn as a dark silhouette without stars
//   drawGround / draw / drawOver(cfg, st)   paint on the ground, add live objects, or paint over the finished frame
// Every interaction treats the player and the AI creatures the same way.
(() => {
  const Wd = PI.world = { active: [], map: null };
  const run = (hook, a, b, c) => { for (const it of Wd.active) if (it.def[hook]) it.def[hook](it.cfg, it.st, a, b, c); };

  Wd.load = map => {
    Wd.map = map;
    Wd.active = [];
    for (const id of Object.keys(map.interactions || {})) {
      const def = PI.interactions[map.id + '/' + id];
      if (!def) { console.warn('interaction not found:', map.id + '/' + id); continue; }
      Wd.active.push({ def, cfg: map.interactions[id], st: {} });
    }
    run('init');
  };
  Wd.bake = () => run('bake');
  Wd.update = dt => run('update', dt);
  Wd.drawGround = () => run('drawGround');
  Wd.draw = () => run('draw');
  Wd.drawOver = () => run('drawOver');
  Wd.mods = c => {
    const m = c.mods;
    m.speed = 1; m.accel = 1; m.detect = 1; m.hidden = false; m.reveal = 2.5; m.safe = false; m.food = 0; m.driftX = 0; m.driftY = 0; m.ground = '';
    run('modify', c, m);
    return m;
  };
  Wd.blocked = (c, x, y) => { for (const it of Wd.active) if (it.def.blocks && it.def.blocks(it.cfg, it.st, c, x, y)) return true; return false; };
  Wd.dim = c => { for (const it of Wd.active) if (it.def.dim && it.def.dim(it.cfg, it.st, c)) return true; return false; };

  /* ---------- helpers shared by the interaction files ---------- */
  Wd.creatures = () => PI.state.all().filter(c => !c.ride);
  Wd.inCircle = (c, z, pad = 0) => Math.hypot(c.x - z.x, c.y - z.y) < z.r + pad;
  Wd.inRect = (c, z, pad = 0) => Math.abs(c.x - z.x) < z.hx + pad && Math.abs(c.y - z.y) < z.hy + pad;
  // per-creature scratch space for one interaction
  Wd.fx = (c, key) => c.fx[key] || (c.fx[key] = {});
  // seconds the creature has stayed inside; resets when it leaves
  Wd.dwell = (c, key, inside, dt) => { const f = Wd.fx(c, key); f.dwell = inside ? (f.dwell || 0) + dt : 0; return f.dwell; };
  // counts a cooldown down; true while it is still running
  Wd.cooling = (c, key, dt) => { const f = Wd.fx(c, key); if (f.cool > 0) f.cool -= dt; return f.cool > 0; };
  Wd.cooldown = (c, key, seconds) => { Wd.fx(c, key).cool = seconds; };
  Wd.stun = (c, seconds) => { if (c.invuln > 0) return; c.stun = Math.max(c.stun, seconds); };
  // Knock adds a velocity that fades out by itself. The creature travels about speed / 6 units.
  Wd.knock = (c, vx, vy) => { c.kx += vx; c.ky += vy; };
  Wd.feed = (c, n) => { if (c.isPlayer) PI.game.addFood(n, true); };
})();
