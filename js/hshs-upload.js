/* temporary: load last known-good Studio from commit until full file is restored */
(function () {
  if (window.__hshsUpload) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@255cb6608129cf952fb2c8de957a7254ae830099/js/hshs-upload.js';
  s.async = false;
  document.head.appendChild(s);
})();
