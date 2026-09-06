(function (global) {
  'use strict';
  if (global.HshsApp) return;
  var state = { ready: false, currentRoute: null, previousRoute: null, navigating: false, errors: [], pages: {}, dataReady: false, foundation: false, version: '1.0.0-phase1' };
  var listeners = { ready: [], navigate: [], error: [], data: [] };

  function emit(event, payload) {
    (listeners[event] || []).slice().forEach(function (fn) {
      try { fn(payload); } catch (e) { console.warn('[HshsApp] listener error', e); }
    });
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    return function off() {
      listeners[event] = listeners[event].filter(function (f) { return f !== fn; });
    };
  }

  function setState(partial) { Object.assign(state, partial || {}); }
  function getState() { return Object.assign({}, state); }

  function markReady() {
    if (state.ready) return;
    state.ready = true;
    emit('ready', getState());
  }

  function whenReady(fn) {
    if (typeof fn !== 'function') return function () {};
    if (state.ready) {
      try { fn(getState()); } catch (e) { reportError(e, 'app.whenReady'); }
      return function () {};
    }
    return on('ready', fn);
  }

  function reportError(err, context) {
    var entry = { message: (err && err.message) || String(err), context: context || 'unknown', time: Date.now() };
    state.errors.push(entry);
    if (state.errors.length > 20) state.errors.shift();
    emit('error', entry);
    console.warn('[HshsApp]', entry.context, entry.message);
  }

  global.HshsApp = {
    version: state.version,
    getState: getState,
    setState: setState,
    on: on,
    whenReady: whenReady,
    markReady: markReady,
    reportError: reportError,
    isReady: function () { return state.ready; },
    emit: emit
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(markReady, 50); }, { once: true });
  } else {
    setTimeout(markReady, 50);
  }
})(typeof window !== 'undefined' ? window : this);
