(function (g) {
  'use strict';
  if (g.HshsCampus) return;
  var KEY = 'hshs-campus-v1';
  var GROUPS = [
    { id: 's4', name: 'S4 Class', blurb: 'Notes, homework, assembly' },
    { id: 'sports', name: 'Sports Room', blurb: 'Match days and training' },
    { id: 'choir', name: 'Choir Room', blurb: 'Practice and songs' },
    { id: 'prefects', name: 'Prefects', blurb: 'Duty and campus order' },
    { id: 'announce', name: 'Announcements', blurb: 'School-wide updates' }
  ];
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function state() {
    var s = load();
    s.follows = s.follows || {}; s.likes = s.likes || {}; s.saves = s.saves || {};
    s.comments = s.comments || {}; s.stories = s.stories || []; s.members = s.members || {};
    s.blocks = s.blocks || {}; s.hidden = s.hidden || {}; s.reports = s.reports || [];
    s.alerts = s.alerts || {}; s.posts = s.posts || [];
    return s;
  }
  function me() {
    var u = (g.HshsStore && g.HshsStore.currentUser && g.HshsStore.currentUser()) || g.hshsAuthUser || null;
    if (u && (u.id || u.uid)) return { id: u.id || u.uid, name: u.name || u.displayName || 'HSHS student', klass: u.classYear || 'S1' };
    return { id: 'guest', name: 'Guest student', klass: 'S1' };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function toast(msg) { var el = document.createElement('div'); el.className = 'campus-toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1600); }
  function alertPush(uid, item) { var s = state(); s.alerts[uid] = s.alerts[uid] || []; s.alerts[uid].unshift(item); s.alerts[uid] = s.alerts[uid].slice(0, 40); save(s); }
  function seedStories() {
    var s = state();
    var fresh = s.stories.filter(function (x) { return Date.now() - x.time < 86400000; });
    if (fresh.length) { s.stories = fresh; save(s); return; }
    s.stories = [
      { id: 'st1', name: 'Sports Room', text: 'Training at 4. Bring water.', time: Date.now() - 3600000 },
      { id: 'st2', name: 'S4 Class', text: 'Homework is on the board.', time: Date.now() - 7200000 },
      { id: 'st3', name: 'Announcements', text: 'Assembly tomorrow morning.', time: Date.now() - 10800000 }
    ];
    save(s);
  }
  function follow(id) {
    var s = state(), who = me(); s.follows[who.id] = s.follows[who.id] || [];
    var i = s.follows[who.id].indexOf(id); var on = i === -1;
    if (on) s.follows[who.id].push(id); else s.follows[who.id].splice(i, 1);
    save(s);
    if (g.HshsStore && g.HshsStore.toggleFollow) { try { g.HshsStore.toggleFollow(id); } catch (e) {} }
    toast(on ? 'Following' : 'Unfollowed'); return on;
  }
  function like(postId) {
    var s = state(), who = me(); var row = s.likes[postId] || { by: [] }; var i = row.by.indexOf(who.id);
    if (i === -1) row.by.push(who.id); else row.by.splice(i, 1); s.likes[postId] = row; save(s);
    if (i === -1) alertPush(who.id, { id: 'a' + Date.now(), type: 'like', text: 'You liked a campus post', time: Date.now(), href: 'index/gallery.html' });
    return row.by.length;
  }
  function savePost(postId) {
    var s = state(), who = me(); s.saves[who.id] = s.saves[who.id] || []; var i = s.saves[who.id].indexOf(postId);
    if (i === -1) s.saves[who.id].push(postId); else s.saves[who.id].splice(i, 1); save(s);
    toast(i === -1 ? 'Saved' : 'Removed from saved');
  }
  function comment(postId, text) {
    text = String(text || '').trim().slice(0, 280); if (!text) return;
    var s = state(), who = me(); s.comments[postId] = s.comments[postId] || [];
    s.comments[postId].push({ id: 'c' + Date.now(), name: who.name, text: text, time: Date.now() }); save(s);
    alertPush(who.id, { id: 'a' + Date.now(), type: 'comment', text: 'New comment on a campus post', time: Date.now(), href: 'index/notifications.html' });
  }
  function hide(postId) { var s = state(), who = me(); s.hidden[who.id] = s.hidden[who.id] || []; if (s.hidden[who.id].indexOf(postId) === -1) s.hidden[who.id].push(postId); save(s); toast('Hidden from your feed'); }
  function report(postId, reason) { var s = state(); s.reports.push({ postId: postId, reason: reason || 'Not for school', time: Date.now() }); save(s); toast('Report sent to school admins'); }
  function joinGroup(id) { var s = state(), who = me(); s.members[id] = s.members[id] || []; if (s.members[id].indexOf(who.id) === -1) s.members[id].push(who.id); save(s); toast('Joined group'); }
  function addStory(text) { var s = state(), who = me(); s.stories.unshift({ id: 'st' + Date.now(), name: who.name, text: String(text || '').slice(0, 140), time: Date.now() }); save(s); }
  function addPost(data) {
    var s = state(), who = me();
    var post = { id: 'p' + Date.now(), title: String(data.title || 'Campus post').slice(0, 80), caption: String(data.caption || '').slice(0, 280), klass: data.klass || who.klass, author: who.name, time: Date.now() };
    s.posts.unshift(post); save(s);
    alertPush(who.id, { id: 'a' + Date.now(), type: 'school', text: 'Your post is on the campus feed', time: Date.now(), href: '/' });
    return post;
  }
  function sheet(title, bodyHtml, onReady) {
    var old = document.getElementById('campusSheet'); if (old) old.parentNode.removeChild(old);
    var el = document.createElement('div'); el.id = 'campusSheet'; el.className = 'campus-sheet';
    el.innerHTML = '<div class="campus-panel"><h3>' + esc(title) + '</h3>' + bodyHtml + '<div class="row"><button type="button" data-close>Close</button></div></div>';
    el.addEventListener('click', function (e) { if (e.target === el || e.target.closest('[data-close]')) el.parentNode.removeChild(el); });
    document.body.appendChild(el); if (onReady) onReady(el);
  }
  function openComments(postId) {
    var s = state();
    var rows = (s.comments[postId] || []).map(function (c) { return '<p><strong>' + esc(c.name) + '</strong> ' + esc(c.text) + '</p>'; }).join('') || '<p class="campus-note">No comments yet. Keep it school-friendly.</p>';
    sheet('Comments', rows + '<textarea id="campusComment" placeholder="Write a comment"></textarea><button type="button" id="campusSendComment">Reply</button>', function (el) {
      el.querySelector('#campusSendComment').onclick = function () { comment(postId, el.querySelector('#campusComment').value); openComments(postId); };
    });
  }
  function openCreate() {
    sheet('New campus post', '<input id="campusTitle" placeholder="Title"><textarea id="campusCaption" placeholder="Caption for your class"></textarea><select id="campusClass"><option>S1</option><option>S2</option><option>S3</option><option>S4</option><option>S5</option><option>S6</option></select><button type="button" id="campusPublish">Publish</button>', function (el) {
      el.querySelector('#campusPublish').onclick = function () {
        addPost({ title: el.querySelector('#campusTitle').value, caption: el.querySelector('#campusCaption').value, klass: el.querySelector('#campusClass').value });
        toast('Posted to your class'); el.parentNode.removeChild(el); paint();
      };
    });
  }
  function openStory() {
    sheet('Daily update', '<textarea id="campusStoryText" placeholder="A short school update"></textarea><button type="button" id="campusStoryAdd">Share for today</button>', function (el) {
      el.querySelector('#campusStoryAdd').onclick = function () { addStory(el.querySelector('#campusStoryText').value); toast('Added to today'); el.parentNode.removeChild(el); paint(); };
    });
  }
  function paintPosts(feed) {
    var box = document.getElementById('campusPosts'); if (!box) return;
    var s = state(), who = me();
    var posts = s.posts.filter(function (p) {
      if ((s.hidden[who.id] || []).indexOf(p.id) !== -1) return false;
      if (feed === 'class') return p.klass === who.klass;
      if (feed === 'following') return (s.follows[who.id] || []).indexOf(p.author) !== -1 || p.author === who.name;
      return true;
    });
    if (!posts.length) { box.innerHTML = '<div class="campus-card"><strong>Your class feed is ready</strong><p class="campus-note">Publish a post and it stays here after refresh.</p></div>'; return; }
    box.innerHTML = posts.map(function (p) {
      var likes = ((s.likes[p.id] || {}).by || []).length; var comments = (s.comments[p.id] || []).length;
      return '<article class="campus-card" data-post="' + esc(p.id) + '"><header><strong>' + esc(p.author) + '</strong><span class="campus-note">' + esc(p.klass) + '</span></header><h3>' + esc(p.title) + '</h3><p>' + esc(p.caption) + '</p><div class="campus-actions"><button type="button" data-act="like">Like ' + likes + '</button><button type="button" data-act="comment">Comment ' + comments + '</button><button type="button" data-act="save">Save</button><button type="button" data-act="hide">Hide</button><button type="button" data-act="report">Report</button></div></article>';
    }).join('');
  }
  function paintHome() {
    var grid = document.getElementById('featuredGrid'); if (!grid || document.getElementById('campusWrap')) return;
    seedStories(); var s = state();
    var wrap = document.createElement('section'); wrap.id = 'campusWrap'; wrap.className = 'campus-wrap';
    wrap.innerHTML = '<div class="campus-row" id="campusStories"></div><div class="campus-chips" id="campusFilters"><button type="button" data-feed="foryou" class="is-on">For you</button><button type="button" data-feed="following">Following</button><button type="button" data-feed="class">My class</button><button type="button" data-feed="school">School</button></div><div id="campusPosts"></div><div class="campus-card"><header><strong>Groups</strong><span class="campus-note">Join a class room</span></header><div class="campus-actions" id="campusGroups"></div></div>';
    grid.parentNode.insertBefore(wrap, grid);
    var stories = document.getElementById('campusStories');
    stories.innerHTML = '<button type="button" class="campus-story is-add" id="campusAddStory"><i>+</i><span>Your day</span></button>' + s.stories.map(function (st) { return '<button type="button" class="campus-story" data-story="' + esc(st.id) + '"><i>' + esc(st.name.slice(0, 1)) + '</i><span>' + esc(st.name.split(' ')[0]) + '</span></button>'; }).join('');
    document.getElementById('campusAddStory').onclick = openStory;
    stories.querySelectorAll('[data-story]').forEach(function (btn) { btn.onclick = function () { var st = s.stories.filter(function (x) { return x.id === btn.getAttribute('data-story'); })[0]; if (st) sheet(st.name, '<p>' + esc(st.text) + '</p>'); }; });
    document.getElementById('campusGroups').innerHTML = GROUPS.map(function (room) { return '<button type="button" data-group="' + room.id + '">' + esc(room.name) + ' \u00b7 ' + ((s.members[room.id] || []).length) + '</button>'; }).join('');
    document.getElementById('campusGroups').onclick = function (e) { var b = e.target.closest('[data-group]'); if (b) joinGroup(b.getAttribute('data-group')); };
    document.getElementById('campusFilters').onclick = function (e) { var b = e.target.closest('[data-feed]'); if (!b) return; document.querySelectorAll('#campusFilters button').forEach(function (x) { x.classList.toggle('is-on', x === b); }); paintPosts(b.getAttribute('data-feed')); };
    paintPosts('foryou');
    if (!document.getElementById('campusFab')) { var fab = document.createElement('button'); fab.id = 'campusFab'; fab.className = 'campus-fab'; fab.type = 'button'; fab.textContent = '+'; fab.setAttribute('aria-label', 'New post'); fab.onclick = openCreate; document.body.appendChild(fab); }
  }
  function paintAlerts() {
    var list = document.getElementById('hshsNotifList'); if (!list) return;
    var rows = (state().alerts[me().id] || []);
    list.innerHTML = rows.length ? rows.map(function (n) { return '<a class="campus-alert" href="' + esc(n.href || 'notifications.html') + '"><i class="fas fa-bell"></i><span><strong>' + esc(n.type) + '</strong><br>' + esc(n.text) + '</span></a>'; }).join('') : '<p class="campus-note">No alerts yet. Likes, comments, and school posts show up here.</p>';
  }
  function paintSearch() {
    var input = document.getElementById('hsSearchInput') || document.getElementById('searchInput'); if (!input || input.dataset.campus) return;
    input.dataset.campus = '1';
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim(); var s = state(); var people = (g.HshsStore && g.HshsStore.searchPeople) ? (g.HshsStore.searchPeople(q) || []) : [];
      var posts = s.posts.filter(function (p) { return !q || (p.title + ' ' + p.caption + ' ' + p.author).toLowerCase().indexOf(q) !== -1; });
      var out = document.getElementById('hsPeopleOut'); var media = document.getElementById('hsMediaOut');
      if (out) out.innerHTML = people.slice(0, 6).map(function (u) { return '<button type="button" data-follow="' + esc(u.id) + '">' + esc(u.name) + ' \u00b7 Follow</button>'; }).join('') || '<p class="campus-note">Classmates appear here after they join.</p>';
      if (media) media.innerHTML = posts.map(function (p) { return '<article class="campus-card"><strong>' + esc(p.title) + '</strong><p>' + esc(p.caption) + '</p></article>'; }).join('');
    });
  }
  function bind() {
    if (bind.done) return; bind.done = true;
    document.addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]');
      if (act) {
        var card = act.closest('[data-post]'); var id = card && card.getAttribute('data-post'); var kind = act.getAttribute('data-act');
        if (kind === 'like') like(id); if (kind === 'comment') openComments(id); if (kind === 'save') savePost(id); if (kind === 'hide') hide(id); if (kind === 'report') report(id, 'Not for school');
        var on = document.querySelector('#campusFilters .is-on'); paintPosts(on ? on.getAttribute('data-feed') : 'foryou');
      }
      var followBtn = e.target.closest('[data-follow]'); if (followBtn) follow(followBtn.getAttribute('data-follow'));
    });
  }
  function paint() { paintHome(); paintAlerts(); paintSearch(); }
  function boot() {
    if (!document.getElementById('campusCss')) { var link = document.createElement('link'); link.id = 'campusCss'; link.rel = 'stylesheet'; link.href = (location.pathname.indexOf('/index/') !== -1 ? '../' : '') + 'css/hshs-campus.css?v=261007campus1'; document.head.appendChild(link); }
    bind(); paint(); setTimeout(paint, 700); setTimeout(paint, 1600);
  }
  g.HshsCampus = { follow: follow, like: like, comment: comment, save: savePost, report: report, hide: hide, joinGroup: joinGroup, addPost: addPost };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('hshs:page', function () { setTimeout(paint, 80); });
})(window);
