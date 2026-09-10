/* temporary bootstrap — last good upload studio */
(function () {
  if (window.__hshsUploadBoot) return;
  window.__hshsUploadBoot = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@6cd6f75fc6f80bb77a2deeea0b749301b9202ee1/js/hshs-upload.js';
  s.async = false;
  s.onload = function () {
    // After load, soft-rename studio chrome + destinations when UI opens
    var obs = new MutationObserver(function () {
      var head = document.querySelector('#hshsUploadStudio .hshs-upload-head strong');
      if (head && (head.textContent === 'Create' || head.textContent === 'Place it')) {
        head.textContent = 'HSHS Studio';
      }
      document.querySelectorAll('#hshsUploadStudio [data-dest="vibe"] b').forEach(function (n) {
        if (n.textContent === 'Vibe') n.textContent = 'Buzz';
      });
      document.querySelectorAll('#hshsUploadStudio [data-dest="buzz"] b').forEach(function (n) {
        if (n.textContent === 'Buzz') n.textContent = 'Vibe';
      });
      document.querySelectorAll('#hshsUploadStudio [data-dest="vibe"] small').forEach(function (n) {
        if (/Long/.test(n.textContent)) n.textContent = 'Short clips · vertical';
      });
      document.querySelectorAll('#hshsUploadStudio [data-dest="buzz"] small').forEach(function (n) {
        if (/Short/.test(n.textContent)) n.textContent = 'Long school videos';
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  };
  document.head.appendChild(s);
})();
