(function (g) {
  'use strict';
  if (g.__hshsMessagesUi) return;
  g.__hshsMessagesUi = true;

  var STORE_KEY = 'hshsWorldChat_v1';
  var REACTS = ['\uD83D\uDC4D', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE2E'];
  var AV = function (seed) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=1e3a5f';
  };

  var INBOX = [
    { id: 'daniel', name: 'Daniel Okello', user: 'daniel_ok', preview: 'Hey! How are you doing?', time: '10:24 AM', unread: 1, online: true, avatar: AV('DanielOkello') },
    { id: 'aisha', name: 'Aisha Nakitende', user: 'aisha_n', preview: 'Thanks! I will check it out.', time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('AishaN') },
    { id: 'brian', name: 'Brian Kato', user: 'brian_k', preview: 'See you tomorrow bro', time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('BrianKato') },
    { id: 'faith', name: 'Faith Namulondo', user: 'faith_n', preview: 'That is awesome!', time: 'Mon', unread: 0, read: true, online: true, avatar: AV('FaithN') },
    { id: 'joseph', name: 'Joseph Ssemmanda', user: 'joseph_s', preview: 'Alright, got it.', time: 'Sun', unread: 0, read: true, online: true, avatar: AV('JosephS') },
    { id: 'gloria', name: 'Gloria Nankinga', user: 'gloria_n', preview: 'Let us catch up soon.', time: 'Sat', unread: 0, read: true, online: false, avatar: AV('GloriaN') },
    { id: 'mercy', name: 'Mercy Atim', user: 'mercy', preview: 'See you at assembly tomorrow', time: 'Fri', unread: 2, online: true, avatar: AV('MercyAtim') },
    { id: 'maya', name: 'Maya Okello', user: 'maya_lens', preview: 'New campus shots', time: 'Thu', unread: 0, read: true, online: false, avatar: AV('MayaLens') },
    { id: 'joel', name: 'Joel Wambede', user: 'joel_pref', preview: 'Assembly at 8 sharp', time: 'Wed', unread: 1, online: true, avatar: AV('JoelPref') },
    { id: 'class4a', name: 'Class 4A', user: 'class4a', preview: 'Ivan: Maths homework is in the group', time: 'Tue', unread: 5, group: true, members: ['Ivan', 'Aisha', 'Brian', 'Faith', 'Mercy'], online: false, avatar: AV('Class4A') }
  ];

  var THREADS = {
    daniel: [
      { mine: false, text: 'Hey! How are you doing?', time: '10:22 AM' },
      { mine: false, text: 'You free after class?', time: '10:23 AM', cont: true }
    ],
    aisha: [
      { mine: true, text: 'I dropped the new gallery layout.', time: 'Yesterday', read: true },
      { mine: false, text: 'Thanks! I will check it out.', time: 'Yesterday' }
    ],
    brian: [
      { mine: false, text: 'Hey bro', time: '3:42 PM' },
      { mine: true, text: 'See you tomorrow bro', time: '3:49 PM', read: true }
    ],
    faith: [
      { mine: true, text: 'The science fair stand is ready.', time: 'Mon', read: true },
      { mine: false, text: 'That is awesome!', time: 'Mon' }
    ],
    joseph: [
      { mine: true, text: 'Can you print the house list?', time: 'Sun', read: true },
      { mine: false, text: 'Alright, got it.', time: 'Sun' }
    ],
    gloria: [
      { mine: false, text: 'Missed you at choir practice.', time: 'Sat' },
      { mine: true, text: 'Let us catch up soon.', time: 'Sat', read: true }
    ],
    mercy: [
      { mine: false, text: 'Prefect briefing after lunch.', time: 'Fri' },
      { mine: false, text: 'See you at assembly tomorrow', time: 'Fri', cont: true }
    ],
    maya: [
      { mine: false, text: 'Shot the quad at golden hour.', time: 'Thu' }
    ],
    joel: [
      { mine: false, text: 'Assembly at 8 sharp', time: 'Wed' }
    ],
    class4a: [
      { mine: false, sender: 'Ivan', text: 'Maths homework is in the group', time: 'Tue' },
      { mine: true, text: 'Noted. I will scan my working.', time: 'Tue', read: true }
    ]
  };

  var SEED_INBOX = INBOX.map(function (c) { return Object.assign({}, c); });
  var SEED_THREADS = {};
  Object.keys(THREADS).forEach(function (id) {
    SEED_THREADS[id] = THREADS[id].map(function (m) { return Object.assign({}, m); });
  });

  var MODE = 'local';
  var PRESENCE = {};
  var lastPaintSig = {};
  var active = null;
  var rec = { stream: null, media: null, chunks: [], ctx: null, analyser: null, raf: 0 };
  var typingTimer = 0;
  var holdReact = { timer: 0, idx: -1 };

  function $(id) { return document.getElementById(id); }
  function first(name) { return String(name || 'there').split(' ')[0]; }
  function initials(name) {
    return String(name || '?').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  }
  function nowTime() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), am = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + am;
  }
  function fmtMs(ms) {
    var s = Math.max(1, Math.round((ms || 0) / 1000));
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + String(s).padStart(2, '0');
  }
  function avatarHtml(item) {
    return '<img src="' + (item.avatar || AV(item.name)) + '" alt="" loading="lazy">';
  }
  function threadId(item) { return (item && (item.id || item.sample)) || ''; }
  function previewOf(msg) {
    if (!msg) return '';
    if (msg.kind === 'photo') return 'Photo';
    if (msg.kind === 'video') return 'Video';
    if (msg.kind === 'file') return (msg.fileName || 'Document');
    if (msg.kind === 'voice') return 'Voice note';
    return String(msg.text || '').replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').slice(0, 48);
  }

  function toastSoon(msg) {
    var el = $('hshsChatToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hshsChatToast';
      el.className = 'hshs-chat-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg || 'Coming soon';
    el.classList.add('is-on');
    clearTimeout(toastSoon._t);
    toastSoon._t = setTimeout(function () { el.classList.remove('is-on'); }, 1600);
  }

  function persist() {
    if (MODE === 'live') return;
    var slim = { inbox: INBOX, threads: {} };
    Object.keys(THREADS).forEach(function (id) {
      slim.threads[id] = THREADS[id].map(function (m) {
        var copy = {};
        Object.keys(m).forEach(function (k) { copy[k] = m[k]; });
        if (copy.src && String(copy.src).indexOf('blob:') === 0) delete copy.src;
        if (copy.src && String(copy.src).length > 1800000) delete copy.src;
        return copy;
      });
    });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(slim)); } catch (e) {}
  }

  function hydrate() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved || !saved.threads) return;
    Object.keys(saved.threads).forEach(function (id) {
      if (Array.isArray(saved.threads[id]) && saved.threads[id].length) THREADS[id] = saved.threads[id];
    });
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
      box.innerHTML = MODE === 'live'
        ? '<div class="hshs-chat-empty">No conversations yet.</div>'
        : '<div class="hshs-chat-empty">No conversations match that search.</div>';
      return;
    }
    box.innerHTML = rows.map(function (c) {
      var idx = INBOX.indexOf(c);
      var metaRight = c.unread
        ? '<span class="hshs-badge">' + c.unread + '</span>'
        : (c.read ? '<span class="msg-ticks read">OK</span>' : '<span class="msg-ticks">OK</span>');
      var online = c.online ? '<i class="msg-online-dot"></i>' : '';
      var tag = c.group ? '<em class="msg-group-tag">Group</em>' : '';
      return '<button type="button" class="msg-row' + (c.unread ? ' is-hot' : '') + (c.group ? ' is-group' : '') + '" data-demo="' + idx + '">' +
        '<span class="msg-row-av">' + avatarHtml(c) + online + '</span>' +
        '<span class="msg-row-body"><strong>' + esc(c.name) + tag + '</strong><small>' + esc(c.preview) + '</small></span>' +
        '<span class="msg-row-meta"><time>' + esc(c.time) + '</time>' + metaRight + '</span></button>';
    }).join('');
  }

  function closeAttach() {
    var sheet = $('hshsAttachSheet');
    if (sheet) { sheet.hidden = true; sheet.classList.remove('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.remove('is-attach');
    var plus = $('hshsPlusBtn');
    if (plus) plus.classList.remove('is-on');
  }
  function openAttach() {
    closeEmoji();
    var sheet = $('hshsAttachSheet');
    if (sheet) { sheet.hidden = false; sheet.classList.add('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.add('is-attach');
    var plus = $('hshsPlusBtn');
    if (plus) plus.classList.add('is-on');
  }
  function toggleAttach() {
    var sheet = $('hshsAttachSheet');
    if (sheet && !sheet.hidden) closeAttach();
    else openAttach();
  }
  function closeEmoji() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) { sheet.hidden = true; sheet.classList.remove('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.remove('is-emoji');
    if (g.HshsChatPacks && g.HshsChatPacks.close) g.HshsChatPacks.close();
  }
  function openEmoji() {
    closeAttach();
    var sheet = $('hshsEmojiSheet');
    if (sheet) { sheet.hidden = false; sheet.classList.add('is-open'); }
    var page = $('hshsChatPage');
    if (page) page.classList.add('is-emoji');
    if (g.HshsChatPacks && g.HshsChatPacks.open) g.HshsChatPacks.open();
  }
  function showList() {
    var list = $('hshsChatListView'), thread = $('hshsThread'), page = $('hshsChatPage');
    if (list) list.hidden = false;
    if (thread) thread.hidden = true;
    if (page) page.classList.remove('is-open');
    hideReactPop();
    closeEmoji();
    closeAttach();
    active = null;
    if (g.HshsChatLive && g.HshsChatLive.unwatchThread) g.HshsChatLive.unwatchThread();
  }
  function showWelcome(on) {
    var w = $('hshsThreadWelcome'), box = $('hshsThreadMsgs');
    if (w) w.hidden = !on;
    if (box) box.hidden = !!on;
  }
  function reactHtml(m) {
    if (!m.reacts || !m.reacts.length) return '';
    return '<span class="hshs-reacts">' + m.reacts.map(function (r) { return '<i>' + r + '</i>'; }).join('') + '</span>';
  }
  function nearBottom(box) {
    if (!box) return true;
    return (box.scrollHeight - box.scrollTop - box.clientHeight) < 96;
  }
  function paintSig(messages) {
    return (messages || []).map(function (m) {
      var reacts = Array.isArray(m.reacts) ? m.reacts.join('') : String(m.reacts || '');
      return [m.id || m.clientId || '', m.text || '', m.src || '', m.pending ? 1 : 0, m.failed ? 1 : 0, reacts].join(':');
    }).join('|');
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
    var avLabel = initials(item && item.name);
    var html = '<div class="hshs-date-chip">Today</div>';
    html += messages.map(function (m, i) {
      var av = (!m.mine && !m.cont)
        ? '<span class="hshs-bubble-av">' + (item && item.avatar ? '<img src="' + item.avatar + '" alt="">' : avLabel) + '</span>'
        : '';
      var ticks = m.mine ? '<span class="hshs-ticks' + (m.read ? ' read' : '') + '">OK</span>' : '';
      var sender = (!m.mine && item && item.group && m.sender && !m.cont) ? '<span class="hshs-sender">' + esc(m.sender) + '</span>' : '';
      var body;
      if (m.kind === 'photo' && m.src) {
        body = '<div class="hshs-bubble-media"><img src="' + m.src + '" alt="Photo"><div class="hshs-bubble-text">' + esc(m.text || 'Photo') + '</div></div>';
      } else if (m.kind === 'video') {
        body = '<div class="hshs-bubble-media">';
        if (m.src) body += '<video controls preload="metadata" src="' + m.src + '"></video>';
        body += '<div class="hshs-bubble-text">' + esc(m.text || m.fileName || 'Video') + '</div></div>';
      } else if (m.kind === 'file') {
        body = '<div class="hshs-file-chip"><i class="fas fa-file-lines"></i><span><b>' + esc(m.fileName || 'Document') + '</b><small>' + esc(m.fileMeta || 'File') + '</small></span></div>';
      } else if (m.kind === 'voice') {
        body = '<div class="hshs-bubble-voice">Voice note</div>';
        if (m.src) body += '<audio controls preload="none" src="' + m.src + '"></audio>';
      } else {
        body = '<div class="hshs-bubble-text">' + String(m.text || '').replace(/\n/g, '<br>') + '</div>';
      }
      var pendingCls = m.pending ? ' is-pending' : (m.failed ? ' is-failed' : '');
      return '<div class="hshs-row ' + (m.mine ? 'mine' : 'theirs') + (m.cont ? ' cont' : '') + pendingCls + '" data-mi="' + i + '" data-mid="' + esc(m.id || m.clientId || '') + '">' + av +
        '<div class="hshs-bubble ' + (m.mine ? 'mine' : 'theirs') + '">' + sender + body +
        reactHtml(m) + '<time>' + esc(m.time) + ticks + '</time></div></div>';
    }).join('');
    box.innerHTML = html;
    if (stick) box.scrollTop = box.scrollHeight;
  }
  function hideTyping() {
    var row = document.querySelector('.hshs-typing-row');
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }
  function showTyping() {
    var box = $('hshsThreadMsgs');
    if (!box || !active) return;
    showWelcome(false);
    hideTyping();
    var row = document.createElement('div');
    row.className = 'hshs-row theirs hshs-typing-row';
    row.innerHTML = '<div class="hshs-bubble theirs"><span class="hshs-dots" aria-label="Typing"><i></i><i></i><i></i></span></div>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }
  function openThread(item) {
    if (!item) return;
    active = item;
    if (item.unread) item.unread = 0;
    persist();
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
    var list = $('hshsChatListView'), thread = $('hshsThread'), page = $('hshsChatPage');
    if (list) list.hidden = true;
    if (thread) thread.hidden = false;
    if (page) page.classList.add('is-open');
    var nm = $('hshsThreadName'); if (nm) nm.textContent = item.name;
    var handle = $('hshsThreadHandle');
    if (handle) handle.textContent = item.group ? (item.members ? item.members.slice(0, 2).join(', ') + ' and others' : 'Group chat') : ('@' + (item.user || first(item.name).toLowerCase()));
    var meta = $('hshsThreadMeta');
    if (meta) meta.textContent = item.group
      ? ((item.members && item.members.length) ? item.members.length + ' members' : 'Class group')
      : (item.presenceLabel || (item.online ? 'Online now' : (MODE === 'live' ? 'Offline' : 'Last seen recently')));
    var online = $('hshsThreadOnline'); if (online) online.hidden = !item.online;
    var av = $('hshsThreadAvatar');
    if (av) {
      av.innerHTML = avatarHtml(item);
      av.classList.toggle('is-group', !!item.group);
    }
    var input = $('hshsThreadInput');
    if (input) { input.placeholder = 'Message ' + first(item.name) + '...'; input.value = ''; }
    var msgs = THREADS[threadId(item)] || [];
    if (msgs.length) paintMsgs(msgs, item, { forceScroll: true });
    else showWelcome(true);
    hideReactPop();
    closeEmoji();
    closeAttach();
    if (MODE === 'live' && g.HshsChatLive && g.HshsChatLive.watch) g.HshsChatLive.watch(threadId(item));
  }
  function appendMsg(msg) {
    if (!active) return;
    var id = threadId(active);
    if (!THREADS[id]) THREADS[id] = [];
    var list = THREADS[id];
    var last = list[list.length - 1];
    if (last && last.mine === msg.mine && last.sender === msg.sender && last.kind === msg.kind) msg.cont = true;
    list.push(msg);
    active.preview = (msg.sender && !msg.mine ? msg.sender + ': ' : '') + previewOf(msg);
    active.time = 'Now';
    active.read = !!msg.mine;
    persist();
    paintMsgs(list, active, { forceScroll: true });
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
  }
  function newClientId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function markFailed(clientId) {
    if (!clientId || !active) return;
    var list = THREADS[threadId(active)] || [];
    list.forEach(function (m) {
      if (m.clientId === clientId) { m.pending = false; m.failed = true; }
    });
    paintMsgs(list, active, { force: true });
  }
  function publishLive(text, extra) {
    extra = extra || {};
    if (MODE !== 'live' || !g.HshsChatLive || !g.HshsChatLive.publish) return Promise.resolve(null);
    extra.chatId = extra.chatId || threadId(active);
    extra.clientId = extra.clientId || newClientId();
    return Promise.resolve(g.HshsChatLive.publish(text, extra)).then(function (saved) {
      if (!saved) markFailed(extra.clientId);
      return saved;
    }).catch(function () {
      markFailed(extra.clientId);
      return null;
    });
  }
  function appendMine(text, extra) {
    extra = extra || {};
    if (!extra.clientId) extra.clientId = newClientId();
    if (MODE === 'live') extra.pending = extra.pending !== false;
    var msg = { mine: true, text: text, time: nowTime(), read: true };
    Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; });
    appendMsg(msg);
    if (MODE === 'live' && !extra.localOnly) publishLive(String(text || '').replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''), extra);
    else maybeReply();
  }
  function maybeReply() {
    if (MODE !== 'local') return;
    if (!active || active.group) return;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      if (!active || MODE !== 'local') return;
      showTyping();
      typingTimer = setTimeout(function () {
        hideTyping();
        if (!active || active.group || MODE !== 'local') return;
        appendMsg({ mine: false, text: 'Got it', time: nowTime() });
      }, 900);
    }, 380);
  }
  function sendText() {
    var input = $('hshsThreadInput');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    closeEmoji();
    closeAttach();
    appendMine(esc(text).replace(/\n/g, '<br>'));
    var btn = $('hshsSendBtn');
    if (btn) btn.classList.remove('is-ready');
  }
  function hideReactPop() {
    var pop = document.querySelector('.hshs-react-pop');
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
  }
  function showReact(idx, anchor) {
    hideReactPop();
    if (!active || idx < 0) return;
    var pop = document.createElement('div');
    pop.className = 'hshs-react-pop';
    pop.innerHTML = REACTS.map(function (r) {
      return '<button type="button" data-react="' + r + '">' + r + '</button>';
    }).join('');
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-react]');
      if (!b) return;
      addReact(idx, b.getAttribute('data-react'));
      hideReactPop();
    });
    anchor.appendChild(pop);
  }
  function addReact(idx, emo) {
    var id = threadId(active);
    var list = THREADS[id];
    if (!list || !list[idx]) return;
    var msg = list[idx];
    msg.reacts = msg.reacts || [];
    if (msg.reacts.indexOf(emo) === -1) msg.reacts.push(emo);
    persist();
    paintMsgs(list, active, { force: true });
    if (MODE === 'live' && g.HshsChatLive && g.HshsChatLive.react && msg.id) {
      g.HshsChatLive.react(msg.id, emo);
    }
  }
  function stopTracks() {
    if (rec.raf) cancelAnimationFrame(rec.raf);
    rec.raf = 0;
    if (rec.ctx && rec.ctx.close) try { rec.ctx.close(); } catch (e) {}
    rec.ctx = null;
    rec.analyser = null;
    if (rec.stream) rec.stream.getTracks().forEach(function (t) { t.stop(); });
    rec.stream = null;
    rec.media = null;
    rec.chunks = [];
    g.__hshsRecLevel = 0;
  }
  g.__hshsChatBeginRec = function () {
    rec.chunks = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      rec.stream = stream;
      try {
        rec.media = new MediaRecorder(stream);
        rec.media.ondataavailable = function (ev) { if (ev.data && ev.data.size) rec.chunks.push(ev.data); };
        rec.media.start();
      } catch (err) { rec.media = null; }
    }).catch(function () {});
  };
  g.__hshsChatEndRec = function (send, ms) {
    var finish = function (blob) {
      stopTracks();
      if (!send) return;
      var extra = { kind: 'voice', duration: fmtMs(ms), localOnly: MODE === 'live' };
      if (blob && blob.size) extra.src = URL.createObjectURL(blob);
      appendMine('Voice note', extra);
    };
    if (rec.media && rec.media.state !== 'inactive') {
      rec.media.onstop = function () {
        var type = (rec.chunks[0] && rec.chunks[0].type) || 'audio/webm';
        finish(rec.chunks.length ? new Blob(rec.chunks, { type: type }) : null);
      };
      try { rec.media.stop(); } catch (e) { finish(null); }
    } else finish(null);
  };
  function fmtSize(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1048576) return Math.round(n / 1024) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }
  function kindFromFile(f, force) {
    if (force) return force;
    var typ = (f && f.type) || '';
    if (typ.indexOf('image/') === 0) return 'photo';
    if (typ.indexOf('video/') === 0) return 'video';
    return 'file';
  }
  function ingestFile(f, forceKind) {
    if (!f || !active) return;
    var kind = kindFromFile(f, forceKind);
    var meta = fmtSize(f.size);
    var clientId = newClientId();
    var localUrl = '';
    try { localUrl = URL.createObjectURL(f); } catch (e) {}
    function push(src, flags) {
      flags = flags || {};
      var extra = { kind: kind, fileName: f.name, fileMeta: meta, clientId: clientId };
      if (src) extra.src = src;
      if (flags.localOnly) extra.localOnly = true;
      extra.mediaKey = flags.mediaKey || '';
      extra.mediaProvider = flags.mediaProvider || '';
      appendMine(esc(f.name), extra);
    }
    if (MODE !== 'live' || !g.HshsStorage || !g.HshsStorage.upload) {
      push(kind === 'file' ? '' : localUrl, { localOnly: true, mediaProvider: 'local' });
      return;
    }
    push(localUrl, { localOnly: true, mediaProvider: 'local' });
    toastSoon('Uploading...');
    Promise.resolve(g.HshsStorage.upload(f, { kind: kind === 'video' ? 'video' : 'photo' })).then(function (res) {
      var remote = res && res.url && /^https?:\/\//i.test(res.url) && res.provider === 'cloudflare-r2';
      if (!remote) { toastSoon('Attachment stays on this device'); return; }
      publishLive(f.name, { kind: kind, fileName: f.name, fileMeta: meta, src: res.url, mediaKey: res.key, mediaProvider: res.provider, clientId: clientId, chatId: threadId(active) });
    }).catch(function () { toastSoon('Attachment stays on this device'); });
  }
  function pickNamed(id) { var el = $(id); if (el) el.click(); }
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
    var plus = $('hshsPlusBtn');
    if (plus && !plus.dataset.bound) {
      plus.dataset.bound = '1';
      plus.onclick = function (e) { e.preventDefault(); toggleAttach(); };
    }
    var attachSheet = $('hshsAttachSheet');
    if (attachSheet && !attachSheet.dataset.bound) {
      attachSheet.dataset.bound = '1';
      attachSheet.addEventListener('click', function (e) {
        var b = e.target.closest('[data-attach]');
        if (!b) return;
        var mode = b.getAttribute('data-attach');
        closeAttach();
        if (mode === 'gallery') pickNamed('hshsAttachGallery');
        else if (mode === 'video') pickNamed('hshsAttachVideo');
        else if (mode === 'camera') pickNamed('hshsAttachCamera');
        else if (mode === 'record') pickNamed('hshsAttachRecVideo');
        else if (mode === 'document') pickNamed('hshsAttachDoc');
        else if (mode === 'pdf') pickNamed('hshsAttachPdf');
      });
    }
    var imageBtn = $('hshsImageBtn');
    if (imageBtn && !imageBtn.dataset.bound) {
      imageBtn.dataset.bound = '1';
      imageBtn.onclick = function () { closeAttach(); pickNamed('hshsAttachGallery'); };
    }
    [['hshsAttachInput', 'photo'], ['hshsAttachGallery', 'photo'], ['hshsAttachCamera', 'photo'], ['hshsAttachVideo', 'video'], ['hshsAttachRecVideo', 'video'], ['hshsAttachDoc', 'file'], ['hshsAttachPdf', 'file']].forEach(function (pair) {
      var inp = $(pair[0]);
      if (!inp || inp.dataset.bound) return;
      inp.dataset.bound = '1';
      inp.addEventListener('change', function () {
        if (!inp.files || !inp.files[0]) return;
        ingestFile(inp.files[0], pair[1]);
        inp.value = '';
      });
    });
    var hi = $('hshsSayHi');
    if (hi && !hi.dataset.bound) { hi.dataset.bound = '1'; hi.onclick = function () { appendMine('Hi'); }; }
    var msgs = $('hshsThreadMsgs');
    if (msgs && !msgs.dataset.reactBound) {
      msgs.dataset.reactBound = '1';
      msgs.addEventListener('pointerdown', function (e) {
        var row = e.target.closest('[data-mi]');
        if (!row) return;
        holdReact.idx = Number(row.getAttribute('data-mi'));
        clearTimeout(holdReact.timer);
        holdReact.timer = setTimeout(function () { showReact(holdReact.idx, row); }, 420);
      });
      msgs.addEventListener('pointerup', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('pointercancel', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('pointermove', function () { clearTimeout(holdReact.timer); });
    }
    function comingSoon(e) { e.preventDefault(); toastSoon('Coming soon'); }
    ['hshsCallBtn', 'hshsVideoBtn'].forEach(function (id) {
      var el = $(id);
      if (!el || el.dataset.bound) return;
      el.dataset.bound = '1';
      el.removeAttribute('disabled');
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', comingSoon);
    });
    function newChat() { if (INBOX[0]) openThread(INBOX[0]); }
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
      inp.dispatchEvent(new Event('input'));
    };
  }
  function boot() {
    if (!$('hshsChatPage')) return;
    hydrate();
    wire();
    setTimeout(wire, 200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  function setMode(next) {
    var prev = MODE;
    if (next === 'live') MODE = 'live';
    else if (next === 'connecting') MODE = 'connecting';
    else MODE = 'local';
    var page = $('hshsChatPage');
    if (page) {
      page.classList.toggle('is-live', MODE === 'live');
      page.classList.toggle('is-local', MODE !== 'live');
    }
    var hero = document.querySelector('.msg-hero-titles p');
    if (hero) {
      hero.textContent = MODE === 'live' ? 'Live campus chat' : (MODE === 'connecting' ? 'Connecting...' : 'On this device');
    }
    if (MODE === 'local' && prev !== 'local') {
      INBOX.length = 0;
      SEED_INBOX.forEach(function (c) { INBOX.push(Object.assign({}, c)); });
      Object.keys(THREADS).forEach(function (k) { delete THREADS[k]; });
      Object.keys(SEED_THREADS).forEach(function (k) {
        THREADS[k] = SEED_THREADS[k].map(function (m) { return Object.assign({}, m); });
      });
      hydrate();
      fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
    }
  }
  function setInbox(rows) {
    if (MODE === 'local') return;
    INBOX.length = 0;
    (rows || []).forEach(function (row) { INBOX.push(row); });
    if (active) {
      var next = INBOX.filter(function (c) { return c.id === active.id; })[0];
      if (next) {
        active = next;
        var meta = $('hshsThreadMeta');
        if (meta && !next.group) meta.textContent = next.presenceLabel || (next.online ? 'Online now' : 'Offline');
        var online = $('hshsThreadOnline');
        if (online) online.hidden = !next.online;
      }
    }
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
  }
  function applyRemoteThread(chatId, rows) {
    if (MODE === 'local' || !chatId) return;
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
        paintMsgs(merged, active, { forceScroll: !!(last && last.mine) });
      }
    }
  }
  function setPresenceMap(map) {
    PRESENCE = map || {};
    if (MODE === 'local') return;
    INBOX.forEach(function (c) {
      var uid = (g.hshsAuthUser && g.hshsAuthUser.uid) || '';
      var peer = (c.memberIds || []).filter(function (id) { return id && id !== uid; })[0] || c.peerId;
      var row = peer && PRESENCE[peer];
      if (!row) {
        if (MODE === 'live') { c.online = false; c.presenceLabel = c.presenceLabel || 'Offline'; }
        return;
      }
      var last = row.lastSeen;
      var ms = 0;
      if (last && typeof last.toMillis === 'function') ms = last.toMillis();
      else if (last && last.seconds) ms = last.seconds * 1000;
      else ms = Date.parse(last) || 0;
      var ago = Date.now() - ms;
      if (row.online && ago < 120000) { c.online = true; c.presenceLabel = 'Online now'; }
      else if (ago && ago < 15 * 60 * 1000) { c.online = false; c.presenceLabel = 'Active recently'; }
      else { c.online = false; c.presenceLabel = 'Offline'; }
    });
    if (active) {
      var cur = INBOX.filter(function (c) { return c.id === active.id; })[0];
      if (cur) {
        active.online = cur.online;
        active.presenceLabel = cur.presenceLabel;
        var meta = $('hshsThreadMeta');
        if (meta && !cur.group) meta.textContent = cur.presenceLabel || 'Offline';
        var online = $('hshsThreadOnline');
        if (online) online.hidden = !cur.online;
      }
    }
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
  }
  g.HshsMessagesUi = {
    boot: boot,
    openThread: openThread,
    showList: showList,
    appendMine: appendMine,
    ingestFile: ingestFile,
    openAttach: openAttach,
    closeAttach: closeAttach,
    setMode: setMode,
    setInbox: setInbox,
    applyRemoteThread: applyRemoteThread,
    setPresenceMap: setPresenceMap,
    activeId: function () { return active ? threadId(active) : ''; },
    mode: function () { return MODE; }
  };
})(typeof window !== 'undefined' ? window : this);
