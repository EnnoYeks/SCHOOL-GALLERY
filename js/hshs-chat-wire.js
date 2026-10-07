(function () {
  'use strict';
  var ROOMS = [
    { id: 'campus_sports', name: 'Sports Room', icon: 'fa-trophy', preview: 'Match days and training', time: '2h', unread: 1 },
    { id: 'campus_choir', name: 'Choir Room', icon: 'fa-music', preview: 'Practice and songs', time: '5h', unread: 0 },
    { id: 'campus_s4', name: 'S4 Class', icon: 'fa-book-open', preview: 'Notes, homework, assembly', time: 'Yesterday', unread: 0 },
    { id: 'campus_prefects', name: 'Prefects', icon: 'fa-shield-halved', preview: 'Duty and campus order', time: 'Yesterday', unread: 0 },
    { id: 'campus_announce', name: 'HSHS Announcements', icon: 'fa-bullhorn', preview: 'School-wide updates', time: 'Mon', unread: 0 }
  ];
  var filter = 'all';
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function toast(msg) {
    var el = document.getElementById('hshsChatToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hshsChatToast';
      el.className = 'hshs-chat-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('is-on'); }, 1800);
  }
  function signedIn() {
    var u = window.hshsAuthUser || (window.auth && window.auth.currentUser) || null;
    return !!(u && !u.isAnonymous && u.uid);
  }
  function rows(q) {
    q = String(q || '').toLowerCase().trim();
    return ROOMS.filter(function (r) {
      if (filter === 'unread' && !r.unread) return false;
      if (!q) return true;
      return (r.name + ' ' + r.preview).toLowerCase().indexOf(q) !== -1;
    });
  }
  function paint() {
    var box = document.getElementById('hshsChatList');
    if (!box || signedIn()) return;
    var input = document.getElementById('hshsChatSearch') || document.querySelector('.search-box input');
    var list = rows(input && input.value);
    var head = document.getElementById('hshsChatSectionHead');
    if (head) head.hidden = !list.length;
    if (!list.length) {
      box.innerHTML = '<div class="msg-empty"><i class="fas fa-magnifying-glass"></i><h3>No matches</h3><p>Try another room.</p></div>';
      return;
    }
    box.innerHTML = list.map(function (r) {
      return '<button type="button" class="msg-row' + (r.unread ? ' is-hot' : '') + '" data-room="' + esc(r.id) + '">' +
        '<span class="msg-row-av"><i class="fas ' + r.icon + '"></i></span>' +
        '<span class="msg-row-body"><strong><span class="msg-row-name">' + esc(r.name) + '</span><em class="msg-group-tag">Group</em></strong><small>' + esc(r.preview) + '</small></span>' +
        '<span class="msg-row-meta"><time>' + esc(r.time) + '</time>' + (r.unread ? '<span class="msg-badge">' + r.unread + '</span>' : '') + '</span></button>';
    }).join('');
  }
  function openRoom(id) {
    var room = null;
    ROOMS.forEach(function (r) { if (r.id === id) room = r; });
    if (!room) return;
    room.unread = 0;
    var thread = document.getElementById('hshsThread');
    if (thread) thread.hidden = false;
    var name = document.getElementById('hshsThreadName');
    if (name) name.textContent = room.name;
    var meta = document.getElementById('hshsThreadMeta');
    if (meta) meta.textContent = 'Campus group';
    var welcome = document.getElementById('hshsThreadWelcome');
    var msgs = document.getElementById('hshsThreadMsgs');
    if (welcome) welcome.hidden = false;
    if (msgs) msgs.hidden = true;
    document.body.classList.add('hshs-chat-thread-open');
    paint();
  }
  function openCompose() {
    var sheet = document.getElementById('hshsComposeSheet');
    if (!sheet) { location.href = 'login.html'; return; }
    sheet.hidden = false;
    document.body.classList.add('hshs-chat-compose-open');
    var box = document.getElementById('hshsComposeResults');
    if (box) {
      box.innerHTML = '<div class="msg-compose-section-title">Recent groups</div>' + ROOMS.map(function (r) {
        return '<button type="button" class="msg-compose-row" data-room="' + esc(r.id) + '"><span class="msg-compose-av is-group"><i class="fas ' + r.icon + '"></i></span><span><b>' + esc(r.name) + '</b><small>' + esc(r.preview) + '</small></span></button>';
      }).join('') + '<p class="msg-compose-empty">Sign in to message a classmate.</p>';
    }
    var input = document.getElementById('hshsComposeSearch');
    if (input) setTimeout(function () { input.focus(); }, 40);
  }
  function bind() {
    var page = document.getElementById('hshsChatPage');
    if (!page || page.dataset.recentWired) return;
    page.dataset.recentWired = '1';
    document.querySelectorAll('[aria-label="New chat"], #hshsPanelCompose').forEach(function (btn) {
      btn.onclick = function (e) { e.preventDefault(); openCompose(); };
    });
    var search = document.getElementById('hshsChatSearch') || document.querySelector('.search-box input');
    if (search) search.addEventListener('input', paint);
    var filters = document.getElementById('hshsChatFilters');
    if (filters) filters.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-filter]');
      if (!chip) return;
      filter = chip.getAttribute('data-filter') || 'all';
      paint();
    });
    var list = document.getElementById('hshsChatList');
    if (list) list.addEventListener('click', function (e) {
      var row = e.target.closest('[data-room]');
      if (row) openRoom(row.getAttribute('data-room'));
    });
    var results = document.getElementById('hshsComposeResults');
    if (results) results.addEventListener('click', function (e) {
      var row = e.target.closest('[data-room]');
      if (!row) return;
      var sheet = document.getElementById('hshsComposeSheet');
      if (sheet) sheet.hidden = true;
      document.body.classList.remove('hshs-chat-compose-open');
      openRoom(row.getAttribute('data-room'));
    });
    var send = document.getElementById('hshsThreadForm');
    if (send) send.addEventListener('submit', function (e) {
      if (!signedIn()) { e.preventDefault(); e.stopPropagation(); toast('Sign in to send'); }
    }, true);
    paint();
  }
  if (!document.getElementById('hshs-chat-wire-css')) {
    var st = document.createElement('style');
    st.id = 'hshs-chat-wire-css';
    st.textContent = '.msg-row{display:flex;align-items:center;gap:12px;width:100%;padding:12px 8px;border:0;border-bottom:1px solid rgba(148,178,255,.08);background:transparent;color:inherit;text-align:left;cursor:pointer}.msg-row-av{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;background:#1d3f86;color:#fff;flex:0 0 44px}.msg-row-body{min-width:0;flex:1;display:grid;gap:3px}.msg-row-body strong{display:flex;align-items:center;gap:6px;font-size:.92rem}.msg-row-body small{color:#8d9bb8;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.msg-row-meta{display:grid;justify-items:end;gap:6px;color:#8d9bb8;font-size:.72rem}.msg-badge{min-width:18px;height:18px;border-radius:999px;display:grid;place-items:center;background:#4d7cff;color:#fff;font-size:.68rem;font-weight:800}.msg-group-tag{font-style:normal;font-size:.62rem;color:#9db4ff}.hshs-chat-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#102047;color:#fff;border-radius:12px;padding:10px 14px;opacity:0;pointer-events:none;z-index:80}.hshs-chat-toast.is-on{opacity:1}';
    document.head.appendChild(st);
  }
  function boot() {
    if (!document.getElementById('hshsChatPage')) return;
    bind();
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  document.addEventListener('hshs:page', boot);
})();
