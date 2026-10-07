(function () {
  var root = document.documentElement;
  var mobile = window.matchMedia('(max-width:1024px)').matches;
  root.classList.toggle('hshs-device-mobile', mobile);
  root.classList.toggle('hshs-device-desktop', !mobile);
  root.classList.add('hshs-ready');
  root.classList.remove('hshs-booting');
  if (window.HshsPaint) window.HshsPaint.now();
})();
