(function () {
  var root = document.documentElement;
  var mobile = window.matchMedia('(max-width: 1024px)').matches;
  root.classList.toggle('hshs-device-mobile', mobile);
  root.classList.toggle('hshs-device-desktop', !mobile);
  root.classList.add('hshs-booting');
  root.classList.remove('hshs-ready');
})();
