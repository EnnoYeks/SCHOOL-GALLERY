(function (g) {
  'use strict';
  if (g.__hshsMessagesUi) return;
  g.__hshsMessagesUi = true;
  var AV = function (seed) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=1e3a5f';
  };
  var INBOX = [
    { id: 'daniel', name: 'Daniel Okello', user: 'daniel_ok', preview: 'Hey! How are you doing? 😊', time: '10:24 AM', unread: 1, online: true, avatar: AV('DanielOkello'), empty: false, sample: 'daniel' },
    { id: 'aisha', name: 'Aisha Nakitende', user: 'aisha_n', preview: "Thanks! I'll check it out.", time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('AishaN'), empty: true },
    { id: 'brian', name: 'Brian Kato', user: 'brian_k', preview: 'See you tomorrow bro 💪', time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('BrianKato'), empty: false, sample: 'brian' },
    { id: 'faith', name: 'Faith Namulondo', user: 'faith_n', preview: "That's awesome! ✨", time: 'Mon', unread: 0, read: true, online: true, avatar: AV('FaithN'), empty: true },
    { id: 'joseph', name: 'Joseph Ssemmanda', user: 'joseph_s', preview: 'Alright, got it.', time: 'Sun', unread: 0, read: true, online: true, avatar: AV('JosephS'), empty: true },
    { id: 'gloria', name: 'Gloria Nankinga', user: 'gloria_n', preview: "Let's catch up soon.", time: 'Sat', unread: 0, read: true, online: false, avatar: AV('GloriaN'), empty: true },
    { id: 'mercy', name: 'Mercy Atim', user: 'mercy', preview: 'See you at assembly tomorrow', time: 'Fri', unread: 2, online: true, avatar: AV('MercyAtim'), empty: true },
    { id: 'maya', name: 'Maya Okello', user: 'maya_lens', preview: 'New campus shots 📸', time: 'Thu', unread: 0, read: true, online: false, avatar: AV('MayaLens'), empty: true },
    { id: 'joel', name: 'Joel Wambede', user: 'joel_pref', preview: 'Assembly at 8 sharp 📋', time: 'Wed', unread: 1, online: true, avatar: AV('JoelPref'), empty: true },
    { id: 'class4a', name: 'Class 4A', user: 'class4a', preview: 'Ivan: Maths homework is in the group', time: 'Tue', unread: 5, group: true, online: false, avatar: AV('Class4A'), empty: true }
  ];
  var THREADS = {
    brian: [
      { mine: false, text: 'Hey bro 👋', time: '3:42 PM' },
      { mine: false, text: 'How are you doing?', time: '3:42 PM', cont: true },
      { mine: true, text: 'Heyy 👋', time: '3:43 PM', read: true },
      { mine: true, text: "I'm good man, just chilling", time: '3:43 PM', read: true, cont: true },
      { mine: false, text: 'Niceee<br>Any new updates on the gallery project?', time: '3:44 PM' },
      { mine: true, text: "Yeah! Working on the new design<br>It's looking really dope 🔥", time: '3:45 PM', read: true },
      { mine: false, text: "Can't wait to see it<br>You always cook 🔥", time: '3:46 PM' },
      { mine: true, text: "Appreciate that 🙌<br>I'll share a preview soon", time: '3:47 PM', read: true },
      { mine: false, text: 'Bet!<br>Keep going 💯', time: '3:48 PM' },
      { mine: true, text: 'For sure bro 👊', time: '3:48 PM', read: true }
    ],
    daniel: [
      { mine: false, text: 'Hey! How are you doing? 😊', time: '10:22 AM' },
      { mine: false, text: 'You free after class?', time: '10:23 AM', cont: true }
    ]
  };
  var active = null;
  function $(id) { return document.getElementById(id); }
  function first(name) { return String(name || 'there').split(' ')[0]; }
  function initials(name) {
    return String(name || '?').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function avatarHtml(item) {
    return '<img src="' + (item.avatar || AV(item.name)) + '" alt="" loading="lazy">';
  }
  function fillInbox(q) {
    var box = $('hshsChatList');
    if (!box) return;
    q = String(q || '').toLowerCase().trim();
    var rows = INBOX.filter(function (c) {
      if (!q) return true;
      return (c.name + ' ' + c.user + ' ' + c.preview).toLowerCase().indexOf(q) !== -1;
    });
    if (!rows.length) {
      box.innerHTML = '<div class="hshs-chat-empty">No conversations match that search.</div>';
      return;
    }
    box.innerHTML = rows.map(function (c) {
      var idx = INBOX.indexOf(c);
      var metaRight = c.unread
        ? '<span class="hshs-badge">' + c.unread + '</span>'
        : (c.read ? '<span class="msg-ticks read">✓✓</span>' : '<span class="msg-ticks">✓✓</span>');
      var online = c.online ? '<i class="msg-online-dot"></i>' : '';
      return '<button type="button" class="msg-row' + (c.unread ? ' is-hot' : '') + '" data-demo="' + idx + '">' +
        '<span class="msg-row-av">' + avatarHtml(c) + online + '</span>' +
        '<span class="msg-row-body"><strong>' + c.name + '</strong><small>' + c.preview + '</small></span>' +
        '<span class="msg-row-meta"><time>' + c.time + '</time>' + metaRight + '</span></button>';
    }).join('');
  }
  function closeEmoji() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) { sheet.hidden = true; sheet.classList.remove('is-open'); }
    if (g.HshsChatPacks && g.HshsChatPacks.close) g.HshsChatPacks.close();
  }
  function openEmoji() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) { sheet.hidden = false; sheet.classList.add('is-open'); }
    if (g.HshsChatPacks && g.HshsChatPacks.open) g.HshsChatPacks.open();
  }
  function showList() {
    var list = $('hshsChatListView'), thread = $('hshsThread'), page = $('hshsChatPage');
    if (list) list.hidden = false;
    if (thread) thread.hidden = true;
    if (page) page.classList.remove('is-open');
    closeEmoji();
  }
  function showWelcome(on) {
    var w = $('hshsThreadWelcome'), box = $('hshsThreadMsgs');
    if (w) w.hidden = !on;
    if (box) box.hidden = !!on;
  }
  function paintMsgs(messages, item) {
    var box = $('hshsThreadMsgs');
    if (!box) return;
    showWelcome(false);
    var avLabel = initials(item && item.name);
    box.innerHTML = '<div class="hshs-date-chip">Today</div>' + messages.map(function (m) {
      var av = (!m.mine && !m.cont)
        ? '<span class="hshs-bubble-av">' + (item && item.avatar ? '<img src="' + item.avatar + '" alt="">' : avLabel) + '</span>'
        : '';
      var ticks = m.mine ? '<span class="hshs-ticks' + (m.read ? ' read' : '') + '">✓✓</span>' : '';
      return '<div class="hshs-row ' + (m.mine ? 'mine' : 'theirs') + (m.cont ? ' cont' : '') + '">' + av +
        '<div class="hshs-bubble ' + (m.mine ? 'mine' : 'theirs') + '"><div class="hshs-bubble-text">' + m.text + '</div>' +
        '<time>' + m.time + ticks + '</time></div></div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }
  function openThread(item) {
    active = item;
    if (item.unread) item.unread = 0;
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
    var list = $('hshsChatListView'), thread = $('hshsThread'), page = $('hshsChatPage');
    if (list) list.hidden = true;
    if (thread) thread.hidden = false;
    if (page) page.classList.add('is-open');
    var nm = $('hshsThreadName'); if (nm) nm.textContent = item.name;
    var handle = $('hshsThreadHandle'); if (handle) handle.textContent = '@' + (item.user || first(item.name).toLowerCase());
    var meta = $('hshsThreadMeta'); if (meta) meta.textContent = item.online ? 'Online now' : (item.group ? 'Group chat' : 'Last seen recently');
    var online = $('hshsThreadOnline'); if (online) online.hidden = !item.online;
    var av = $('hshsThreadAvatar'); if (av) av.innerHTML = avatarHtml(item);
    var input = $('hshsThreadInput');
    if (input) { input.placeholder = 'Message ' + first(item.name) + '...'; input.value = ''; }
    var wAv = $('hshsWelcomeAv'); if (wAv) wAv.textContent = initials(item.name);
    var wTitle = $('hshsWelcomeTitle'); if (wTitle) wTitle.textContent = 'Say hi to ' + first(item.name) + ' 👋';
    var msgs = THREADS[item.sample || item.id];
    if (msgs && msgs.length && !item.empty) paintMsgs(msgs, item);
    else showWelcome(true);
    closeEmoji();
  }
  function nowTime() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), am = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + am;
  }
  function appendMine(text) {
    if (!active) return;
    var id = active.sample || active.id;
    if (!THREADS[id]) THREADS[id] = [];
    THREADS[id].push({ mine: true, text: text, time: nowTime(), read: true });
    active.empty = false;
    active.preview = text.replace(/<br>/g, ' ').slice(0, 40);
    active.time = 'Now';
    active.read = true;
    paintMsgs(THREADS[id], active);
  }
  function sendText() {
    var input = $('hshsThreadInput');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    closeEmoji();
    appendMine(text.replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br>'));
    var btn = $('hshsSendBtn');
    if (btn) btn.classList.remove('is-ready');
  }
  function wire() {
    if (!$('hshsChatPage')) return;
    fillInbox();
    var search = $('hshsChatSearch'), clearBtn = $('hshsSearchClear');
    if (search && !search.dataset.bound) {
      search.dataset.bound = '1';
      search.addEventListener('input', function () {
        fillInbox(search.value);
        if (clearBtn) clearBtn.hidden = !search.value.trim();
      });
    }
    if (clearBtn && !clearBtn.dataset.bound) {
      clearBtn.dataset.bound = '1';
      clearBtn.onclick = function () {
        if (search) { search.value = ''; search.focus(); }
        fillInbox('');
        clearBtn.hidden = true;
      };
    }
    var list = $('hshsChatList');
    if (list && !list.dataset.bound) {
      list.dataset.bound = '1';
      list.addEventListener('click', function (e) {
        var row = e.target.closest('[data-demo]');
        if (!row) return;
        e.preventDefault();
        openThread(INBOX[Number(row.getAttribute('data-demo'))]);
      });
    }
    var back = $('hshsThreadBack');
    if (back && !back.dataset.bound) { back.dataset.bound = '1'; back.onclick = showList; }
    var form = $('hshsThreadForm');
    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', function (e) { e.preventDefault(); sendText(); });
    }
    var input = $('hshsThreadInput');
    if (input && !input.dataset.bound) {
      input.dataset.bound = '1';
      input.addEventListener('input', function () {
        var btn = $('hshsSendBtn');
        if (btn) btn.classList.toggle('is-ready', !!(input.value || '').trim());
      });
    }
    var emojiBtn = $('hshsEmojiBtn');
    if (emojiBtn && !emojiBtn.dataset.bound) {
      emojiBtn.dataset.bound = '1';
      emojiBtn.onclick = function () {
        var sheet = $('hshsEmojiSheet');
        if (sheet && !sheet.hidden) closeEmoji(); else openEmoji();
      };
    }
    var page = $('hshsChatPage');
    if (page && !page.dataset.emojiCloseBound) {
      page.dataset.emojiCloseBound = '1';
      page.addEventListener('click', function (e) {
        if (e.target.closest('#hshsEmojiClose, .msg-emoji-close')) {
          e.preventDefault();
          closeEmoji();
        }
      });
    }
    function pickFile() { var f = $('hshsAttachInput'); if (f) f.click(); }
    ['hshsPlusBtn', 'hshsImageBtn', 'hshsSharePhoto'].forEach(function (id) {
      var el = $(id);
      if (el && !el.dataset.bound) { el.dataset.bound = '1'; el.onclick = pickFile; }
    });
    var file = $('hshsAttachInput');
    if (file && !file.dataset.bound) {
      file.dataset.bound = '1';
      file.addEventListener('change', function () {
        if (!file.files || !file.files[0]) return;
        appendMine('📷 Photo · ' + file.files[0].name);
        file.value = '';
      });
    }
    var hi = $('hshsSayHi');
    if (hi && !hi.dataset.bound) { hi.dataset.bound = '1'; hi.onclick = function () { appendMine('Hi 👋'); }; }
    var mic = $('hshsMicBtn');
    if (mic && !mic.dataset.bound) {
      mic.dataset.bound = '1';
      mic.onclick = function () { appendMine('🎤 Voice note · 0:03'); };
    }
    function newChat() {
      var firstEmpty = INBOX.find(function (c) { return c.empty; }) || INBOX[0];
      if (firstEmpty) openThread(firstEmpty);
    }
    var fab = $('hshsComposeFab');
    if (fab && !fab.dataset.bound) { fab.dataset.bound = '1'; fab.onclick = newChat; }
    var top = $('hshsComposeTop');
    if (top && !top.dataset.bound) { top.dataset.bound = '1'; top.onclick = newChat; }
    g.__hshsInsertEmoji = function (emo) {
      var inp = $('hshsThreadInput');
      if (!inp) return;
      var start = inp.selectionStart || inp.value.length;
      var end = inp.selectionEnd || inp.value.length;
      inp.value = inp.value.slice(0, start) + emo + inp.value.slice(end);
      inp.focus();
      try { inp.setSelectionRange(start + emo.length, start + emo.length); } catch (e) {}
      inp.dispatchEvent(new Event('input'));
    };
  }
  function boot() {
    if (!$('hshsChatPage')) return;
    wire();
    setTimeout(wire, 200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsMessagesUi = { boot: boot, openThread: openThread, showList: showList };
})(typeof window !== 'undefined' ? window : this);
