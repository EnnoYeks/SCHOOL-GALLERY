(function () {
  var root = document.documentElement;
  var mobile = window.matchMedia('(max-width: 1024px)').matches;
  root.classList.toggle('hshs-device-mobile', mobile);
  root.classList.toggle('hshs-device-desktop', !mobile);
  if (root.classList.contains('hshs-ready') || window.__hshsBootDone) return;
  root.classList.add('hshs-booting');
})();
