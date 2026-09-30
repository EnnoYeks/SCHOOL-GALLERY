/* ============================================
   HSHS WORLD — Messages UI
   Contract used by js/hshs-chat-live.js:
     setInbox, applyRemoteThread, setMode, setPresenceMap, activeId
   No attachments, voice notes, or calls.
   ============================================ */
(function (g) {
  'use strict';
  if (g.__hshsChatUi) return;
  g.__hshsChatUi = true;

  var EMOJI = ['😀','😄','😁','😊','😉','😎','🤔','😅','😇','🤗','🤩','😜',
    '👍','👏','🙌','🙏','💪','✌️','🤝','🔥','⭐','✅','🎉','📚',
    '⚽','🎨','🎵','🌞','🌙','📖','✏️','🏫','🍀','🎯','🏆','🫡'];
  var REACTS = ['👍', '⭐', '😂', '😮', '😢', '🙏'];

  var CAMPUS_ROOMS = [
    { id: 'campus_sports', name: 'Sports Room', icon: 'fa-trophy', blurb: 'Match days and training' },
    { id: 'campus_choir', name: 'Choir Room', icon: 'fa-music', blurb: 'Practice and songs' },
    { id: 'campus_s4', name: 'S4 Class', icon: 'fa-book-open', blurb: 'Notes, homework, assembly' },
    { id: 'campus_prefects', name: 'Prefects', icon: 'fa-shield-halved', blurb: 'Duty and campus order' },
    { id: 'campus_announce', name: 'HSHS Announcements', icon: 'fa-bullhorn', blurb: 'School-wide updates' }
  ];

  var INBOX = [];
  var THREADS = {};
  var PRESENCE = {};
  var MODE = 'connecting';
  var active = null;
  var holdReact = { timer: 0, idx: -1, x: 0, y: 0 };
  var lastPaintSig = {};
  var queryOpened = false;
  var activeFilter = 'all';

  function $(id) { return document.getElementById(id); }
  function root() { return $('hshsChatPage'); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function first(name) { return String(name || 'there').split(' ')[0]; }
  function initials(name) {
    return String(name || '?').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
      .map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase() || '?';
  }
  function campusRoom(item) {
    var id = item && (item.campusKey || item.id) || '';
    for (var i = 0; i < CAMPUS_ROOMS.length; i++) if (CAMPUS_ROOMS[i].id === id) return CAMPUS_ROOMS[i];
    return null;
  }
  function groupIcon(item) {
    var room = campusRoom(item);
    return (room && room.icon) || 'fa-users';
  }
  function avatarHtml(item) {
    if (item && item.group) {
      return '<i class="fas ' + groupIcon(item) + '" aria-hidden="true"></i>';
    }
    if (item && item.avatar) return '<img src="' + esc(item.avatar) + '" alt="" loading="lazy">';
    return initials(item && item.name);
  }
  function threadId(item) { return (item && item.id) || ''; }
  function myUid() {
    var u = g.hshsAuthUser || (g.auth && g.auth.currentUser) || null;
    return (u && !u.isAnonymous) ? u.uid : '';
  }
  function signedIn() { return !!myUid(); }

  function toast(msg) {
    var el = $('hshsChatToast');
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

  function setShellClass() {
    document.body.classList.toggle('hshs-chat-thread-open', !!(active && $('hshsThread') && !$('hshsThread').hidden));
    document.body.classList.toggle('hshs-chat-compose-open', !!($('hshsComposeSheet') && !$('hshsComposeSheet').hidden));
  }

  function skel() {
    return '<div class="msg-skel" aria-hidden="true"><i></i><span><b></b><em></em></span></div>'.repeat(5);
  }

  function fillList(q) {
    var box = $('hshsChatList');
    if (!box) return;
    q = String(q || '').toLowerCase().trim();

    if (MODE !== 'live' && !signedIn()) {
      box.innerHTML = '<div class="msg-empty"><i class="fas fa-lock"></i>' +
        '<h3>Sign in to message</h3><p>Log in with your HSHS account to see and start conversations.</p>' +
        '<a class="msg-empty-cta" href="login.html">Sign in</a></div>';
      return;
    }
    if (MODE === 'connecting' && !INBOX.length && !q) {
      box.innerHTML = skel();
      return;
    }
    if (MODE === 'local' && signedIn() && !INBOX.length && !q) {
      var roomCards = CAMPUS_ROOMS.slice(0, 3).map(function (r) {
        return '<button type="button" class="chat-empty-room" data-empty-campus="' + esc(r.id) + '">' +
          '<i class="fas ' + esc(r.icon) + '" aria-hidden="true"></i>' +
          '<b>' + esc(r.name.replace(' Room', '')) + '</b>' +
          '<small>' + esc(r.blurb) + '</small></button>';
      }).join('');
      box.innerHTML =
        '<div class="msg-empty">' +
          '<i class="fas fa-comment-dots"></i>' +
          '<h3>Your inbox is quiet.</h3>' +
          '<p>Your chats will appear here. Start with a classmate or jump into a campus room.</p>' +
          '<button type="button" class="msg-empty-cta" id="hshsEmptyCompose">Start a chat</button>' +
        '</div>' +
        '<div class="chat-empty-start">' +
          '<div class="chat-empty-start-head"><strong>JUMP INTO CAMPUS</strong><span>QUICK START</span></div>' +
          '<div class="chat-empty-rooms">' + roomCards + '</div>' +
        '</div>';
      var emptyCta = $('hshsEmptyCompose');
      if (emptyCta) emptyCta.onclick = openCompose;
      return;
    }

    var rows = INBOX.filter(function (c) {
      if (activeFilter === 'unread' && !c.unread) return false;
      if (activeFilter === 'groups' && !c.group) return false;
      if (!q) return true;
      return (c.name + ' ' + c.user + ' ' + c.preview).toLowerCase().indexOf(q) !== -1;
    });

    if (!rows.length) {
      var empty = activeFilter === 'unread' ? 'No unread conversations.' : (activeFilter === 'groups' ? 'No group conversations yet.' : 'No conversations yet.');
      box.innerHTML = q
        ? '<div class="msg-empty"><i class="fas fa-magnifying-glass"></i><h3>No matches</h3><p>Try a different name.</p></div>'
        : '<div class="msg-empty"><i class="fas fa-comment-dots"></i><h3>' + esc(empty) + '</h3>' +
          (activeFilter === 'all' ? '<p>Start a chat with a classmate.</p><button type="button" class="msg-empty-cta" id="hshsEmptyCompose">New message</button>' : '') + '</div>';
      var cta = $('hshsEmptyCompose');
      if (cta) cta.onclick = openCompose;
      return;
    }

    box.innerHTML = rows.map(function (c) {
      var metaRight = c.unread ? '<span class="msg-badge">' + esc(c.unread) + '</span>' : '';
      var online = (!c.group && c.online) ? '<i class="msg-online-dot"></i>' : '';
      var tag = c.group ? '<em class="msg-group-tag">Group</em>' : '';
      return '<button type="button" class="msg-row' + (c.unread ? ' is-hot' : '') + '" data-chat="' + esc(c.id) + '">' +
        '<span class="msg-row-av">' + avatarHtml(c) + online + '</span>' +
        '<span class="msg-row-body"><strong><span class="msg-row-name">' + esc(c.name) + '</span>' + tag + '</strong><small>' + esc(c.preview || 'Say hi') + '</small></span>' +
        '<span class="msg-row-meta"><time>' + esc(c.time || '') + '</time>' + metaRight + '</span></button>';
    }).join('');
  }

  function findChat(id) {
    for (var i = 0; i < INBOX.length; i++) if (INBOX[i].id === id) return INBOX[i];
    return null;
  }

  function showList() {
    var thread = $('hshsThread');
    if (thread) thread.hidden = true;
    hideReactPop();
    closeEmoji();
    active = null;
    setShellClass();
    if (g.HshsChatLive && g.HshsChatLive.unwatchThread) g.HshsChatLive.unwatchThread();
  }

  function showWelcome(on) {
    var w = $('hshsThreadWelcome'), box = $('hshsThreadMsgs');
    if (w) w.hidden = !on;
    if (box) box.hidden = !!on;
  }

  function reactHtml(m) {
    if (!m.reacts || !m.reacts.length) return '';
    return '<span class="msg-reacts">' + m.reacts.map(function (r) { return esc(r); }).join(' ') + '</span>';
  }

  function dayLabel(time) {
    var t = String(time || '');
    if (!t || t === 'Now' || /^\d/.test(t)) return 'Today';
    return t;
  }

  function nearBottom(box) {
    if (!box) return true;
    return (box.scrollHeight - box.scrollTop - box.clientHeight) < 96;
  }

  function paintSig(messages) {
    return (messages || []).map(function (m) {
      var reacts = Array.isArray(m.reacts) ? m.reacts.join('') : '';
      return [m.id || m.clientId || '', m.text || '', m.pending ? 1 : 0, m.failed ? 1 : 0, reacts].join(':');
    }).join('|');
  }

  function statusText(m) {
    if (m.failed) return 'Not sent · tap to retry';
    if (m.pending) return 'Sending…';
    var label = dayLabel(m.time);
    return label === 'Today' ? (m.time || '') : '';
  }

  function paintMsgs(messages, item, opts) {
    var box = $('hshsThreadMsgs');
    if (!box) return;
    opts = opts || {};
    var id = threadId(item || active);
    var sig = paintSig(messages);
    var stick = opts.forceScroll || nearBottom(box);
    if (!opts.force && lastPaintSig[id] === sig && box.childElementCount) return;
    lastPaintSig[id] = sig;
    showWelcome(false);

    var prevDay = '';
    var html = messages.map(function (m, i) {
      var day = dayLabel(m.time);
      var chip = day !== prevDay ? '<div class="msg-date-chip">' + esc(day) + '</div>' : '';
      prevDay = day;
      var who = m.sender || (item && item.name) || '';
      var av = (!m.mine)
        ? '<span class="msg-bubble-av">' + (item && item.avatar && !item.group ? '<img src="' + esc(item.avatar) + '" alt="">' : initials(who)) + '</span>'
        : '';
      var sender = (!m.mine && item && item.group && m.sender) ? '<span class="msg-sender">' + esc(m.sender) + '</span>' : '';
      var pendingCls = m.pending ? ' is-pending' : (m.failed ? ' is-failed' : '');
      var ticks = m.mine && !m.pending && !m.failed ? '<i class="msg-ticks fas fa-check-double" aria-hidden="true"></i>' : '';
      var body = '<div class="msg-bubble-text">' + esc(m.text || '').replace(/\n/g, '<br>') + '</div>';
      return chip + '<div class="msg-row-line ' + (m.mine ? 'mine' : 'theirs') + '" data-mi="' + i + '" data-mid="' + esc(m.id || m.clientId || '') + '">' + av +
        '<div class="msg-bubble ' + (m.mine ? 'mine' : 'theirs') + pendingCls + '">' + sender + body +
        reactHtml(m) + '<time>' + esc(statusText(m)) + ticks + '</time></div></div>';
    }).join('');
    box.innerHTML = html;
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function memberCount(item) {
    if (!item) return 0;
    if (item.memberIds && item.memberIds.length) return item.memberIds.length;
    if (item.members && item.members.length) return item.members.length;
    return 0;
  }

  function markRead(item) {
    if (!item || !item.id || !g.db || !g.db.upsertChat) return;
    var uid = myUid();
    if (!uid) return;
    var patch = {};
    patch['unread.' + uid] = 0;
    Promise.resolve(g.db.upsertChat(item.id, patch)).catch(function () {});
  }

  function openThread(item) {
    if (!item) return;
    active = item;
    if (item.unread) {
      markRead(item);
      item.unread = 0;
    }
    fillList($('hshsChatSearch') && $('hshsChatSearch').value);

    var thread = $('hshsThread');
    if (thread) thread.hidden = false;
    $('hshsThreadName') && ($('hshsThreadName').textContent = item.name || 'HSHS Student');
    var meta = $('hshsThreadMeta');
    if (meta) meta.textContent = item.group
      ? (memberCount(item) ? memberCount(item) + ' members' : 'Group chat')
      : (item.presenceLabel || (item.online ? 'Online now' : 'Offline'));
    var online = $('hshsThreadOnline');
    if (online) online.hidden = !!(item.group || !item.online);
    var av = $('hshsThreadAvatar');
    if (av) av.innerHTML = avatarHtml(item);
    var profileLink = $('hshsThreadProfileLink');
    if (profileLink) profileLink.href = item.group ? '#' : ('profile.html?uid=' + encodeURIComponent(item.peerId || ''));
    var input = $('hshsThreadInput');
    if (input) { input.placeholder = 'Type a message...'; input.value = ''; }
    var btn = $('hshsSendBtn');
    if (btn) btn.classList.remove('is-ready');
    updateComposerMode();

    var msgs = THREADS[threadId(item)] || [];
    if (msgs.length) paintMsgs(msgs, item, { forceScroll: true, force: true });
    else showWelcome(true);
    hideReactPop();
    closeEmoji();
    setShellClass();

    if (g.HshsChatLive && g.HshsChatLive.watch) g.HshsChatLive.watch(threadId(item));
  }

  function newClientId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function nowTime() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), am = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + am;
  }

  function markFailed(clientId) {
    if (!clientId || !active) return;
    var list = THREADS[threadId(active)] || [];
    list.forEach(function (m) { if (m.clientId === clientId) { m.pending = false; m.failed = true; } });
    paintMsgs(list, active, { force: true });
    toast('Message did not send');
  }

  function publishText(text, clientId) {
    if (!active || !text) return;
    var id = threadId(active);
    if (!g.HshsChatLive || !g.HshsChatLive.publish) { markFailed(clientId); return; }
    Promise.resolve(g.HshsChatLive.publish(text, { chatId: id, clientId: clientId }))
      .then(function (saved) { if (!saved) markFailed(clientId); })
      .catch(function () { markFailed(clientId); });
  }

  function appendMine(text) {
    if (!active || !text) return;
    var id = threadId(active);
    if (!THREADS[id]) THREADS[id] = [];
    var clientId = newClientId();
    THREADS[id].push({ mine: true, text: text, time: nowTime(), clientId: clientId, pending: true });
    active.preview = text.slice(0, 60);
    active.time = 'Now';
    paintMsgs(THREADS[id], active, { forceScroll: true, force: true });
    fillList($('hshsChatSearch') && $('hshsChatSearch').value);
    publishText(text, clientId);
  }

  function retryAt(idx) {
    if (!active) return;
    var list = THREADS[threadId(active)] || [];
    var msg = list[idx];
    if (!msg || !msg.failed) return;
    msg.failed = false;
    msg.pending = true;
    msg.clientId = msg.clientId || newClientId();
    paintMsgs(list, active, { force: true, forceScroll: true });
    publishText(msg.text, msg.clientId);
  }

  function updateComposerMode() {
    var input = $('hshsThreadInput');
    var send = $('hshsSendBtn');
    var voice = $('hshsVoiceBtn');
    var hasText = !!(input && (input.value || '').trim());
    if (voice) voice.hidden = true;
    if (send) {
      send.hidden = false;
      send.disabled = !hasText;
      send.classList.toggle('is-ready', hasText);
    }
  }

  function sendText() {
    var input = $('hshsThreadInput');
    if (!input) return;
    var text = (input.value || '').trim().slice(0, 2000);
    if (!text) return;
    input.value = '';
    closeEmoji();
    appendMine(text);
    var btn = $('hshsSendBtn');
    if (btn) btn.classList.remove('is-ready');
    updateComposerMode();
  }

  function hideReactPop() {
    var pop = document.querySelector('.msg-react-pop');
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
  }
  function showReactPop(idx, anchor) {
    hideReactPop();
    if (!active || idx < 0 || !anchor) return;
    var pop = document.createElement('div');
    pop.className = 'msg-react-pop';
    pop.innerHTML = REACTS.map(function (r) { return '<button type="button" data-react="' + r + '">' + r + '</button>'; }).join('');
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-react]');
      if (!b) return;
      addReact(idx, b.getAttribute('data-react'));
      hideReactPop();
    });
    anchor.style.position = 'relative';
    anchor.appendChild(pop);
  }
  function addReact(idx, emo) {
    var id = threadId(active);
    var list = THREADS[id];
    if (!list || !list[idx]) return;
    var msg = list[idx];
    msg.reacts = msg.reacts || [];
    if (msg.reacts.indexOf(emo) === -1) msg.reacts.push(emo);
    paintMsgs(list, active, { force: true });
    if (g.HshsChatLive && g.HshsChatLive.react && msg.id) g.HshsChatLive.react(msg.id, emo);
  }

  function closeEmoji() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) sheet.hidden = true;
  }
  function openEmoji() {
    var sheet = $('hshsEmojiSheet');
    if (!sheet) return;
    if (!sheet.dataset.built) {
      sheet.dataset.built = '1';
      sheet.innerHTML = EMOJI.map(function (e) { return '<button type="button">' + e + '</button>'; }).join('');
      sheet.addEventListener('click', function (ev) {
        var b = ev.target.closest('button');
        if (!b) return;
        var input = $('hshsThreadInput');
        if (!input) return;
        input.value += b.textContent;
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    }
    sheet.hidden = false;
  }

  var composeTimer = 0;
  function openCompose() {
    if (!signedIn()) { location.href = 'login.html'; return; }
    var sheet = $('hshsComposeSheet');
    if (!sheet) return;
    sheet.hidden = false;
    setShellClass();
    var input = $('hshsComposeSearch');
    if (input) { input.value = ''; setTimeout(function () { input.focus(); }, 60); }
    renderComposeResults([], 'Looking up classmates…');
    paintSuggested();
  }
  function closeCompose() {
    var sheet = $('hshsComposeSheet');
    if (sheet) sheet.hidden = true;
    setShellClass();
  }
  function renderComposeResults(rows, emptyText) {
    var box = $('hshsComposeResults');
    if (!box) return;
    var people = rows || [];
    var q = (($('hshsComposeSearch') && $('hshsComposeSearch').value) || '').toLowerCase().trim();
    var campus = CAMPUS_ROOMS.filter(function (r) {
      if (!q) return true;
      return (r.name + ' ' + r.blurb).toLowerCase().indexOf(q) !== -1;
    });
    var joined = INBOX.filter(function (c) {
      if (!c.group) return false;
      if (campusRoom(c)) return false;
      if (!q) return true;
      return (c.name + ' ' + (c.preview || '')).toLowerCase().indexOf(q) !== -1;
    });
    if (!people.length && !campus.length && !joined.length) {
      box.innerHTML = '<div class="msg-compose-empty">' + esc(emptyText || 'No classmates or groups found.') + '</div>';
      return;
    }
    var html = '';
    if (people.length) {
      html += '<div class="msg-compose-section-title">Suggested</div>';
      html += people.map(function (u) {
        var photo = u.photoURL || u.avatar || '';
        var av = photo ? '<img src="' + esc(photo) + '" alt="">' : initials(u.name || u.fullName);
        var handle = u.username ? '@' + u.username : 'HSHS student';
        return '<button type="button" class="msg-compose-row" data-uid="' + esc(u.uid || u.id || '') + '">' +
          '<span class="msg-compose-av">' + av + '</span>' +
          '<span><b>' + esc(u.name || u.fullName || 'HSHS Student') + '</b><small>' + esc(handle) + '</small></span>' +
          '<i class="fas fa-comment-dots" aria-hidden="true"></i></button>';
      }).join('');
    }
    html += '<div class="msg-compose-section-title">Groups</div>';
    html += campus.map(function (r) {
      var existing = findChat(r.id);
      var count = existing ? memberCount(existing) : 0;
      return '<button type="button" class="msg-compose-row msg-compose-group-row" data-campus="' + esc(r.id) + '">' +
        '<span class="msg-compose-av is-group"><i class="fas ' + r.icon + '" aria-hidden="true"></i></span>' +
        '<span><b>' + esc(r.name) + '</b><small>' + esc(count ? count + ' members' : r.blurb) + '</small></span>' +
        '<i class="fas fa-comment-dots" aria-hidden="true"></i></button>';
    }).join('');
    html += joined.map(function (c) {
      return '<button type="button" class="msg-compose-row msg-compose-group-row" data-chat="' + esc(c.id) + '">' +
        '<span class="msg-compose-av is-group"><i class="fas ' + groupIcon(c) + '" aria-hidden="true"></i></span>' +
        '<span><b>' + esc(c.name || 'Group chat') + '</b><small>' + esc(memberCount(c) ? memberCount(c) + ' members' : 'Group chat') + '</small></span>' +
        '<i class="fas fa-comment-dots" aria-hidden="true"></i></button>';
    }).join('');
    box.innerHTML = html;
  }
  function lookupUsers(q) {
    if (q) {
      if (g.HshsPeople && g.HshsPeople.search) return g.HshsPeople.search(q);
      if (g.db && g.db.searchUsers) return g.db.searchUsers(q, 20);
    } else if (g.HshsPeople && g.HshsPeople.listUsers) return g.HshsPeople.listUsers();
    else if (g.db && g.db.listUsers) return g.db.listUsers(12);
    return Promise.resolve([]);
  }
  function paintSuggested() {
    if ((!g.HshsPeople || !g.HshsPeople.listUsers) && (!g.db || !g.db.listUsers)) {
      renderComposeResults([], 'Sign in to find classmates.');
      return;
    }
    Promise.resolve(lookupUsers('')).then(function (rows) {
      if ($('hshsComposeSearch') && $('hshsComposeSearch').value.trim()) return;
      renderComposeResults((rows || []).filter(function (u) { return u.uid !== myUid(); }), 'No classmates found yet.');
    }).catch(function () { renderComposeResults([], 'Could not load classmates.'); });
  }
  function runComposeSearch(q) {
    Promise.resolve(lookupUsers(q)).then(function (rows) {
      renderComposeResults((rows || []).filter(function (u) { return u.uid !== myUid(); }), 'No classmates found.');
    }).catch(function () { renderComposeResults([], 'Search failed. Try again.'); });
  }
  function pickCampus(id) {
    var room = null;
    for (var i = 0; i < CAMPUS_ROOMS.length; i++) if (CAMPUS_ROOMS[i].id === id) room = CAMPUS_ROOMS[i];
    if (!room) return;
    var existing = findChat(room.id);
    if (existing) { closeCompose(); openThread(existing); return; }
    if (!g.db || !g.db.joinCampusGroup) { toast('Groups are not available yet'); return; }
    Promise.resolve(g.db.joinCampusGroup(room)).then(function (res) {
      if (!res || !res.ok) { toast(res && res.error || 'Could not join group'); return; }
      closeCompose();
      var item = findChat(res.chatId) || {
        id: res.chatId,
        name: room.name,
        group: true,
        campus: true,
        campusKey: room.id,
        memberIds: [myUid()].filter(Boolean),
        preview: '',
        time: 'Now',
        unread: 0
      };
      if (!findChat(res.chatId)) INBOX.unshift(item);
      openThread(item);
    }).catch(function () { toast('Could not join group'); });
  }

  function pickComposeUser(uid) {
    if (!uid || !g.db || !g.db.getUser || !g.db.startDirectChat) return;
    Promise.resolve(g.db.getUser(uid)).then(function (peer) {
      if (!peer) { toast('Could not find that classmate'); return; }
      return g.db.startDirectChat(peer).then(function (res) {
        if (!res || !res.ok) { toast(res && res.error || 'Could not start chat'); return; }
        closeCompose();
        var item = findChat(res.chatId) || {
          id: res.chatId,
          name: peer.name || peer.fullName || 'HSHS Student',
          user: peer.username || '',
          avatar: peer.photoURL || peer.avatar || '',
          peerId: peer.uid || uid,
          memberIds: [myUid(), peer.uid || uid].filter(Boolean),
          preview: '',
          time: 'Now',
          unread: 0,
          online: false,
          group: false
        };
        if (!findChat(res.chatId)) INBOX.unshift(item);
        openThread(item);
      });
    }).catch(function () { toast('Could not start chat'); });
  }

  function openFromQuery() {
    if (queryOpened || !signedIn() || !g.db) return;
    var params = new URLSearchParams(location.search);
    var uid = params.get('uid');
    var handle = params.get('u');
    if (!uid && !handle) return;
    queryOpened = true;
    var lookup = uid
      ? g.db.getUser && g.db.getUser(uid)
      : g.db.getUserByUsername && g.db.getUserByUsername(handle);
    Promise.resolve(lookup).then(function (peer) {
      if (!peer || !peer.uid) { queryOpened = false; toast('Could not find that classmate'); return; }
      pickComposeUser(peer.uid);
    }).catch(function () { queryOpened = false; });
  }

  function bindKeyboard() {
    if (!window.visualViewport || bindKeyboard.done) return;
    bindKeyboard.done = true;
    function apply() {
      var vv = window.visualViewport;
      var overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--msg-kb', (overlap > 40 ? overlap : 0) + 'px');
    }
    window.visualViewport.addEventListener('resize', apply);
    window.visualViewport.addEventListener('scroll', apply);
  }

  function wire() {
    var page = root();
    if (!page || page.dataset.wired) return;
    page.dataset.wired = '1';
    bindKeyboard();
    fillList();

    var searchForm = $('hshsChatSearchForm');
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
    var search = $('hshsChatSearch'), clearBtn = $('hshsSearchClear');
    if (search) search.addEventListener('input', function () {
      fillList(search.value);
      if (clearBtn) clearBtn.hidden = !search.value.trim();
    });
    if (clearBtn) clearBtn.onclick = function () {
      if (search) { search.value = ''; search.focus(); }
      fillList('');
      clearBtn.hidden = true;
    };

    var list = $('hshsChatList');
    if (list) list.addEventListener('click', function (e) {
      var row = e.target.closest('[data-chat]');
      if (!row) return;
      var chat = findChat(row.getAttribute('data-chat'));
      if (chat) openThread(chat);
    });

    var emptyList = $('hshsChatList');
    if (emptyList) emptyList.addEventListener('click', function (e) {
      var room = e.target.closest('[data-empty-campus]');
      if (!room) return;
      pickCampus(room.getAttribute('data-empty-campus'));
    });

    var filters = $('hshsChatFilters');
    if (filters) filters.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-filter]');
      if (!chip) return;
      activeFilter = chip.getAttribute('data-filter') || 'all';
      filters.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.toggle('is-on', b === chip); });
      fillList(search && search.value);
    });

    var back = $('hshsThreadBack');
    if (back) back.onclick = showList;
    var threadMenu = $('hshsThreadMenu');
    if (threadMenu) threadMenu.onclick = function () { toast('Conversation options coming soon'); };

    var form = $('hshsThreadForm');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); sendText(); });

    var input = $('hshsThreadInput');
    if (input) input.addEventListener('input', function () {
      updateComposerMode();
    });

    var quick = $('hshsChatQuick');
    if (quick) quick.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quick]');
      if (!b) return;
      if (input) { input.value = b.getAttribute('data-quick') || ''; updateComposerMode(); input.focus(); }
    });

    var emojiBtn = $('hshsEmojiBtn');
    if (emojiBtn) emojiBtn.onclick = function () {
      var sheet = $('hshsEmojiSheet');
      if (sheet && !sheet.hidden) closeEmoji(); else openEmoji();
    };

    var hi = $('hshsSayHi');
    if (hi) hi.onclick = function () { appendMine(active && active.group ? 'Hi everyone' : 'Hi'); };

    var msgs = $('hshsThreadMsgs');
    if (msgs) {
      msgs.addEventListener('pointerdown', function (e) {
        var row = e.target.closest('[data-mi]');
        if (!row) return;
        holdReact.idx = Number(row.getAttribute('data-mi'));
        holdReact.x = e.clientX;
        holdReact.y = e.clientY;
        clearTimeout(holdReact.timer);
        holdReact.timer = setTimeout(function () { showReactPop(holdReact.idx, row.querySelector('.msg-bubble')); }, 420);
      });
      msgs.addEventListener('pointermove', function (e) {
        if (Math.abs(e.clientX - holdReact.x) > 12 || Math.abs(e.clientY - holdReact.y) > 12) clearTimeout(holdReact.timer);
      });
      msgs.addEventListener('pointerup', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('pointercancel', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('contextmenu', function (e) {
        if (e.target.closest('[data-mi]')) e.preventDefault();
      });
      msgs.addEventListener('click', function (e) {
        var failed = e.target.closest('.msg-bubble.is-failed');
        if (!failed) return;
        var row = failed.closest('[data-mi]');
        if (row) retryAt(Number(row.getAttribute('data-mi')));
      });
    }

    var markRead = $('hshsMarkRead');
    if (markRead) markRead.onclick = function () {
      INBOX.forEach(function (c) { c.unread = 0; });
      fillList($('hshsChatSearch') && $('hshsChatSearch').value);
      toast('All caught up');
    };

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !e.shiftKey) {
        var searchBox = $('hshsChatSearch');
        if (searchBox) { e.preventDefault(); searchBox.focus(); }
      }
    });

    var composeTop = $('hshsComposeTop');
    if (composeTop) composeTop.onclick = openCompose;
    var composeClose = $('hshsComposeClose');
    if (composeClose) composeClose.onclick = closeCompose;
    var composeBack = $('hshsComposeBack');
    if (composeBack) composeBack.onclick = closeCompose;
    var composeBackdrop = $('hshsComposeBackdrop');
    if (composeBackdrop) composeBackdrop.onclick = closeCompose;
    var composeSearch = $('hshsComposeSearch');
    if (composeSearch) composeSearch.addEventListener('input', function () {
      clearTimeout(composeTimer);
      var q = composeSearch.value.trim();
      if (!q) { paintSuggested(); return; }
      renderComposeResults([], 'Searching…');
      composeTimer = setTimeout(function () { runComposeSearch(q); }, 220);
    });
    var composeResults = $('hshsComposeResults');
    if (composeResults) composeResults.addEventListener('click', function (e) {
      var userRow = e.target.closest('[data-uid]');
      if (userRow) {
        pickComposeUser(userRow.getAttribute('data-uid'));
        return;
      }
      var campusRow = e.target.closest('[data-campus]');
      if (campusRow) {
        pickCampus(campusRow.getAttribute('data-campus'));
        return;
      }
      var groupRow = e.target.closest('[data-chat]');
      if (groupRow) {
        var group = findChat(groupRow.getAttribute('data-chat'));
        if (group) { closeCompose(); openThread(group); }
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.msg-react-pop') && !e.target.closest('[data-mi]')) hideReactPop();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if ($('hshsComposeSheet') && !$('hshsComposeSheet').hidden) { closeCompose(); return; }
      if ($('hshsEmojiSheet') && !$('hshsEmojiSheet').hidden) { closeEmoji(); return; }
      if (active) showList();
    });
    openFromQuery();
  }

  function boot() {
    if (!root()) return;
    wire();
    openFromQuery();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  document.addEventListener('hshs:auth', function () { openFromQuery(); fillList($('hshsChatSearch') && $('hshsChatSearch').value); });

  function clearGroupPresence(rows) {
    (rows || []).forEach(function (c) {
      if (!c.group) return;
      c.online = false;
      c.presenceLabel = memberCount(c) ? memberCount(c) + ' members' : 'Group chat';
    });
  }

  function setMode(mode) {
    MODE = mode === 'live' ? 'live' : (mode === 'connecting' ? 'connecting' : 'local');
    var page = root();
    if (page) {
      page.classList.toggle('is-live', MODE === 'live');
      page.classList.toggle('is-local', MODE !== 'live');
    }
    var hero = document.querySelector('.msg-hero-titles p');
    if (hero) hero.textContent = MODE === 'live' ? 'Live campus chat' : (MODE === 'connecting' ? 'Connecting…' : (signedIn() ? 'Reconnecting…' : 'Sign in to message classmates'));
    fillList($('hshsChatSearch') && $('hshsChatSearch').value);
    if (MODE === 'live') openFromQuery();
  }
  function setInbox(rows) {
    INBOX = rows || [];
    clearGroupPresence(INBOX);
    if (active) {
      var next = findChat(active.id);
      if (next) {
        active = next;
        var meta = $('hshsThreadMeta');
        if (meta && !next.group) meta.textContent = next.presenceLabel || (next.online ? 'Online now' : 'Offline');
        var online = $('hshsThreadOnline');
        if (online) online.hidden = !!(next.group || !next.online);
      }
    }
    fillList($('hshsChatSearch') && $('hshsChatSearch').value);
  }
  function applyRemoteThread(chatId, rows) {
    if (!chatId) return;
    var incoming = rows || [];
    var existing = THREADS[chatId] || [];
    var remoteClients = {};
    incoming.forEach(function (m) { if (m.clientId) remoteClients[m.clientId] = true; });
    var pending = existing.filter(function (m) { return m.pending && m.clientId && !remoteClients[m.clientId]; });
    var merged = incoming.concat(pending);
    THREADS[chatId] = merged;
    if (active && threadId(active) === chatId) {
      if (!merged.length) showWelcome(true);
      else {
        var last = merged[merged.length - 1];
        paintMsgs(merged, active, { forceScroll: !!(last && last.mine), force: true });
      }
    }
  }
  function setPresenceMap(map) {
    PRESENCE = map || {};
    var uid = myUid();
    INBOX.forEach(function (c) {
      if (c.group) { c.online = false; return; }
      var peer = (c.memberIds || []).filter(function (id) { return id && id !== uid; })[0] || c.peerId;
      var row = peer && PRESENCE[peer];
      if (!row) { c.online = false; c.presenceLabel = c.presenceLabel || 'Offline'; return; }
      var last = row.lastSeen;
      var ms = (last && typeof last.toMillis === 'function') ? last.toMillis() : (last && last.seconds ? last.seconds * 1000 : Date.parse(last) || 0);
      var ago = Date.now() - ms;
      if (row.online && ago < 120000) { c.online = true; c.presenceLabel = 'Online now'; }
      else if (ago && ago < 15 * 60 * 1000) { c.online = false; c.presenceLabel = 'Active recently'; }
      else { c.online = false; c.presenceLabel = 'Offline'; }
    });
    if (active && !active.group) {
      var cur = findChat(active.id);
      if (cur) {
        active.online = cur.online;
        active.presenceLabel = cur.presenceLabel;
        var meta = $('hshsThreadMeta');
        if (meta) meta.textContent = cur.presenceLabel || 'Offline';
        var online = $('hshsThreadOnline');
        if (online) online.hidden = !cur.online;
      }
    }
    fillList($('hshsChatSearch') && $('hshsChatSearch').value);
  }

  g.HshsMessagesUi = {
    boot: boot,
    openThread: openThread,
    showList: showList,
    appendMine: appendMine,
    setMode: setMode,
    setInbox: setInbox,
    applyRemoteThread: applyRemoteThread,
    setPresenceMap: setPresenceMap,
    activeId: function () { return active ? threadId(active) : ''; },
    mode: function () { return MODE; }
  };
})(typeof window !== 'undefined' ? window : this);
