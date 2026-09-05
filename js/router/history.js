(function (global) {
  'use strict';
  if (global.HshsHistory) return;
  global.HshsHistory = {
    push: function (url, state) {
      try { history.pushState(state || { url: url }, '', url); return true; }
      catch (e) { if (global.HshsApp) global.HshsApp.reportError(e, 'history.push'); return false; }
    },
    replace: function (url, state) {
      try { history.replaceState(state || { url: url }, '', url); return true; }
      catch (e) { if (global.HshsApp) global.HshsApp.reportError(e, 'history.replace'); return false; }
    },
    onPop: function (fn) {
      window.addEventListener('popstate', function (e) {
        try { fn(e); } catch (err) {
          if (global.HshsApp) global.HshsApp.reportError(err, 'history.pop');
        }
      });
    },
    back: function () { history.back(); },
    forward: function () { history.forward(); }
  };
})(typeof window !== 'undefined' ? window : this);
