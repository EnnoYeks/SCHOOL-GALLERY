(function (global) {
  'use strict';
  if (global.HshsGlassCapability) {
    global.HshsGlassCapability.init();
    return;
  }
  var root = global.document && global.document.documentElement;
  function detect() {
    var css = global.CSS;
    var supportsBlur = !!(css && css.supports &&
      (css.supports('backdrop-filter', 'blur(1px)') ||
       css.supports('-webkit-backdrop-filter', 'blur(1px)')));
    var nav = global.navigator || {};
    var memory = Number(nav.deviceMemory);
    var cores = Number(nav.hardwareConcurrency);
    var knownLowMemory = (Number.isFinite(memory) && memory <= 2) ||
      (!Number.isFinite(memory) && Number.isFinite(cores) && cores <= 2);
    var reducedTransparency = false;
    try {
      reducedTransparency = global.matchMedia &&
        global.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    } catch (e) {}
    return {
      supportsBlur: supportsBlur,
      lowMemory: knownLowMemory,
      reducedTransparency: !!reducedTransparency,
      useSolidSurfaces: !supportsBlur || knownLowMemory || !!reducedTransparency
    };
  }
  function init() {
    if (!root) return detect();
    var state = detect();
    root.classList.toggle('hshs-no-backdrop', state.useSolidSurfaces);
    root.setAttribute('data-hshs-glass', state.useSolidSurfaces ? 'solid' : 'frosted');
    return state;
  }
  global.HshsGlassCapability = { detect: detect, init: init };
  init();
})(window);
