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
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>'); }
  function toast(msg) { var el = document.createElement('div'); el.className = 'campus-toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1600); }
  function alertPush(uid, item) { var s = state(); s.alerts[uid] = s.alerts[uid] || []; s.alerts[uid].unshift(item); s.alerts[uid] = s.alerts[uid].slice(0, 40); save(s); }
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
    if (i === -1) alertPush(who.id, { id: 'a' + Date.now(), type: 'like', text: 'You liked a campus post', time: Date.now(), href: '/gallery/' });
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
    alertPush(who.id, { id: 'a' + Date.now(), type: 'comment', text: 'New comment on a campus post', time: Date.now(), href: '/notifications/' });
  }
  function hide(postId) { var s = state(), who = me(); s.hidden[who.id] = s.hidden[who.id] || []; if (s.hidden[who.id].indexOf(postId) === -1) s.hidden[who.id].push(postId); save(s); toast('Hidden from your feed'); }
  function report(postId, reason) { var s = state(); s.reports.push({ postId: postId, reason: reason || 'Not for school', time: Date.now() }); save(s); toast('Report sent to school admins'); }
  function joinGroup(id) { var s = state(), who = me(); s.members[id] = s.members[id] || []; if (s.members[id].indexOf(who.id) === -1) s.members[id].push(who.id); save(s); toast('Joined group'); }
  function addPost(data) {
    var s = state(), who = me();
    var post = { id: 'p' + Date.now(), title: String(data.title || 'Campus post').slice(0, 80), caption: String(data.caption || '').slice(0, 280), klass: data.klass || who.klass, author: who.name, time: Date.now() };
    s.posts.unshift(post); save(s);
    alertPush(who.id, { id: 'a' + Date.now(), type: 'school', text: 'Your post is on the campus feed', time: Date.now(), href: '/' });
    return post;
  }

  /* Home no longer injects stories / For you / class feed / groups.
     Featured Today from the real home template stays in place. */
  function paintHome() {
    var dead = document.getElementById('campusWrap');
    if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
    var fab = document.getElementById('campusFab');
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
  }

  function paintAlerts() {
    var list = document.getElementById('hshsNotifList'); if (!list) return;
    var rows = (state().alerts[me().id] || []);
    list.innerHTML = rows.length ? rows.map(function (n) { return '<a class="campus-alert" href="' + esc(window.HshsPaths ? HshsPaths.href(n.href || 'notifications') : (n.href || '/notifications/')) + '"><i class="fas fa-bell"></i><span><strong>' + esc(n.type) + '</strong><br>' + esc(n.text) + '</span></a>'; }).join('') : '<p class="campus-note">No alerts yet. Likes, comments, and school posts show up here.</p>';
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
      var followBtn = e.target.closest('[data-follow]'); if (followBtn) follow(followBtn.getAttribute('data-follow'));
    });
  }
  function paint() { paintHome(); paintAlerts(); paintSearch(); }
  function boot() {
    bind(); paint(); setTimeout(paint, 700); setTimeout(paint, 1600);
  }
  g.HshsCampus = { follow: follow, like: like, comment: comment, save: savePost, report: report, hide: hide, joinGroup: joinGroup, addPost: addPost, groups: GROUPS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('hshs:page', function () { setTimeout(paint, 80); });
})(window);
