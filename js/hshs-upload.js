/**
 * HSHS Upload Studio loader — local vendored Studio (no CDN).
 * Full UI lives in js/hshs-upload-studio.js
 * Context lock applied by hshs-upload-context.js when present.
 */
(function () {
  'use strict';

  function loadStudio() {
    if (window.HshsUploadStudio) return Promise.resolve(window.HshsUploadStudio);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = (window.__HSHS_BASE || '') + '/js/hshs-upload-studio.js';
      s.async = true;
      s.onload = function () {
        if (window.HshsUploadStudio) resolve(window.HshsUploadStudio);
        else reject(new Error('HshsUploadStudio not exported'));
      };
      s.onerror = function () { reject(new Error('Failed to load hshs-upload-studio.js')); };
      document.head.appendChild(s);
    });
  }

  window.HshsUpload = {
    open: function (opts) {
      return loadStudio().then(function (Studio) {
        return Studio.open(opts || {});
      });
    },
    close: function () {
      if (window.HshsUploadStudio && window.HshsUploadStudio.close) {
        window.HshsUploadStudio.close();
      }
    }
  };
})();
