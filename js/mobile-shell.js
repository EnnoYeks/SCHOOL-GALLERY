/**
 * HSHS mobile shell
 * In-app taps mount the page template (same path as Home) instead of
 * dumping the fetched HTML file into #hshs-page.
 */
(function () {
  if (window.__hshsTemplateNav) return;
  window.__hshsTemplateNav = true;
  window.__hshsMobileShell = true;
  window.__hshsMobileShellBoot = true;

  var VER = '261004fn1';
  var ALIAS = {
    '': 'home',
    index: 'home',
    'index.html': 'home',
    vibe: 'buzz',
    studio: 'videos',
    clips: 'buzz',
    shorts: 'buzz',
    contat: 'contact'
  };
  var TITLES = {
    home: 'HSHS World',
    gallery: 'Gallery',
    photos: 'Photos',
    videos: 'HSHS Studio',
    buzz: 'Buzz',
    trending: 'Trending',
    spotlight: 'Spotlight',
    polls: 'Polls',
    memories: 'Memories',
    more: 'More',
    about: 'About',
    contact: 'Contact',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    saved: 'Saved',
    search: 'Search',
    chat: 'Chat'
  };
  var PAGE_CSS = {
    home: ['home.css', 'hshs-home-polish.css', 'hshs-vibe-home.css'],
    gallery: ['gallery.css', 'hshs-wave.css'],
    photos: ['photos.css', 'photos-campus.css'],
    videos: ['videos.css', 'vibe.css', 'hshs-hub.css'],
    buzz: ['buzz.css', 'hshs-wave.css'],
    chat: ['hshs-chat-ui.css', 'hshs-chat-desktop.css', 'hshs-chat.css'],
    about: ['hshs-about.css'],
    contact: ['hshs-contact.css'],
    trending: ['trending.css', 'hshs-hub.css'],
    polls: ['polls.css', 'hshs-hub.css'],
    memories: ['memories.css'],
    more: ['hshs-more.css', 'hshs-hub.css'],
    search: ['hshs-search.css', 'hshs-account.css'],
    spotlight: ['spotlight.css'],
    settings: ['hshs-settings.css'],
    profile: ['hshs-profile.css', 'hshs-profile-photo.css'],
    notifications: ['hshs-account.css', 'hshs-hub.css'],
    saved: ['hshs-account.css']
  };
  var HARD = { admin: 1, login: 1, 'edit-profile': 1 };
  var GUEST_PIC = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1d4ed8"/><circle cx="32" cy="24" r="10" fill="white"/><path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/></svg>'
  );
  var loadedScripts = Object.create(null);

  function currentFile() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }
  function inSub() {
    return location.pathname.indexOf('/index/') !== -1;
  }
  function homeHref() { return inSub() ? '../index.html' : 'index.html'; }
  function sub(name) { return inSub() ? name : 'index/' + name; }
  function jsBase() {
    return inSub() ? '../js/' : 'js/';
  }
  function cssBase() {
    return inSub() ? '../css/' : 'css/';
  }
  function pageName(url) {
    var file = currentFile();
    try {
      if (url) file = (new URL(url, location.href).pathname.split('/').pop() || 'index.html').toLowerCase();
    } catch (e) {}
    var key = file.replace(/\.html$/, '');
    return ALIAS[file] || ALIAS[key] || key || 'home';
  }
  var PAGE_FILES = {
    'gallery.html': 1, 'photos.html': 1, 'videos.html': 1, 'trending.html': 1,
    'spotlight.html': 1, 'polls.html': 1, 'memories.html': 1, 'about.html': 1,
    'contact.html': 1, 'contat.html': 1, 'profile.html': 1, 'settings.html': 1,
    'admin.html': 1, 'clips.html': 1, 'shorts.html': 1, 'buzz.html': 1,
    'chat.html': 1, 'more.html': 1, 'search.html': 1, 'saved.html': 1,
    'notifications.html': 1, 'login.html': 1, 'edit-profile.html': 1
  };
  function appRoot() {
    var path = location.pathname || '/';
    var cut = path.indexOf('/index/');
    if (cut !== -1) return path.slice(0, cut + 1);
    return path.replace(/[^/]*$/, '');
  }
  function canonicalize(url) {
    var next = new URL(url, location.href);
    var file = (next.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file) file = 'index.html';
    if (file === 'contat.html') file = 'contact.html';
    if (file === 'clips.html' || file === 'shorts.html') file = 'buzz.html';
    if (file === 'index.html' || PAGE_FILES[file]) {
      var root = appRoot();
      if (root.charAt(root.length - 1) !== '/') root += '/';
      next.pathname = file === 'index.html' ? (root + 'index.html') : (root + 'index/' + file);
    }
    return next;
  }
  function fixLinks(scope) {
    var root = scope || document;
    root.querySelectorAll('a[href]').forEach(function (a) {
      var raw = a.getAttribute('href') || '';
      if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0 || raw.indexOf('tel:') === 0) return;
      try {
        var next = canonicalize(a.href);
        if (next.origin !== location.origin) return;
        a.setAttribute('href', next.pathname + next.search + next.hash);
      } catch (e) {}
    });
  }
  function isAdmin() {
    try { return !!localStorage.getItem('adminToken'); } catch (e) { return false; }
  }
  function guestMe() {
    var p = {};
    try {
      if (window.profileManager && typeof window.profileManager.getProfile === 'function') {
        p = window.profileManager.getProfile() || {};
      }
    } catch (e) {}
    try {
      var stored = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (stored) p = Object.assign({}, stored, p);
    } catch (e) {}
    var photo = p.profilePhoto || GUEST_PIC;
    if (!photo || /placeholder/i.test(photo)) photo = GUEST_PIC;
    var klass = p.className && p.className !== 'N/A' ? p.className : 'Hawthorne Scribner';
    var role = p.role ? String(p.role) : 'Student';
    return {
      name: p.fullName || 'Guest student',
      line: role.charAt(0).toUpperCase() + role.slice(1) + ' · ' + klass,
      photo: photo
    };
  }
  function fillMoreMe() {
    var me = guestMe();
    var name = document.getElementById('moreMeName');
    var line = document.getElementById('moreMeLine');
    var pic = document.getElementById('moreMePic');
    if (name) name.textContent = me.name;
    if (line) line.textContent = me.line;
    if (pic) pic.src = me.photo;
  }
  function routes() {
    var more = [
      { href: sub('chat.html'), icon: 'fa-comments', label: 'Chat', tone: 'sky', match: ['chat.html'] },
      { href: sub('spotlight.html'), icon: 'fa-trophy', label: 'Spotlight', tone: 'gold', match: ['spotlight.html'] },
      { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', tone: 'ember', match: ['trending.html'] },
      { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', tone: 'teal', match: ['photos.html'] },
      { href: sub('videos.html'), icon: 'fa-play', label: 'Studio', tone: 'navy', match: ['videos.html'] },
      { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', tone: 'leaf', match: ['polls.html'] },
      { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', tone: 'lilac', match: ['memories.html'] },
      { href: sub('about.html'), icon: 'fa-graduation-cap', label: 'About', tone: 'navy', match: ['about.html'] },
      { href: sub('contact.html'), icon: 'fa-envelope', label: 'Contact', tone: 'cyan', match: ['contact.html', 'contat.html'] },
      { href: sub('settings.html'), icon: 'fa-gear', label: 'Settings', tone: 'slate', match: ['settings.html'] }
    ];
    if (isAdmin()) more.push({ href: sub('admin.html'), icon: 'fa-user-shield', label: 'Staff', tone: 'gold', match: ['admin.html'] });
    return {
      PRIMARY: [
        { href: homeHref(), icon: 'fa-house', label: 'Home', match: ['index.html', ''] },
        { href: sub('buzz.html'), icon: 'fa-bolt', label: 'Buzz', match: ['buzz.html', 'clips.html', 'shorts.html'] },
        { href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] }
      ],
      MORE: more
    };
  }
  function isActive(item) {
    var file = currentFile();
    if (file === 'index.html' || file === '') return item.match.indexOf('index.html') !== -1 || item.match.indexOf('') !== -1;
    return item.match.indexOf(file) !== -1;
  }
  function closeMore() {
    var sheet = document.getElementById('moreSheet');
    var backdrop = document.getElementById('moreBackdrop');
    if (sheet) sheet.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('more-open');
  }
  function openMore() {
    fillMoreMe();
    var sheet = document.getElementById('moreSheet');
    var backdrop = document.getElementById('moreBackdrop');
    if (sheet) sheet.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('more-open');
  }
  function toggleMore() {
    var sheet = document.getElementById('moreSheet');
    if (sheet && sheet.classList.contains('open')) closeMore();
    else openMore();
  }
  function markActive() {
    var file = currentFile();
    var moreFiles = ['photos.html', 'videos.html', 'polls.html', 'memories.html', 'about.html', 'contact.html', 'contat.html', 'profile.html', 'settings.html', 'trending.html', 'spotlight.html', 'chat.html', 'search.html', 'saved.html', 'notifications.html', 'more.html'];
    document.querySelectorAll('.mobile-tabbar a').forEach(function (a) {
      var tab = a.getAttribute('data-tab');
      if (!tab || tab === 'upload') return;
      var on = false;
      if (tab === 'home') on = file === 'index.html' || file === '';
      else if (tab === 'more') on = moreFiles.indexOf(file) !== -1;
      else on = file === tab + '.html' || (tab === 'buzz' && (file === 'clips.html' || file === 'shorts.html'));
      a.classList.toggle('active', on);
    });
    document.querySelectorAll('.navbar .nav-link, .more-grid a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      var on = href === file || ((file === 'index.html' || file === '') && href === 'index.html') || (file === 'contact.html' && href === 'contat.html');
      a.classList.toggle('active', on);
    });
  }
  function rebuildMoreGrid() {
    var grid = document.querySelector('#moreSheet .more-grid');
    if (!grid) return;
    grid.innerHTML = routes().MORE.map(function (item) {
      return '<a href="' + item.href + '" data-tone="' + item.tone + '" class="' + (isActive(item) ? 'active' : '') + '"><span class="ico"><i class="fas ' + item.icon + '"></i></span><span>' + item.label + '</span></a>';
    }).join('');
  }
  function buildBar() {
    if (document.querySelector('.mobile-tabbar')) return;
    document.body.classList.add('has-mobile-shell', 'hshs-nav-slim');
    var r = routes();
    var moreActive = r.MORE.some(isActive) || currentFile() === 'profile.html';
    var bar = document.createElement('nav');
    bar.className = 'mobile-tabbar';
    bar.setAttribute('aria-label', 'Primary');
    bar.innerHTML =
      '<a href="' + r.PRIMARY[0].href + '" class="' + (isActive(r.PRIMARY[0]) ? 'active' : '') + '" data-tab="home"><i class="fas fa-house"></i><span>Home</span></a>' +
      '<a href="' + r.PRIMARY[1].href + '" class="' + (isActive(r.PRIMARY[1]) ? 'active' : '') + '" data-tab="buzz"><i class="fas fa-bolt"></i><span>Buzz</span></a>' +
      '<button type="button" class="tab-upload" data-tab="upload" id="openUploadStudio" aria-label="Upload"><span class="tab-upload-btn"><i class="fas fa-plus"></i></span></button>' +
      '<a href="' + r.PRIMARY[2].href + '" class="' + (isActive(r.PRIMARY[2]) ? 'active' : '') + '" data-tab="gallery"><i class="fas fa-images"></i><span>Gallery</span></a>' +
      '<a href="#more" class="' + (moreActive ? 'active' : '') + '" data-tab="more" id="openMoreSheet"><i class="fas fa-ellipsis"></i><span>More</span></a>';
    var backdrop = document.createElement('div');
    backdrop.className = 'more-backdrop';
    backdrop.id = 'moreBackdrop';
    var sheet = document.createElement('aside');
    sheet.className = 'more-sheet';
    sheet.id = 'moreSheet';
    sheet.innerHTML =
      '<div class="more-handle" aria-hidden="true"></div>' +
      '<button type="button" class="more-close" id="closeMoreSheet" aria-label="Close">×</button>' +
      '<a class="more-me" href="' + sub('profile.html') + '" id="moreMeCard">' +
      '<img class="more-me-pic" id="moreMePic" alt="Your profile">' +
      '<span class="more-me-copy"><strong id="moreMeName">Guest student</strong>' +
      '<small id="moreMeLine">Student · Hawthorne Scribner</small></span>' +
      '<span class="more-me-go">View profile</span></a>' +
      '<p class="more-kicker">All pages</p><div class="more-grid"></div>';
    document.body.appendChild(bar);
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
    rebuildMoreGrid();
    fillMoreMe();
    document.getElementById('openUploadStudio').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMore();
      if (window.__hshsOpenUploadForPage) window.__hshsOpenUploadForPage(location.pathname);
      else if (window.__hshsOpenUpload) window.__hshsOpenUpload();
    });
    document.getElementById('openMoreSheet').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMore();
    });
    document.getElementById('closeMoreSheet').addEventListener('click', function (e) {
      e.preventDefault();
      closeMore();
    });
    backdrop.addEventListener('click', closeMore);
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('.more-grid a') || e.target.closest('.more-me')) closeMore();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMore(); });
  }
  function ensurePopCss() {
    if (document.getElementById('hshs-tpl-pop')) return;
    var st = document.createElement('style');
    st.id = 'hshs-tpl-pop';
    st.textContent = '#hshs-page.hshs-pop > :not(.hshs-load-skel){animation:hshs-pop-in 220ms ease}@media (prefers-reduced-motion:reduce){#hshs-page.hshs-pop > :not(.hshs-load-skel){animation:none}}';
    document.head.appendChild(st);
  }
  function loadScript(src, id) {
    return new Promise(function (resolve) {
      if (id && (document.getElementById(id) || loadedScripts[id])) return resolve();
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = function () { loadedScripts[id || src] = 1; resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  function loadCss(file) {
    return new Promise(function (resolve) {
      var href = cssBase() + file;
      var links = document.querySelectorAll('link[rel="stylesheet"]');
      for (var i = 0; i < links.length; i++) {
        if ((links[i].getAttribute('href') || '').indexOf(file) !== -1) return resolve();
      }
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href + (href.indexOf('?') === -1 ? '?' : '&') + 'v=' + VER;
      l.onload = resolve;
      l.onerror = resolve;
      document.head.appendChild(l);
      setTimeout(resolve, 500);
    });
  }
  function rootEl() {
    var root = document.getElementById('hshs-page');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'hshs-page';
    document.body.appendChild(root);
    return root;
  }
  function popIn(root) {
    root.classList.remove('hshs-pop');
    void root.offsetWidth;
    root.classList.add('hshs-pop');
    document.documentElement.classList.remove('hshs-booting');
    document.documentElement.classList.add('hshs-ready');
    window.__hshsBootDone = true;
    var boot = document.getElementById('hshs-boot');
    if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    var sk = root.querySelector('.hshs-load-skel');
    if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
  }
  function clearBindFlags(root) {
    if (!root || !root.dataset) return;
    Object.keys(root.dataset).forEach(function (k) { delete root.dataset[k]; });
  }
  async function ensureTemplate(name) {
    if (window.HshsTemplates && window.HshsTemplates[name]) return window.HshsTemplates[name];
    await loadScript(jsBase() + 'core/templates/' + name + '.js?v=' + VER, 'hshs-tpl-' + name);
    return window.HshsTemplates && window.HshsTemplates[name];
  }
  async function ensurePageScript(name) {
    await loadScript(jsBase() + 'pages/' + name + '.js?v=' + VER, 'hshs-page-mod-' + name);
  }
  async function navigate(url, fromHistory) {
    var next;
    try { next = canonicalize(url); } catch (e) { location.href = url; return; }
    if (next.origin !== location.origin) { location.href = next.href; return; }
    if (next.hash === '#more') { toggleMore(); return; }
    var name = pageName(next.href);
    if (HARD[name]) { location.assign(next.href); return; }
    closeMore();
    var tpl = await ensureTemplate(name);
    if (!tpl) { location.assign(next.href); return; }
    if (!fromHistory) history.pushState({ url: next.href, page: name }, '', next.href);
    document.documentElement.setAttribute('data-hshs-page', name);
    document.body.classList.toggle('vibe-watching', name === 'buzz');
    var root = rootEl();
    clearBindFlags(root);
    window.__hshsHomeMounted = false;
    window.__hshsRevealQueued = false;
    var css = PAGE_CSS[name] || [];
    await Promise.all(css.map(loadCss));
    if (window.HshsRender && window.HshsRender.mountHTML) window.HshsRender.mountHTML(root, tpl);
    else root.innerHTML = tpl;
    document.title = TITLES[name] || 'HSHS World';
    fixLinks(document);
    rebuildMoreGrid();
    markActive();
    popIn(root);
    window.scrollTo(0, 0);
    await ensurePageScript(name);
    document.dispatchEvent(new CustomEvent('hshs:page', { detail: { page: name, url: next.href } }));
    if (window.HshsRoute && window.HshsRoute.reveal) window.HshsRoute.reveal();
    document.title = TITLES[name] || 'HSHS World';
    fixLinks(document);
  }

  function isAppLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    if (anchor.target === '_blank') return false;
    var raw = anchor.getAttribute('href') || '';
    if (!raw || raw.indexOf('mailto:') === 0 || raw.indexOf('tel:') === 0) return false;
    if (raw === '#more') return true;
    if (raw.charAt(0) === '#') return false;
    var next;
    try { next = new URL(anchor.href, location.href); } catch (e) { return false; }
    if (next.origin !== location.origin) return false;
    var file = (next.pathname.split('/').pop() || '').toLowerCase();
    if (file && file.indexOf('.') !== -1 && !/\.html$/i.test(file)) return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!isAppLink(a)) return;
    var raw = a.getAttribute('href') || '';
    if (raw === '#more') {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      toggleMore();
      return;
    }
    var name = pageName(a.href);
    if (HARD[name]) return;
    e.preventDefault();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    navigate(a.href);
  }, true);

  window.addEventListener('popstate', function () {
    closeMore();
    navigate(location.href, true);
  });

  function boot() {
    ensurePopCss();
    buildBar();
    markActive();
    history.replaceState({ url: location.href, page: pageName() }, '', location.href);
    if (window.__hshsBootMark) window.__hshsBootMark('shell', 1);
  }

  window.__hshsNavigate = navigate;
  window.__hshsCloseMore = closeMore;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
