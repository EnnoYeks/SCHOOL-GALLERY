(function () {
  if (window.__hshsTopbarFix) return;
  window.__hshsTopbarFix = true;

  function inSub() {
    return /\/index\//i.test(location.pathname);
  }
  function href(file) {
    return inSub() ? file : 'index/' + file;
  }
  function go(file) {
    var url = href(file);
    try {
      if (typeof window.__hshsNavigate === 'function') {
        window.__hshsNavigate(url);
        return;
      }
    } catch (e) {}
    location.href = url;
  }
  function guestPic() {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<circle cx="32" cy="32" r="32" fill="#1d4ed8"/>' +
      '<circle cx="32" cy="24" r="10" fill="white"/>' +
      '<path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/>' +
      '</svg>'
    );
  }
  function photoUrl() {
    try {
      var fb = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      if (fb && fb.photoURL) return fb.photoURL;
    } catch (e) {}
    try {
      var u = window.hshsAuthUser;
      if (u && u.photoURL) return u.photoURL;
    } catch (e) {}
    try {
      if (window.HshsPeople && typeof window.HshsPeople.me === 'function') {
        var me = window.HshsPeople.me();
        if (me && (me.photoURL || me.avatar)) return me.photoURL || me.avatar;
      }
    } catch (e) {}
    try {
      var p = JSON.parse(localStorage.getItem('userProfile') || 'null') || {};
      if (p.profilePhoto || p.photoURL || p.avatar) return p.profilePhoto || p.photoURL || p.avatar;
    } catch (e) {}
    try {
      var s = window.HshsStore && window.HshsStore.currentUser && window.HshsStore.currentUser();
      if (s && s.avatar) return s.avatar;
    } catch (e) {}
    return guestPic();
  }
  function paintAvatar() {
    var url = photoUrl();
    document.querySelectorAll('.navbar .profile-img, .navbar #profileImg, .navbar .profile-icon img, .navbar .hshs-avatar, .navbar .hshs-profile img').forEach(function (img) {
      if (!img || img.getAttribute('data-hshs-ava') === url) return;
      img.setAttribute('data-hshs-ava', url);
      img.src = url;
      img.alt = 'Your profile';
    });
  }
  function bindIcon(el, file) {
    if (!el || el.__hshsTopBound === file) return;
    el.__hshsTopBound = file;
    el.setAttribute('role', 'button');
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      go(file);
    }, true);
  }
  function bindTopIcons() {
    document.querySelectorAll('.navbar .notification-icon, .navbar #hshsBell').forEach(function (el) {
      bindIcon(el, 'notifications.html');
      el.setAttribute('title', 'Notifications');
      el.setAttribute('aria-label', 'Notifications');
    });
    document.querySelectorAll('.navbar .profile-icon, .navbar .hshs-profile, .navbar #navProfile').forEach(function (el) {
      bindIcon(el, 'more.html');
      el.setAttribute('title', 'More');
      el.setAttribute('aria-label', 'Account and more');
    });
  }
  function bindMoreTab() {
    document.querySelectorAll('#openMoreSheet, .mobile-tabbar a[data-tab="more"]').forEach(function (el) {
      if (el.__hshsMorePageBound) return;
      el.__hshsMorePageBound = true;
      el.setAttribute('href', href('more.html'));
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        try { if (window.__hshsCloseMore) window.__hshsCloseMore(); } catch (err) {}
        go('more.html');
      }, true);
    });
  }
  function boot() {
    document.body.classList.add('has-mobile-shell');
    paintAvatar();
    bindTopIcons();
    bindMoreTab();
  }

  document.addEventListener('hshs:auth', boot);
  document.addEventListener('hshs:profile', boot);
  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 900);
  setTimeout(boot, 1800);
})();
