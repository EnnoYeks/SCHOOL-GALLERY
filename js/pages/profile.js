(function (g) {
  'use strict';
  if (g.__hshsProfilePageModule) return;
  g.__hshsProfilePageModule = true;
  var PAGE = 'profile', tab = 'photos', viewCache = null, mediaCache = [], followingThem = false;

  function isPage() {
    try {
      if (g.HshsRegistry && HshsRegistry.activeRoute) return HshsRegistry.activeRoute().name === PAGE;
    } catch (e) {}
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'profile.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function people() { return g.HshsPeople || null; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c];
    });
  }
  function abbr(n) {
    n = Number(n) || 0;
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace('.0', '') + 'K';
    return String(n);
  }
  function mediaOf(p) { return p.imageUrl || p.thumbnailUrl || p.image || p.cover || ''; }
  function videoOf(p) { return p.videoUrl || p.video_url || ''; }
  function isVideo(p) { return String(p.type || '').toLowerCase().indexOf('video') !== -1 || !!videoOf(p); }
  function loadCss() {
    if (document.querySelector('link[data-hshs-profile-css]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + 'css/hshs-profile.css?v=260921people2';
    l.setAttribute('data-hshs-profile-css', '1');
    document.head.appendChild(l);
  }
  function loginUrl() {
    var path = base() + 'index/login.html';
    try {
      var u = new URL(path, location.href);
      u.searchParams.set('next', location.pathname + location.search);
      return u.pathname + u.search;
    } catch (e) { return path; }
  }
  function goLogin(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var url = loginUrl();
    try { if (typeof g.__hshsNavigate === 'function') { g.__hshsNavigate(url); return; } } catch (err) {}
    location.href = url;
  }
  function localProfile() {
    if (g.hshsProfile && g.hshsProfile.uid) return g.hshsProfile;
    try {
      var p = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (p && p.uid) return p;
    } catch (e) {}
    return null;
  }
  function me() {
    if (people() && people().me) {
      var live = people().me();
      if (live) return live;
    }
    var p = localProfile();
    if (p && p.uid) {
      return {
        id: p.uid, uid: p.uid, name: p.fullName || p.name || 'HSHS Student',
        username: p.username || '', role: p.role || 'Student', classYear: p.classYear || '',
        bio: p.bio || '', avatar: p.photoURL || p.avatar || '', photoURL: p.photoURL || p.avatar || '',
        cover: p.coverURL || p.cover || ''
      };
    }
    return null;
  }
  function authMode() {
    if (people() && people().authState) return people().authState();
    if (me()) return 'authenticated';
    if (g.hshsAuthState) return g.hshsAuthState;
    return 'loading';
  }
  async function resolveViewed() {
    var params = new URLSearchParams(location.search);
    var uid = params.get('uid');
    var user = params.get('u');
    var api = people();
    if (uid && api && api.getUser) {
      var byId = await api.getUser(uid);
      if (byId) return byId;
    }
    if (user && api && api.getByUsername) {
      var byName = await api.getByUsername(user);
      if (byName) return byName;
    }
    return me();
  }
  function isOwn(u) {
    var self = me();
    return !!(self && u && (self.uid === u.uid || self.id === u.id));
  }
  function setTxt(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v == null ? '' : v;
  }
  function paintTools(u, own) {
    var box = document.getElementById('pfTools');
    if (!box) return;
    if (!u) {
      box.innerHTML = '<button class="pf-btn pf-btn-primary" type="button" data-pf="signin"><i class="fas fa-right-to-bracket"></i> Sign in</button>';
      return;
    }
    if (own) {
      box.innerHTML = '<button class="pf-btn" type="button" data-pf="edit">Edit profile</button>';
      return;
    }
    box.innerHTML =
      '<button class="pf-btn' + (followingThem ? ' is-on' : '') + '" type="button" data-pf="follow">' +
      (followingThem ? 'Following' : 'Follow') + '</button>' +
      '<button class="pf-btn" type="button" data-pf="message">Message</button>';
  }
  function paintTags(u) {
    var box = document.getElementById('pfTags');
    if (!box) return;
    if (!u) { box.innerHTML = '<span class="pf-tag-guest">Guest</span>'; return; }
    var bits = [];
    if (u.role) bits.push(u.role);
    if (u.classYear) bits.push(u.classYear);
    if (u.house) bits.push(u.house);
    box.innerHTML = bits.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
  }
  function paintHighs(u) {
    var box = document.getElementById('pfHighs');
    if (!box) return;
    if (!u) { box.innerHTML = ''; return; }
    var items = [
      { href: base() + 'index/photos.html', label: 'Photos' },
      { href: base() + 'index/videos.html', label: 'Videos' },
      { href: base() + 'index/memories.html', label: 'Memories' },
      { href: base() + 'index/spotlight.html', label: 'Spotlight' }
    ];
    box.innerHTML = items.map(function (h) {
      return '<a class="pf-hl" href="' + h.href + '"><b>' + h.label.charAt(0) + '</b><span>' + h.label + '</span></a>';
    }).join('');
  }
  function savedIds() {
    var self = me();
    var key = 'hshsWorldSaves:' + ((self && self.uid) || 'guest');
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function paintGrid(u) {
    var grid = document.getElementById('pfGrid');
    if (!grid) return;
    if (!u) {
      if (authMode() === 'loading') {
        grid.innerHTML = '<i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i>';
        return;
      }
      grid.innerHTML =
        '<div class="pf-guest-card"><div class="pf-guest-ico"><i class="fas fa-lock"></i></div>' +
        '<h3>Your campus, unlocked</h3>' +
        '<p>Sign in with Google or email to post, follow friends, and keep your HSHS profile.</p>' +
        '<button type="button" class="pf-btn pf-btn-primary pf-btn-lg" data-pf="signin">' +
        '<i class="fas fa-right-to-bracket"></i> Sign in to continue</button></div>';
      grid._posts = [];
      return;
    }
    var list = mediaCache.slice();
    if (tab === 'photos') list = list.filter(function (p) { return !isVideo(p); });
    if (tab === 'videos') list = list.filter(isVideo);
    if (tab === 'saved') {
      var ids = savedIds();
      list = list.filter(function (p) { return ids.indexOf(p.id) !== -1; });
    }
    if (!list.length) {
      var empty = tab === 'saved' ? 'Nothing saved yet' : (tab === 'videos' ? 'No videos yet' : 'No photos yet');
      grid.innerHTML = '<div class="pf-empty">' + empty + '</div>';
      grid._posts = [];
      return;
    }
    grid.innerHTML = list.map(function (p, i) {
      return '<button class="pf-cell" type="button" data-open="' + i + '"><img src="' +
        esc(mediaOf(p)) + '" alt="' + esc(p.title || 'Moment') + '" loading="lazy">' +
        (isVideo(p) ? '<i class="fas fa-play mark"></i>' : '') +
        '<span class="likes">' + abbr(p.likes || 0) + '</span></button>';
    }).join('');
    grid._posts = list;
  }
  function paintHeader(u) {
    var own = isOwn(u);
    var cover = document.getElementById('pfCover');
    var root = document.querySelector('.pf');
    if (root) root.classList.toggle('is-guest', !u);
    if (!u) {
      if (cover) cover.style.backgroundImage = '';
      setTxt('pfUser', '@guest');
      setTxt('pfName', 'Guest User');
      setTxt('pfRole', authMode() === 'loading' ? 'Loading account...' : 'Not signed in');
      setTxt('pfBio', 'Join HSHS World \u2014 post campus moments, follow friends, and keep your profile yours.');
      setTxt('pfPosts', '0'); setTxt('pfFollowers', '0'); setTxt('pfFollowing', '0');
      var imgG = document.getElementById('pfAvaImg');
      if (imgG) { imgG.removeAttribute('src'); imgG.style.display = 'none'; }
      var fallG = document.getElementById('pfAvaFall');
      if (fallG) { fallG.style.display = ''; fallG.textContent = 'G'; }
    } else {
      if (cover) {
        var coverUrl = u.cover || u.coverURL || '';
        cover.style.backgroundImage = coverUrl ? 'url("' + String(coverUrl).replace(/"/g, '') + '")' : '';
      }
      setTxt('pfUser', u.username ? '@' + String(u.username).replace(/^@/, '') : 'profile');
      setTxt('pfName', u.name || '');
      setTxt('pfRole', (u.role || 'Student') + (u.classYear ? (' \u00b7 ' + u.classYear) : ''));
      setTxt('pfBio', u.bio || '');
      var img = document.getElementById('pfAvaImg');
      if (img) {
        var photo = u.avatar || u.photoURL || '';
        if (photo) { img.src = photo; img.style.display = ''; }
        else { img.removeAttribute('src'); img.style.display = 'none'; }
      }
      var fall = document.getElementById('pfAvaFall');
      if (fall) {
        fall.textContent = String(u.name || u.username || '?').charAt(0).toUpperCase();
        fall.style.display = (u.avatar || u.photoURL) ? 'none' : '';
      }
    }
    paintTools(u, own);
    paintTags(u);
    paintHighs(u);
    document.querySelectorAll('.pf-tabs button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === tab);
    });
    paintGrid(u);
  }
  async function refresh() {
    if (!isPage()) return;
    var u = await resolveViewed();
    viewCache = u;
    mediaCache = [];
    followingThem = false;
    paintHeader(u);
    if (!u) return;
    var api = people();
    try { if (api && api.mediaByAuthor) mediaCache = await api.mediaByAuthor(u.uid); } catch (e) { mediaCache = []; }
    var counts = { followers: 0, following: 0 };
    try { if (api && api.followCounts) counts = await api.followCounts(u.uid); } catch (e) {}
    setTxt('pfPosts', abbr(mediaCache.length));
    setTxt('pfFollowers', abbr(counts.followers || 0));
    setTxt('pfFollowing', abbr(counts.following || 0));
    if (!isOwn(u) && api && api.isFollowing) {
      try { followingThem = !!(await api.isFollowing(u.uid)); } catch (e) {}
    }
    paintHeader(u);
  }
  async function showPeople(kind) {
    var sheet = document.getElementById('pfPeople');
    var title = document.getElementById('pfPeopleTitle');
    var list = document.getElementById('pfPeopleList');
    if (!sheet || !list) return;
    var u = viewCache || me();
    if (!u) { goLogin(); return; }
    if (title) title.textContent = kind === 'followers' ? 'Followers' : 'Following';
    list.innerHTML = '<div class="pf-empty">Loading...</div>';
    sheet.hidden = false;
    var rows = [];
    try {
      if (people()) rows = kind === 'followers' ? await people().listFollowers(u.uid) : await people().listFollowing(u.uid);
    } catch (e) { rows = []; }
    if (!rows.length) {
      list.innerHTML = '<div class="pf-empty">No one here yet</div>';
      return;
    }
    list.innerHTML = rows.map(function (p) {
      var href = people() ? people().profileUrl(p) : ('profile.html?uid=' + encodeURIComponent(p.uid));
      return '<a class="pf-person" href="' + href + '"><b>' + esc((p.name || '?').charAt(0).toUpperCase()) +
        '</b><span><strong>' + esc(p.name) + '</strong><small>@' + esc(p.username || 'student') + '</small></span></a>';
    }).join('');
  }
  function bind() {
    if (g.__hshsProfileEvents) return;
    g.__hshsProfileEvents = true;
    document.addEventListener('click', function (e) {
      if (!isPage()) return;
      var t = e.target.closest('[data-pf],[data-tab],[data-open]');
      if (!t) return;
      if (t.dataset.open != null) {
        var post = (document.getElementById('pfGrid')._posts || [])[Number(t.dataset.open)];
        var box = document.getElementById('pfModal');
        var stage = document.getElementById('pfModalStage');
        var cap = document.getElementById('pfModalCap');
        if (box && stage && post) {
          box.hidden = false;
          stage.innerHTML = '<img src="' + esc(mediaOf(post)) + '" alt="">';
          if (cap) cap.textContent = post.title || '';
        }
        return;
      }
      if (t.dataset.tab) { tab = t.dataset.tab; paintHeader(viewCache || me()); return; }
      var act = t.dataset.pf;
      var u = viewCache;
      if (act === 'signin') return goLogin(e);
      if (act === 'settings') location.href = base() + 'index/settings.html';
      if (act === 'refresh') refresh();
      if (act === 'followers' || act === 'following') showPeople(act);
      if (act === 'close-people') { var s = document.getElementById('pfPeople'); if (s) s.hidden = true; }
      if (act === 'close-modal') { var m = document.getElementById('pfModal'); if (m) m.hidden = true; }
      if (act === 'message') {
        if (!me()) return goLogin(e);
        if (u && people()) location.href = people().chatUrl(u);
        else location.href = base() + 'index/chat.html';
      }
      if (act === 'follow') {
        if (!me()) return goLogin(e);
        if (!u || !people()) return;
        people().toggleFollow(u.uid).then(function (res) {
          if (res && res.ok) {
            followingThem = !!res.following;
            if (res.counts) {
              setTxt('pfFollowers', abbr(res.counts.followers || 0));
              setTxt('pfFollowing', abbr(res.counts.following || 0));
            }
            paintTools(u, false);
          }
        });
      }
      if (act === 'edit') {
        if (!me()) return goLogin(e);
        document.getElementById('pfEditName').value = (u && u.name) || '';
        document.getElementById('pfEditUser').value = (u && u.username) || '';
        document.getElementById('pfEditBio').value = (u && u.bio) || '';
        document.getElementById('pfEdit').hidden = false;
      }
      if (act === 'close-edit') document.getElementById('pfEdit').hidden = true;
      if (act === 'save-edit') {
        var user = g.hshsAuthUser;
        if (user && g.HshsAuthApi && g.HshsAuthApi.saveProfile) {
          g.HshsAuthApi.saveProfile(user, {
            fullName: document.getElementById('pfEditName').value.trim(),
            username: document.getElementById('pfEditUser').value.trim(),
            bio: document.getElementById('pfEditBio').value.trim()
          }).then(function () { document.getElementById('pfEdit').hidden = true; refresh(); });
        } else {
          document.getElementById('pfEdit').hidden = true;
        }
      }
    }, true);
    document.addEventListener('hshs:auth', function () { if (isPage()) refresh(); });
    document.addEventListener('hshs:profile', function () { if (isPage()) refresh(); });
  }
  function ensureSharedChrome() {
    document.body.classList.add('has-mobile-shell', 'hshs-nav-slim');
    try { if (g.HshsShell && g.HshsShell.ensureShell) g.HshsShell.ensureShell(); } catch (e) {}
    var nav = document.querySelector('.navbar');
    if (nav) { nav.style.display = ''; nav.hidden = false; nav.classList.add('hshs-flat-top'); }
  }
  function mount() {
    if (!isPage() || !g.HshsRender || !g.HshsTemplates || !g.HshsTemplates.profile) return;
    ensureSharedChrome();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    loadCss();
    g.HshsRender.mountHTML(root, g.HshsTemplates.profile);
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    ensureSharedChrome();
    bind();
    refresh();
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
  g.HshsProfile = { mount: mount, paint: refresh, goLogin: goLogin };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
