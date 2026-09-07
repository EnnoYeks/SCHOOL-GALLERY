(function (g) {
  'use strict';
  if (g.__hshsProfilePageModule) return;
  g.__hshsProfilePageModule = true;
  var PAGE = 'profile';
  var tab = 'grid';
  function isPage() {
    try { if (g.HshsRegistry && HshsRegistry.activeRoute) return HshsRegistry.activeRoute().name === PAGE; } catch (e) {}
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'profile.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function abbr(n) { n = Number(n) || 0; if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace('.0', '') + 'M'; if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'K'; return String(n); }
  function loadCss() { if (document.querySelector('link[data-hshs-profile-css]')) return; var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base() + 'css/hshs-profile.css?v=260907ig'; l.setAttribute('data-hshs-profile-css', '1'); document.head.appendChild(l); }
  function store() { return g.HshsStore || null; }
  function me() { return store() && store().currentUser ? store().currentUser() : null; }
  function viewedUser() { var q = new URLSearchParams(location.search).get('u'); if (q && store() && store().getUserByUsername) return store().getUserByUsername(q) || me(); return me(); }
  function linkify(text) { return esc(text).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/(^|\s)#(\w+)/g, '$1<a href="' + base() + 'index/gallery.html?q=%23$2">#$2</a>').replace(/(^|\s)@(\w+)/g, '$1<a href="' + base() + 'index/profile.html?u=$2">@$2</a>'); }
  function mediaOf(p) { return p.imageUrl || p.image_url || p.thumbnailUrl || p.thumbnail_url || p.image || p.cover || ''; }
  function isVideo(p) { return String(p.type || '').toLowerCase().indexOf('video') !== -1 || !!(p.videoUrl || p.video_url); }
  function userPosts(u) { var list = []; try { if (store() && u && store().postsByUser) list = store().postsByUser(u.id) || []; } catch (e) {} if (!list.length && store() && store().listPosts) { list = (store().listPosts() || []).filter(function (p) { return u && ((p.authorId && p.authorId === u.id) || p.author === u.name || p.author === u.username); }); } return list; }
  function paintGrid(posts) { var grid = document.getElementById('igGrid'); if (!grid) return; var list = posts.slice(); if (tab === 'reels') list = list.filter(isVideo); if (tab === 'tagged') list = []; if (tab === 'saved' && store() && store().listSaved) { var ids = store().listSaved() || []; list = (store().listPosts() || []).filter(function (p) { return ids.indexOf(p.id) !== -1; }); } if (!list.length) { grid.innerHTML = '<div class="ig-empty"><i class="far fa-camera"></i><strong>No posts yet</strong></div>'; return; } grid.innerHTML = list.map(function (p, i) { var src = mediaOf(p); var mark = isVideo(p) ? '<i class="fas fa-play mark"></i>' : (p.isCarousel ? '<i class="fas fa-layer-group mark"></i>' : ''); return '<button class="ig-cell" type="button" data-open="' + i + '" data-id="' + esc(p.id) + '">' + (src ? '<img src="' + esc(src) + '" alt="' + esc(p.title || 'Post') + '" loading="lazy">' : '') + mark + '</button>'; }).join(''); grid._posts = list; }
  function openModal(post) { var box = document.getElementById('igModal'); var stage = document.getElementById('igModalStage'); var cap = document.getElementById('igModalCap'); if (!box || !post) return; box.hidden = false; if (isVideo(post) && (post.videoUrl || post.video_url)) stage.innerHTML = '<video src="' + esc(post.videoUrl || post.video_url) + '" poster="' + esc(mediaOf(post)) + '" controls autoplay playsinline></video>'; else stage.innerHTML = '<img src="' + esc(mediaOf(post)) + '" alt="' + esc(post.title || '') + '">'; cap.textContent = post.title || post.description || ''; }
  function paint(u) { if (!u) u = { name: 'HSHS student', username: 'hshs_world', bio: 'Your school. One world.' }; var own = !!(me() && u.id && me().id === u.id); var counts = store() && store().followCounts ? store().followCounts(u.id) : { followers: 0, following: 0 }; var posts = userPosts(u); document.getElementById('igUsername').textContent = u.username || 'username'; document.getElementById('igName').textContent = u.name || u.displayName || 'Student'; var live = document.getElementById('igLiveDot'); if (live) live.hidden = !(u.lastSeen && (Date.now() - u.lastSeen < 300000)); var av = document.getElementById('igAvatar'); if (av) { av.src = u.avatar || u.photoURL || u.profilePhoto || ''; av.alt = u.name || 'Profile'; } document.getElementById('igStoryRing').classList.toggle('has-story', posts.length > 0); document.getElementById('igPosts').textContent = abbr(posts.length); document.getElementById('igFollowers').textContent = abbr(counts.followers); document.getElementById('igFollowing').textContent = abbr(counts.following); var bio = document.getElementById('igBio'); bio.innerHTML = linkify(u.bio || ''); bio.classList.add('is-clamp'); var more = document.getElementById('igBioMore'); more.hidden = (u.bio || '').length < 90; var chip = document.getElementById('igLinkChip'); if (u.classYear) { chip.hidden = false; chip.querySelector('span').textContent = u.classYear + (u.role ? ' · ' + u.role : ''); } else chip.hidden = true; var note = document.getElementById('igNote'); if (own) { note.hidden = false; note.textContent = 'Campus life…'; } else note.hidden = true; var actions = document.getElementById('igActions'); if (own) actions.innerHTML = '<button class="ig-btn" type="button" data-ig="edit">Edit profile</button><button class="ig-btn" type="button" data-ig="share">Share profile</button><button class="ig-btn-sq" type="button" data-ig="refresh" aria-label="Refresh"><i class="fas fa-rotate"></i></button>'; else { var following = store() && store().isFollowing && store().isFollowing(u.id); actions.innerHTML = '<button class="ig-btn ' + (following ? '' : 'primary') + '" type="button" data-ig="follow">' + (following ? 'Following' : 'Follow') + '</button><button class="ig-btn" type="button" data-ig="message">Message</button><button class="ig-btn-sq" type="button" data-ig="refresh" aria-label="Refresh"><i class="fas fa-rotate"></i></button>'; } document.querySelectorAll('.ig-tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); }); paintGrid(posts); }
  function bind() { if (g.__hshsProfileEvents) return; g.__hshsProfileEvents = true;
    document.addEventListener('click', function (e) {
      if (!isPage()) return;
      if (e.target.id === 'igBioMore') { document.getElementById('igBio').classList.remove('is-clamp'); e.target.hidden = true; return; }
      var t = e.target.closest('[data-ig],[data-tab],[data-open]');
      if (!t) { if (e.target.id === 'igEditSheet') document.getElementById('igEditSheet').hidden = true; return; }
      var u = viewedUser();
      if (t.dataset.open != null) { var grid = document.getElementById('igGrid'); openModal((grid._posts || [])[Number(t.dataset.open)]); return; }
      if (t.dataset.tab) { tab = t.dataset.tab; paint(u); return; }
      var act = t.dataset.ig;
      if (act === 'create') { if (g.__hshsOpenUpload) g.__hshsOpenUpload(); return; }
      if (act === 'menu') { location.href = base() + 'index/settings.html'; return; }
      if (act === 'threads' || act === 'message') { location.href = base() + 'index/chat.html'; return; }
      if (act === 'accounts') { var next = prompt('Open a username', (u && u.username) || ''); if (next) location.href = base() + 'index/profile.html?u=' + encodeURIComponent(next.replace(/^@/, '')); return; }
      if (act === 'edit') { var sheet = document.getElementById('igEditSheet'); document.getElementById('igEditName').value = u.name || ''; document.getElementById('igEditUser').value = u.username || ''; document.getElementById('igEditBio').value = u.bio || ''; sheet.hidden = false; return; }
      if (act === 'close-edit') { document.getElementById('igEditSheet').hidden = true; return; }
      if (act === 'save-edit') { if (store() && store().updateProfile) store().updateProfile({ name: document.getElementById('igEditName').value.trim(), username: document.getElementById('igEditUser').value.trim(), bio: document.getElementById('igEditBio').value.trim() }); document.getElementById('igEditSheet').hidden = true; paint(viewedUser()); return; }
      if (act === 'share') { var url = location.origin + '/index/profile.html?u=' + encodeURIComponent((u && u.username) || ''); if (navigator.share) navigator.share({ title: u && u.name, url: url }).catch(function () {}); else navigator.clipboard.writeText(url); return; }
      if (act === 'follow' && u && store() && store().toggleFollow) { store().toggleFollow(u.id); paint(u); return; }
      if (act === 'refresh') { paint(u); return; }
      if (act === 'close-modal') { document.getElementById('igModal').hidden = true; document.getElementById('igModalStage').innerHTML = ''; }
    });
    document.addEventListener('keydown', function (e) { if (!isPage()) return; if (e.key === 'Escape') { var m = document.getElementById('igModal'); if (m) m.hidden = true; var s = document.getElementById('igEditSheet'); if (s) s.hidden = true; } });
  }
  function mount() { if (!isPage() || !g.HshsRender || !g.HshsTemplates || !g.HshsTemplates.profile) return; if (g.HshsShell) try { g.HshsShell.ensureShell(); } catch (e) {} var root = document.getElementById('hshs-page'); if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); } loadCss(); g.HshsRender.mountHTML(root, g.HshsTemplates.profile); document.documentElement.setAttribute('data-hshs-page', PAGE); bind(); paint(viewedUser()); }
  function boot() { var go = function () { if (!isPage()) return; if (!g.HshsRender) { setTimeout(go, 40); return; } mount(); }; if (g.HshsApp && g.HshsApp.whenReady) g.HshsApp.whenReady(go); else document.addEventListener('hshs:foundation-ready', go, { once: true }); document.addEventListener('hshs:page', function () { if (isPage()) setTimeout(go, 0); }); }
  g.HshsProfile = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
