/* HSHS WORLD · keep desktop chrome in sync on wide screens */
(function () {
  if (window.__hshsDesktopNav) return;
  window.__hshsDesktopNav = true;

  function isDesktop() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  function apply() {
    var desktop = isDesktop();
    var root = document.documentElement;
    root.classList.toggle('hshs-device-desktop', desktop);
    root.classList.toggle('hshs-device-mobile', !desktop);

    var links = document.querySelector('.navbar .nav-links');
    if (links && desktop) {
      links.classList.remove('mobile-visible');
      links.style.removeProperty('display');
    }

    var bar = document.querySelector('.mobile-tabbar');
    if (bar) bar.setAttribute('aria-hidden', desktop ? 'true' : 'false');
  }

  apply();
  window.addEventListener('resize', apply, { passive: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  }
  setTimeout(apply, 400);
  setTimeout(apply, 1200);
})();
