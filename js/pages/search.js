(function (g) {
  'use strict';
  if (g.__hshsSearchPageModule) return;
  g.__hshsSearchPageModule = true;
  var PAGE = 'search';
  var TAB = 'all';
  var TIMER = 0;
  var KEY = 'hshsWorldSearchRecent';
  var lastQ = '';

  function isPage() {
    try {
      if (g.HshsRegistry && g.HshsRegistry.activeRoute) return g.HshsRegistry.activeRoute().name === PAGE;
    } catch (e) {}
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'search.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function loadCss() {
    if (document.querySelector('link[data-hshs-search-css]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + 'css/hshs-account.css?v=260921s1';
    l.setAttribute('data-hshs-search-css', '1');
    document.head.appendChild(l);
    var s = document.createElement('link');
    s.rel = 'stylesheet';
    s.href = base() + 'css/hshs-search.css?v=260921s1';
    document.head.appendChild(s);
  }
  function recents() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function saveRecent(q) {
    q = String(q || '').trim();
    if (q.length < 2) return;
    var list = recents().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
    list.unshift(q);
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8))); } catch (e) {}
  }
  function mediaOf(p) { return p.imageUrl || p.thumbnailUrl || p.image || p.cover || ''; }
  function isVideo(p) {
    return String(p.type || '').toLowerCase().indexOf('video') !== -1 || !!(p.videoUrl || p.video_url);
  }
  function profileHref(u) {
    if (g.HshsPeople && g.HshsPeople.profileUrl) return g.HshsPeople.profileUrl(u);
    return 'profile.html?uid=' + encodeURIComponent(u.uid || u.id || '');
  }
  function personRow(u, opts) {
    opts = opts || {};
    var name = u.name || u.fullName || 'HSHS Student';
    var user = String(u.username || 'student').replace(/^@/, '');
    var photo = u.photoURL || u.avatar || '';
    var av = photo
      ? '<img src="' + esc(photo) + '" alt="">'
      : esc(name.charAt(0).toUpperCase());
    var follow = opts.follow
      ? '<button type="button" class="hs-follow" data-hs-follow="' + esc(u.uid || u.id || '') + '">Follow</button>'
      : '';
    return '<a class="hs-person" href="' + esc(profileHref(u)) + '">' +
      '<span class="hs-ava">' + av + '</span>' +
      '<span><b>' + esc(name) + '</b><small>@' + esc(user) + (u.classYear ? ' · ' + esc(u.classYear) : '') + '</small></span>' +
      follow + '</a>';
  }
  function mediaCell(p) {
    var href = isVideo(p) ? 'videos.html' : 'photos.html';
    return '<a class="hs-cell" href="' + href + '" title="' + esc(p.title || 'Moment') + '">' +
      (mediaOf(p) ? '<img src="' + esc(mediaOf(p)) + '" alt="" loading="lazy">' : '') +
      (isVideo(p) ? '<i class="fas fa-play mark"></i>' : '') +
      '</a>';
  }
  function matchText(item, q) {
    var blob = [
      item.title, item.description, item.caption, item.category, item.classTag,
      item.author, item.name, item.fullName, item.username, item.bio, item.role
    ].join(' ').toLowerCase();
    return blob.indexOf(q) !== -1;
  }
  function paintRecents() {
    var box = $('hsRecent');
    if (!box) return;
    var list = recents();
    if (!list.length) {
      box.innerHTML = '<button type="button" class="hs-chip" data-hs-q="sports day"><i class="fas fa-clock-rotate-left"></i>Sports Day</button>' +
        '<button type="button" class="hs-chip" data-hs-q="assembly"><i class="fas fa-clock-rotate-left"></i>Assembly</button>' +
        '<button type="button" class="hs-chip" data-hs-q="science fair"><i class="fas fa-clock-rotate-left"></i>Science Fair</button>';
      return;
    }
    box.innerHTML = list.map(function (q) {
      return '<button type="button" class="hs-chip" data-hs-q="' + esc(q) + '"><i class="fas fa-clock-rotate-left"></i>' + esc(q) + '</button>';
    }).join('');
  }
  async function paintSuggest() {
    var box = $('hsSuggest');
    if (!box) return;
    var rows = [];
    try {
      if (g.HshsPeople && g.HshsPeople.listUsers) rows = await g.HshsPeople.listUsers();
    } catch (e) { rows = []; }
    rows = (rows || []).slice(0, 6);
    if (!rows.length) {
      box.innerHTML = '<div class="hs-empty"><p>Sign in to find classmates here.</p></div>';
      return;
    }
    box.innerHTML = rows.map(function (u) { return personRow(u, { follow: true }); }).join('');
  }
  function showHome(on) {
    var home = $('hsSearchHome');
    var results = $('hsSearchResults');
    if (home) home.hidden = !on;
    if (results) results.hidden = !!on;
  }
  async function gather(q) {
    q = String(q || '').toLowerCase().trim().replace(/^@/, '');
    var people = [];
    var posts = [];
    var photos = [];
    var videos = [];
    try {
      if (g.HshsPeople && g.HshsPeople.search) people = await g.HshsPeople.search(q);
      else if (g.db && g.db.searchUsers) people = await g.db.searchUsers(q, 24);
    } catch (e) { people = []; }
    try { if (g.db && g.db.getPosts) posts = await g.db.getPosts(40, 0); } catch (e) {}
    try { if (g.db && g.db.getPhotos) photos = await g.db.getPhotos(40, 0); } catch (e) {}
    try { if (g.db && g.db.getVideos) videos = await g.db.getVideos(24, 0); } catch (e) {}
    if (q) {
      posts = (posts || []).filter(function (p) { return matchText(p, q); });
      photos = (photos || []).filter(function (p) { return matchText(p, q); });
      videos = (videos || []).filter(function (p) { return matchText(p, q); });
    }
    return { people: people || [], posts: posts || [], photos: photos || [], videos: videos || [] };
  }
  function paintResults(data, q) {
    var people = data.people || [];
    var photos = (data.photos || []).concat((data.posts || []).filter(function (p) { return !isVideo(p); }));
    var videos = (data.videos || []).concat((data.posts || []).filter(isVideo));
    if (TAB === 'people') { photos = []; videos = []; }
    if (TAB === 'photos') { people = []; videos = []; }
    if (TAB === 'videos') { people = []; photos = []; }
    var count = people.length + photos.length + videos.length;
    var countEl = $('hsCount');
    if (countEl) countEl.textContent = count ? (count + ' result' + (count === 1 ? '' : 's') + ' for "' + q + '"') : '';
    var pOut = $('hsPeopleOut');
    var mOut = $('hsMediaOut');
    var empty = $('hsEmpty');
    if (pOut) {
      pOut.innerHTML = people.length ? ('<p class="hs-kicker">People</p>' + people.map(function (u) {
        return personRow(u, { follow: true });
      }).join('')) : '';
    }
    if (mOut) {
      var cells = (TAB === 'videos' ? videos : TAB === 'photos' ? photos : photos.concat(videos)).slice(0, 24);
      mOut.innerHTML = cells.map(mediaCell).join('');
      mOut.hidden = !cells.length;
    }
    if (empty) {
      empty.hidden = count > 0;
      empty.innerHTML = count ? '' : '<div class="hs-empty"><i class="fas fa-magnifying-glass"></i><h3>No matches</h3><p>Try a name, class, or event like Sports Day.</p></div>';
    }
  }
  async function run(q) {
    q = String(q || '').trim();
    lastQ = q;
    var clear = $('hsSearchClear');
    if (clear) clear.hidden = q.length === 0;
    if (q.length < 1) {
      showHome(true);
      return;
    }
    showHome(false);
    var empty = $('hsEmpty');
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = '<div class="hs-empty"><i class="fas fa-spinner fa-spin"></i><h3>Searching…</h3></div>';
    }
    var data = await gather(q);
    if (lastQ !== q) return;
    paintResults(data, q);
    saveRecent(q);
    paintRecents();
  }
  function bind() {
    if (g.__hshsSearchPageBound) return;
    g.__hshsSearchPageBound = true;
    document.addEventListener('input', function (e) {
      if (!isPage() || e.target.id !== 'hsSearchInput') return;
      clearTimeout(TIMER);
      TIMER = setTimeout(function () { run(e.target.value); }, 220);
    });
    document.addEventListener('submit', function (e) {
      if (!isPage() || e.target.id !== 'hsSearchForm') return;
      e.preventDefault();
      var input = $('hsSearchInput');
      run(input && input.value);
    });
    document.addEventListener('click', function (e) {
      if (!isPage()) return;
      var tab = e.target.closest('[data-hs-tab]');
      if (tab) {
        TAB = tab.getAttribute('data-hs-tab') || 'all';
        document.querySelectorAll('[data-hs-tab]').forEach(function (b) {
          var on = b === tab;
          b.classList.toggle('on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        var input = $('hsSearchInput');
        if (input && input.value.trim()) run(input.value);
        return;
      }
      var chip = e.target.closest('[data-hs-q]');
      if (chip) {
        var input2 = $('hsSearchInput');
        if (input2) input2.value = chip.getAttribute('data-hs-q') || '';
        run(chip.getAttribute('data-hs-q'));
        return;
      }
      if (e.target.closest('#hsSearchClear')) {
        var input3 = $('hsSearchInput');
        if (input3) input3.value = '';
        run('');
        if (input3) input3.focus();
        return;
      }
      var fol = e.target.closest('[data-hs-follow]');
      if (fol) {
        e.preventDefault();
        e.stopPropagation();
        var uid = fol.getAttribute('data-hs-follow');
        if (!g.HshsPeople || !g.HshsPeople.toggleFollow) return;
        g.HshsPeople.toggleFollow(uid).then(function (res) {
          if (!res || !res.ok) return;
          fol.textContent = res.following ? 'Following' : 'Follow';
          fol.classList.toggle('is-on', !!res.following);
        });
      }
    }, true);
  }
  function mount() {
    if (!isPage() || !g.HshsRender || !g.HshsTemplates || !g.HshsTemplates.search) return;
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    loadCss();
    g.HshsRender.mountHTML(root, g.HshsTemplates.search);
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    document.body.classList.add('has-mobile-shell');
    bind();
    paintRecents();
    paintSuggest();
    var params = new URLSearchParams(location.search);
    var q = params.get('q') || '';
    var input = $('hsSearchInput');
    if (q && input) {
      input.value = q;
      run(q);
    } else if (input) {
      setTimeout(function () { input.focus(); }, 80);
    }
  }
  function boot() {
    var go = function () {
      if (!isPage()) return;
      if (!g.HshsRender) { setTimeout(go, 40); return; }
      mount();
    };
    if (g.HshsApp && g.HshsApp.whenReady) g.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    document.addEventListener('hshs:page', function () { if (isPage()) setTimeout(go, 0); });
  }
  g.HshsSearchPage = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
