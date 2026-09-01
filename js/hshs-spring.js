(function () {
  if (window.HshsSpring) return;

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function step(state, target, dt, k, c, m) {
    dt = Math.min(0.033, Math.max(0.001, dt || 0.016));
    k = k == null ? 180 : k;
    c = c == null ? 16 : c;
    m = m == null ? 1 : m;
    var x = state.x - target;
    var F = -k * x - c * state.v;
    var v = state.v + (F / m) * dt;
    var nx = state.x + v * dt;
    if (Math.abs(v) < 0.8 && Math.abs(nx - target) < 0.15) {
      return { x: target, v: 0, rest: true };
    }
    return { x: nx, v: v, rest: false };
  }

  function animate(opts) {
    opts = opts || {};
    var k = opts.k == null ? 180 : opts.k;
    var c = opts.c == null ? 16 : opts.c;
    var m = opts.m == null ? 1 : opts.m;
    var apply = opts.apply || function () {};
    var done = opts.done || function () {};
    var state = { x: opts.from == null ? 0 : opts.from, v: opts.velocity || 0 };
    var target = opts.to == null ? 0 : opts.to;
    var running = true;
    if (reduced()) {
      apply(target);
      done(target);
      return { to: function (n) { target = n; apply(n); }, stop: function () {}, set: function (n) { state.x = n; apply(n); } };
    }
    var last = performance.now();
    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      var next = step(state, target, dt, k, c, m);
      state.x = next.x;
      state.v = next.v;
      apply(state.x);
      if (next.rest) {
        running = false;
        done(state.x);
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {
      to: function (n, vel) {
        target = n;
        if (vel != null) state.v = vel;
        if (!running) {
          running = true;
          last = performance.now();
          requestAnimationFrame(frame);
        }
      },
      stop: function () { running = false; },
      set: function (n) { state.x = n; state.v = 0; apply(n); }
    };
  }

  function pop(el, scale) {
    if (!el) return;
    scale = scale == null ? 1.16 : scale;
    if (reduced()) return;
    animate({
      from: scale, to: 1, k: 280, c: 18, m: 1,
      apply: function (s) { el.style.transform = 'scale(' + s + ')'; },
      done: function () { el.style.transform = ''; }
    });
  }

  window.HshsSpring = { step: step, animate: animate, pop: pop, reduced: reduced };
})();
