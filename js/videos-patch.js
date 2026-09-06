(function () {
  'use strict';
  function fix() {
    if (typeof VideosPage === 'undefined') return;
    VideosPage.prototype.escape = function (v) {
      return String(v ?? '').replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    };
  }
  setTimeout(fix, 0);
  setTimeout(fix, 200);
})();
