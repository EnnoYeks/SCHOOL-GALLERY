/* HSHS WORLD · desktop chrome + More menu */
(function () {
  if (window.__hshsDesktopNav) return;
  window.__hshsDesktopNav = true;

  function isDesktop() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  function inSub() {
    return /\/index\//i.test(location.pathname);
  }

  function href(file) {
    if (file === 'index.html') return inSub() ? '../index.html' : 'index.html';
    return inSub() ? file : 'index/' + file;
  }

  function applyDevice() {
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
    var more = document.getElementById('hshsDesktopMore');
    if (more) more.hidden = !desktop;
  }

  function closeMore() {
    var wrap = document.getElementById('hshsDesktopMore');
    if (wrap) wrap.classList.remove('is-open');
  }

  function openMorePanel() {
    if (!isDesktop()) return openMobileMore();
    mountMore();
    var wrap = document.getElementById('hshsDesktopMore');
    if (wrap) wrap.classList.add('is-open');
  }

  function toggleMore(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isDesktop()) return openMobileMore();
    mountMore();
    var wrap = document.getElementById('hshsDesktopMore');
    if (!wrap) return;
    wrap.classList.toggle('is-open');
  }

  function openMobileMore() {
    var tab = document.querySelector('#openMoreSheet, [data-tab="more"], .tab-more, a[href$="more.html"]');
    if (tab) {
      tab.click();
      return;
    }
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(href('more.html'));
    else location.href = href('more.html');
  }

  function isProfileTrigger(el) {
    return !!(el && el.closest && el.closest('.profile-icon, .hshs-profile, #navProfile, .navbar .hshs-avatar, a[aria-label="Profile"]'));
  }

  function mountMore() {
    if (document.getElementById('hshsDesktopMore')) return;
    var actions = document.querySelector('.navbar .nav-actions, .navbar .hshs-top-actions');
    if (!actions) return;

    var wrap = document.createElement('div');
    wrap.id = 'hshsDesktopMore';
    wrap.className = 'hshs-desk-more';
    wrap.innerHTML =
      '<button type="button" class="hshs-desk-more-btn" id="hshsDeskMoreBtn" aria-haspopup="true" title="More">' +
      '<i class="fas fa-ellipsis"></i><span>More</span></button>' +
      '<div class="hshs-desk-more-panel" role="menu">' +
      '<p class="hshs-desk-more-kicker">You</p>' +
      '<a href="' + href('profile.html') + '"><i class="fas fa-user"></i> Profile</a>' +
      '<a href="' + href('chat.html') + '"><i class="fas fa-envelope"></i> Messages</a>' +
      '<a href="' + href('notifications.html') + '"><i class="fas fa-bell"></i> Notifications</a>' +
      '<a href="' + href('saved.html') + '"><i class="fas fa-bookmark"></i> Saved</a>' +
      '<p class="hshs-desk-more-kicker">Campus</p>' +
      '<a href="' + href('spotlight.html') + '"><i class="fas fa-star"></i> Spotlight</a>' +
      '<a href="' + href('polls.html') + '"><i class="fas fa-square-poll-vertical"></i> Polls</a>' +
      '<a href="' + href('memories.html') + '"><i class="fas fa-clock-rotate-left"></i> Memories</a>' +
      '<a href="' + href('more.html') + '"><i class="fas fa-layer-group"></i> All pages</a>' +
      '<p class="hshs-desk-more-kicker">Account</p>' +
      '<a href="' + href('settings.html') + '"><i class="fas fa-gear"></i> Settings</a>' +
      '<a href="' + href('about.html') + '"><i class="fas fa-graduation-cap"></i> About</a>' +
      '<a href="' + href('contact.html') + '"><i class="fas fa-circle-question"></i> Help</a>' +
      '<a href="' + href('login.html') + '" id="hshsDeskMoreAuth"><i class="fas fa-right-to-bracket"></i> Sign in</a>' +
      '</div>';

    actions.insertBefore(wrap, actions.firstChild);
    document.getElementById('hshsDeskMoreBtn').addEventListener('click', toggleMore);
    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    refreshMoreAuth();
    wireProfileIcon();
  }

  function wireProfileIcon() {
    var icons = document.querySelectorAll('.profile-icon, .hshs-profile');
    icons.forEach(function (el) {
      if (el.__hshsMoreBound) return;
      el.__hshsMoreBound = true;
      el.style.cursor = 'pointer';
      el.setAttribute('title', 'More');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMore(e);
      }, true);
    });
  }

  function refreshMoreAuth() {
    var link = document.getElementById('hshsDeskMoreAuth');
    if (!link) return;
    var user = window.hshsAuthUser;
    var real = !!(user && !user.isAnonymous);
    if (real) {
      link.innerHTML = '<i class="fas fa-right-from-bracket"></i> Sign out';
      link.href = '#signout';
      link.onclick = function (e) {
        e.preventDefault();
        if (window.HshsAuthApi && window.HshsAuthApi.signOutUser) {
          window.HshsAuthApi.signOutUser().then(function () { location.reload(); });
        }
      };
    } else {
      link.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign in';
      link.href = href('login.html');
      link.onclick = null;
    }
  }

  function boot() {
    applyDevice();
    if (isDesktop()) mountMore();
    wireProfileIcon();
    applyDevice();
  }

  document.addEventListener('click', function (e) {
    if (isProfileTrigger(e.target)) return;
    if (e.target.closest && e.target.closest('#hshsDesktopMore')) return;
    closeMore();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMore();
  });
  document.addEventListener('hshs:auth', refreshMoreAuth);
  document.addEventListener('hshs:profile', refreshMoreAuth);
  window.addEventListener('resize', function () {
    applyDevice();
    if (isDesktop()) mountMore();
    wireProfileIcon();
  }, { passive: true });

  window.__hshsOpenMore = openMorePanel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
