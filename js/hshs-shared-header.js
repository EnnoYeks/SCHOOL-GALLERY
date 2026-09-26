(function () {
  if (window.__hshsSharedHeader) return;
  window.__hshsSharedHeader = true;

  function signedIn() {
    try {
      if (window.HshsPeople && window.HshsPeople.me && window.HshsPeople.me()) return window.HshsPeople.me();
    } catch (e) {}
    try {
      if (window.hshsAuthUser && !window.hshsAuthUser.isAnonymous) return window.hshsAuthUser;
    } catch (e) {}
    try {
      var p = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (p && p.uid && (p.email || p.fullName || p.username)) return p;
    } catch (e) {}
    return null;
  }

  function stripSettings() {
    document.querySelectorAll('.navbar .hshs-settings-btn, .navbar #hshsSettingsBtn, .navbar #themeToggle, .navbar .theme-toggle, .navbar a[title="Settings"], .navbar a[aria-label="Settings"]').forEach(function (el) {
      el.remove();
    });
  }

  function paintChip() {
    var actions = document.querySelector('.navbar .nav-actions, .navbar .hshs-top-actions');
    if (!actions) return;
    var chip = document.getElementById('hshsSessionChip');
    if (!chip) {
      chip = document.createElement('span');
      chip.id = 'hshsSessionChip';
      chip.className = 'hshs-session-chip';
      var profile = actions.querySelector('.profile-icon, .hshs-profile');
      if (profile) actions.insertBefore(chip, profile);
      else actions.appendChild(chip);
    }
    var who = signedIn();
    var name = who && (who.name || who.fullName || who.displayName || who.username || '');
    var email = who && (who.email || '');
    chip.className = 'hshs-session-chip ' + (who ? 'is-in' : 'is-guest');
    chip.innerHTML = who
      ? '<i class="fas fa-circle-check"></i><em>Signed in</em>'
      : '<i class="fas fa-user"></i><em>Guest</em>';
    chip.title = who ? ('Signed in' + (name ? ' as ' + name : '') + (email ? ' · ' + email : '')) : 'Browsing as guest';
  }

  function paintMoreCard() {
    var name = document.getElementById('morePageName');
    if (!name) return;
    var who = signedIn();
    var emailEl = document.getElementById('morePageEmail');
    var roleEl = document.getElementById('morePageRole');
    var pic = document.getElementById('morePagePic');
    var badge = document.getElementById('morePageStatus');
    var card = document.getElementById('morePageMe');
    if (!who) return;
    var label = who.name || who.fullName || who.displayName || who.username || 'HSHS Student';
    var email = who.email || (who.username ? '@' + String(who.username).replace(/^@/, '') : 'Signed in');
    var role = who.role || 'Student';
    if (who.classYear) role += ' · ' + who.classYear;
    name.textContent = label;
    if (emailEl) emailEl.textContent = email;
    if (roleEl) roleEl.textContent = role;
    var photo = who.photoURL || who.avatar || who.profilePhoto || '';
    if (!photo) {
      var nav = document.getElementById('profileImg');
      var src = nav && nav.getAttribute('src') || '';
      if (src && src.indexOf('data:image/svg') !== 0) photo = src;
    }
    if (pic && photo) pic.innerHTML = '<img src="' + String(photo).replace(/"/g, '') + '" alt="">';
    else if (pic) pic.innerHTML = '<b>' + String(label).charAt(0).toUpperCase() + '</b>';
    if (badge) {
      badge.className = 'hshs-session-badge is-in';
      badge.innerHTML = '<i class="fas fa-circle-check"></i> Signed in';
    }
    if (card) card.classList.add('is-signed-in');
  }

  function boot() {
    try { if (window.HshsShell && window.HshsShell.ensureShell) window.HshsShell.ensureShell(); } catch (e) {}
    document.body.classList.add('has-mobile-shell');
    var navs = document.querySelectorAll('.navbar');
    for (var i = 1; i < navs.length; i++) navs[i].remove();
    stripSettings();
    paintChip();
    paintMoreCard();
  }

  document.addEventListener('hshs:auth', boot);
  document.addEventListener('hshs:profile', boot);
  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 250);
  setTimeout(boot, 900);
})();
