(function (g) {
  'use strict';
  if (g.__hshsChatNodemo) return;
  g.__hshsChatNodemo = true;

  function av(seed) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(seed || 'hshs') + '&backgroundColor=1e3a5f';
  }

  async function openPeer(peer) {
    if (!peer || !peer.uid) return;
    var live = g.HshsChatLive;
    if (live && live.openPeer && live.openPeer !== openPeer) return live.openPeer(peer);
    var db = g.db;
    if (!db || !db.startDirectChat) {
      if (g.HshsPeople && g.HshsPeople.startChat) {
        var res0 = await g.HshsPeople.startChat(peer);
        if (res0 && res0.ok && g.HshsMessagesUi && g.HshsMessagesUi.openThread) {
          g.HshsMessagesUi.openThread({
            id: res0.chatId, name: peer.name, user: peer.username, peerId: peer.uid,
            avatar: peer.photoURL || peer.avatar || av(peer.name), preview: '', time: 'Now'
          });
        }
      }
      return;
    }
    var res = await db.startDirectChat(peer);
    if (!res || !res.ok) return;
    if (g.HshsMessagesUi && g.HshsMessagesUi.openThread) {
      g.HshsMessagesUi.openThread({
        id: res.chatId,
        name: peer.name || peer.fullName || 'HSHS Student',
        user: peer.username || 'student',
        peerId: peer.uid,
        memberIds: [peer.uid],
        avatar: peer.photoURL || peer.avatar || av(peer.name),
        preview: '',
        time: 'Now'
      });
    }
    if (live && live.watch) live.watch(res.chatId);
  }

  async function openFromQuery() {
    var params = new URLSearchParams(location.search);
    var uid = params.get('uid');
    var handle = params.get('u');
    if (!uid && !handle) return;
    var peer = null;
    try {
      if (g.HshsPeople) {
        if (uid && g.HshsPeople.getUser) peer = await g.HshsPeople.getUser(uid);
        if (!peer && handle && g.HshsPeople.getByUsername) peer = await g.HshsPeople.getByUsername(handle);
      }
      if (!peer && g.db && g.db.getUser) peer = uid ? await g.db.getUser(uid) : await g.db.getUserByUsername(handle);
    } catch (e) {}
    if (peer) openPeer(peer);
  }

  function emptyLocalDemo() {
    try { localStorage.removeItem('hshsWorldChat_v1'); } catch (e) {}
    var box = document.getElementById('hshsChatList');
    if (box && /Daniel Okello|Aisha Nakitende|Class 4A|Maya Okello|Joel Wambede|Brian Kato|Faith Namulondo/.test(box.textContent || '')) {
      box.innerHTML = '<div class="hshs-chat-empty">No conversations yet. Search a classmate and start a chat.</div>';
    }
  }

  function bindCompose() {
    ['hshsComposeFab', 'hshsComposeTop'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.nodemo === '1') return;
      el.dataset.nodemo = '1';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        ensurePicker();
      }, true);
    });
  }

  function ensurePicker() {
    var el = document.getElementById('hshsPeoplePicker');
    if (!el) {
      if (!document.getElementById('hshsPeoplePickerCss')) {
        var s = document.createElement('style');
        s.id = 'hshsPeoplePickerCss';
        s.textContent = '.hshs-people-picker{position:fixed;inset:0;z-index:80;background:rgba(5,13,28,.72);display:flex;align-items:flex-end;justify-content:center}.hshs-people-picker[hidden]{display:none}.hshs-people-sheet{width:min(440px,100%);max-height:78vh;background:#0b1c39;border-radius:22px 22px 0 0;padding:16px 16px 28px;color:#fff}.hshs-people-sheet input{width:100%;margin:10px 0 12px;padding:10px 12px;border-radius:12px;border:1px solid #1e3a5f;background:#071433;color:#fff}.hshs-people-row{display:flex;align-items:center;gap:10px;width:100%;padding:8px 4px;background:none;border:0;color:#fff;text-align:left}.hshs-people-row img{width:36px;height:36px;border-radius:50%}.hshs-people-row small{color:#94a3b8}';
        document.head.appendChild(s);
      }
      el = document.createElement('div');
      el.id = 'hshsPeoplePicker';
      el.className = 'hshs-people-picker';
      el.innerHTML = '<div class="hshs-people-sheet"><strong>New message</strong><input id="hshsPeoplePickerSearch" type="search" placeholder="Search classmates..." autocomplete="off"><div id="hshsPeoplePickerList"></div></div>';
      el.addEventListener('click', function (e) { if (e.target === el) el.hidden = true; });
      document.body.appendChild(el);
      var input = document.getElementById('hshsPeoplePickerSearch');
      if (input) input.addEventListener('input', function () { fill(input.value); });
    }
    el.hidden = false;
    fill('');
  }

  async function fill(q) {
    var list = document.getElementById('hshsPeoplePickerList');
    if (!list) return;
    list.innerHTML = '<div class="hshs-chat-empty">Looking up classmates...</div>';
    var rows = [];
    try {
      if (g.HshsPeople && g.HshsPeople.search) rows = await g.HshsPeople.search(q);
      else if (g.db && g.db.searchUsers) rows = await g.db.searchUsers(q, 24);
    } catch (e) { rows = []; }
    var me = g.HshsPeople && g.HshsPeople.me ? g.HshsPeople.me() : null;
    rows = (rows || []).filter(function (u) { return u && u.uid && (!me || u.uid !== me.uid); });
    if (!rows.length) {
      list.innerHTML = '<div class="hshs-chat-empty">No classmates found. They need a signed-in HSHS account.</div>';
      return;
    }
    list.innerHTML = rows.map(function (u) {
      return '<button type="button" class="hshs-people-row" data-uid="' + u.uid + '">' +
        '<img src="' + (u.photoURL || u.avatar || av(u.name || u.uid)) + '" alt="">' +
        '<span><strong>' + String(u.name || 'HSHS Student') + '</strong><small>@' + String(u.username || 'student') + '</small></span></button>';
    }).join('');
    list.querySelectorAll('[data-uid]').forEach(function (btn) {
      btn.onclick = function () {
        var uid = btn.getAttribute('data-uid');
        var peer = rows.filter(function (u) { return u.uid === uid; })[0];
        var picker = document.getElementById('hshsPeoplePicker');
        if (picker) picker.hidden = true;
        if (peer) openPeer(peer);
      };
    });
  }

  function attachLive() {
    if (!g.HshsChatLive) g.HshsChatLive = {};
    if (!g.HshsChatLive.openPeer) g.HshsChatLive.openPeer = openPeer;
    if (!g.HshsChatLive.openFromQuery) g.HshsChatLive.openFromQuery = openFromQuery;
  }

  function boot() {
    if (!document.getElementById('hshsChatPage')) return;
    attachLive();
    emptyLocalDemo();
    bindCompose();
    openFromQuery();
    setTimeout(emptyLocalDemo, 250);
    setTimeout(bindCompose, 250);
  }

  document.addEventListener('hshs:page', boot);
  document.addEventListener('hshs:auth', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 80);
})(typeof window !== 'undefined' ? window : this);
