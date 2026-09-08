(function (g) {
  'use strict';
  if (g.__hshsMessagesUi) return;
  g.__hshsMessagesUi = true;

  var STORE_KEY = 'hshsWorldChat_v1';
  var REACTS = ['👍', '❤️', '😂', '😮'];
  var AV = function (seed) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=1e3a5f';
  };

  var INBOX = [
    { id: 'daniel', name: 'Daniel Okello', user: 'daniel_ok', preview: 'Hey! How are you doing? 😊', time: '10:24 AM', unread: 1, online: true, avatar: AV('DanielOkello') },
    { id: 'aisha', name: 'Aisha Nakitende', user: 'aisha_n', preview: "Thanks! I'll check it out.", time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('AishaN') },
    { id: 'brian', name: 'Brian Kato', user: 'brian_k', preview: 'See you tomorrow bro 💪', time: 'Yesterday', unread: 0, read: true, online: true, avatar: AV('BrianKato') },
    { id: 'faith', name: 'Faith Namulondo', user: 'faith_n', preview: "That's awesome! ✨", time: 'Mon', unread: 0, read: true, online: true, avatar: AV('FaithN') },
    { id: 'joseph', name: 'Joseph Ssemmanda', user: 'joseph_s', preview: 'Alright, got it.', time: 'Sun', unread: 0, read: true, online: true, avatar: AV('JosephS') },
    { id: 'gloria', name: 'Gloria Nankinga', user: 'gloria_n', preview: "Let's catch up soon.", time: 'Sat', unread: 0, read: true, online: false, avatar: AV('GloriaN') },
    { id: 'mercy', name: 'Mercy Atim', user: 'mercy', preview: 'See you at assembly tomorrow', time: 'Fri', unread: 2, online: true, avatar: AV('MercyAtim') },
    { id: 'maya', name: 'Maya Okello', user: 'maya_lens', preview: 'New campus shots 📸', time: 'Thu', unread: 0, read: true, online: false, avatar: AV('MayaLens') },
    { id: 'joel', name: 'Joel Wambede', user: 'joel_pref', preview: 'Assembly at 8 sharp 📋', time: 'Wed', unread: 1, online: true, avatar: AV('JoelPref') },
    { id: 'class4a', name: 'Class 4A', user: 'class4a', preview: 'Ivan: Maths homework is in the group', time: 'Tue', unread: 5, group: true, members: ['Ivan', 'Aisha', 'Brian', 'Faith', 'Mercy'], online: false, avatar: AV('Class4A') }
  ];

  var THREADS = {
    daniel: [
      { mine: false, text: 'Hey! How are you doing? 😊', time: '10:22 AM' },
      { mine: false, text: 'You free after class?', time: '10:23 AM', cont: true }
    ],
    aisha: [
      { mine: true, text: 'I dropped the new gallery layout.', time: 'Yesterday', read: true },
      { mine: false, text: "Thanks! I'll check it out.", time: 'Yesterday' }
    ],
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
      { mine: true, text: 'See you tomorrow bro 💪', time: '3:49 PM', read: true }
    ],
    faith: [
      { mine: true, text: 'The science fair stand is ready.', time: 'Mon', read: true },
      { mine: false, text: "That's awesome! ✨", time: 'Mon' }
    ],
    joseph: [
      { mine: true, text: 'Can you print the house list?', time: 'Sun', read: true },
      { mine: false, text: 'Alright, got it.', time: 'Sun' }
    ],
    gloria: [
      { mine: false, text: 'Missed you at choir practice.', time: 'Sat' },
      { mine: true, text: "Let's catch up soon.", time: 'Sat', read: true }
    ],
    mercy: [
      { mine: false, text: 'Prefect briefing after lunch.', time: 'Fri' },
      { mine: false, text: 'See you at assembly tomorrow', time: 'Fri', cont: true }
    ],
    maya: [
      { mine: false, text: 'Shot the quad at golden hour.', time: 'Thu' },
      { mine: false, text: 'New campus shots 📸', time: 'Thu', cont: true }
    ],
    joel: [
      { mine: false, text: 'House points go up tonight.', time: 'Wed' },
      { mine: false, text: 'Assembly at 8 sharp 📋', time: 'Wed', cont: true }
    ],
    class4a: [
      { mine: false, sender: 'Ivan', text: 'Maths homework is in the group', time: 'Tue' },
      { mine: false, sender: 'Aisha', text: 'Page 42 and 43 only.', time: 'Tue' },
      { mine: true, text: 'Noted. I will scan my working.', time: 'Tue', read: true },
      { mine: false, sender: 'Brian', text: 'Who is bringing the chart paper?', time: 'Tue' }
    ]
  };

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
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    if (msg.kind === 'photo') return '📷 Photo';
    if (msg.kind === 'voice') return '🎤 Voice note · ' + (msg.duration || '0:01');
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
    var payload = { inbox: INBOX, threads: THREADS };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(payload)); } catch (e) {}
    try {
      if (g.HshsStore && typeof g.HshsStore.getState === 'function') {
        var st = g.HshsStore.getState();
        if (st) {
          st.chats = payload;
          if (typeof g.HshsStore.save === 'function') g.HshsStore.save(st);
          else localStorage.setItem('hshsWorldStore_v2', JSON.stringify(st));
        }
      }
    } catch (e2) {}
  }

  function hydrate() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved || !saved.threads) {
      try {
        if (g.HshsStore && g.HshsStore.getState) {
          var st = g.HshsStore.getState();
          if (st && st.chats && st.chats.threads) saved = st.chats;
        }
      } catch (e2) {}
    }
    if (!saved || !saved.threads) return;
    Object.keys(saved.threads).forEach(function (id) {
      if (Array.isArray(saved.threads[id]) && saved.threads[id].length) THREADS[id] = saved.threads[id];
    });
    if (Array.isArray(saved.inbox)) {
      saved.inbox.forEach(function (row) {
        var cur = INBOX.find(function (c) { return c.id === row.id; });
        if (!cur) return;
        if (row.preview) cur.preview = row.preview;
        if (row.time) cur.time = row.time;
        if (typeof row.unread === 'number') cur.unread = row.unread;
        if (row.read) cur.read = true;
      });
    }
  }

  function fillInbox(q) {
    var box = $('hshsChatList');
    if (!box) return;
    var banner = $('hshsChatBanner');
    if (banner) { banner.hidden = true; banner.setAttribute('aria-hidden', 'true'); }
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
      var tag = c.group ? '<em class="msg-group-tag">Group</em>' : '';
      return '<button type="button" class="msg-row' + (c.unread ? ' is-hot' : '') + (c.group ? ' is-group' : '') + '" data-demo="' + idx + '">' +
        '<span class="msg-row-av">' + avatarHtml(c) + online + '</span>' +
        '<span class="msg-row-body"><strong>' + esc(c.name) + tag + '</strong><small>' + esc(c.preview) + '</small></span>' +
        '<span class="msg-row-meta"><time>' + esc(c.time) + '</time>' + metaRight + '</span></button>';
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
    hideReactPop();
    closeEmoji();
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

  function paintMsgs(messages, item) {
    var box = $('hshsThreadMsgs');
    if (!box) return;
    showWelcome(false);
    var avLabel = initials(item && item.name);
    var html = '<div class="hshs-date-chip">Today</div>';
    html += messages.map(function (m, i) {
      var av = (!m.mine && !m.cont)
        ? '<span class="hshs-bubble-av">' + (item && item.avatar ? '<img src="' + item.avatar + '" alt="">' : avLabel) + '</span>'
        : '';
      var ticks = m.mine ? '<span class="hshs-ticks' + (m.read ? ' read' : '') + '">✓✓</span>' : '';
      var sender = (!m.mine && item && item.group && m.sender && !m.cont) ? '<span class="hshs-sender">' + esc(m.sender) + '</span>' : '';
      var body;
      if (m.kind === 'photo' && m.src) {
        body = '<div class="hshs-bubble-media"><img src="' + m.src + '" alt="Photo"><div class="hshs-bubble-text">' + esc(m.text || 'Photo') + '</div></div>';
      } else if (m.kind === 'voice') {
        body = '<div class="hshs-bubble-voice">🎤 Voice note · ' + esc(m.duration || '0:01') + '</div>';
        if (m.src) body += '<audio controls preload="none" src="' + m.src + '"></audio>';
      } else {
        body = '<div class="hshs-bubble-text">' + String(m.text || '').replace(/\n/g, '<br>') + '</div>';
      }
      return '<div class="hshs-row ' + (m.mine ? 'mine' : 'theirs') + (m.cont ? ' cont' : '') + '" data-mi="' + i + '">' + av +
        '<div class="hshs-bubble ' + (m.mine ? 'mine' : 'theirs') + '">' + sender + body +
        reactHtml(m) + '<time>' + esc(m.time) + ticks + '</time></div></div>';
    }).join('');
    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
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
    if (meta) meta.textContent = item.group ? ((item.members && item.members.length) ? item.members.length + ' members' : 'Class group') : (item.online ? 'Online now' : 'Last seen recently');
    var online = $('hshsThreadOnline'); if (online) online.hidden = !item.online;
    var av = $('hshsThreadAvatar');
    if (av) {
      av.innerHTML = avatarHtml(item);
      av.classList.toggle('is-group', !!item.group);
    }
    var input = $('hshsThreadInput');
    if (input) { input.placeholder = 'Message ' + first(item.name) + '...'; input.value = ''; }
    var wAv = $('hshsWelcomeAv'); if (wAv) wAv.textContent = initials(item.name);
    var wTitle = $('hshsWelcomeTitle'); if (wTitle) wTitle.textContent = 'Say hi to ' + first(item.name) + ' 👋';
    var msgs = THREADS[threadId(item)] || [];
    if (msgs.length) paintMsgs(msgs, item);
    else showWelcome(true);
    hideReactPop();
    closeEmoji();
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
    paintMsgs(list, active);
    fillInbox($('hshsChatSearch') && $('hshsChatSearch').value);
  }

  function appendMine(text, extra) {
    var msg = { mine: true, text: text, time: nowTime(), read: true };
    if (extra) {
      Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; });
    }
    appendMsg(msg);
    maybeReply();
  }

  function maybeReply() {
    if (!active || active.group) return;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      if (!active) return;
      showTyping();
      typingTimer = setTimeout(function () {
        hideTyping();
        if (!active || active.group) return;
        appendMsg({ mine: false, text: 'Got it 👍', time: nowTime() });
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
    paintMsgs(list, active);
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

  function pulseAnalyser() {
    if (!rec.analyser) return;
    var data = new Uint8Array(rec.analyser.fftSize);
    rec.analyser.getByteTimeDomainData(data);
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      var v = (data[i] - 128) / 128;
      sum += v * v;
    }
    g.__hshsRecLevel = Math.min(1, 0.18 + Math.sqrt(sum / data.length) * 4);
    rec.raf = requestAnimationFrame(pulseAnalyser);
  }

  g.__hshsChatBeginRec = function () {
    rec.chunks = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      rec.stream = stream;
      try {
        rec.ctx = new (g.AudioContext || g.webkitAudioContext)();
        var src = rec.ctx.createMediaStreamSource(stream);
        rec.analyser = rec.ctx.createAnalyser();
        rec.analyser.fftSize = 256;
        src.connect(rec.analyser);
        pulseAnalyser();
      } catch (e) {}
      var mime = '';
      if (g.MediaRecorder) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) mime = 'audio/webm';
      }
      try {
        rec.media = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        rec.media.ondataavailable = function (ev) { if (ev.data && ev.data.size) rec.chunks.push(ev.data); };
        rec.media.start();
      } catch (err) {
        rec.media = null;
      }
    }).catch(function () {});
  };

  g.__hshsChatEndRec = function (send, ms) {
    var finish = function (blob) {
      stopTracks();
      if (!send) return;
      var extra = { kind: 'voice', duration: fmtMs(ms) };
      if (blob && blob.size) extra.src = URL.createObjectURL(blob);
      appendMine('🎤 Voice note · ' + extra.duration, extra);
    };
    if (rec.media && rec.media.state !== 'inactive') {
      rec.media.onstop = function () {
        var type = (rec.chunks[0] && rec.chunks[0].type) || 'audio/webm';
        finish(rec.chunks.length ? new Blob(rec.chunks, { type: type }) : null);
      };
      try { rec.media.stop(); } catch (e) { finish(null); }
    } else {
      finish(null);
    }
  };

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
        var f = file.files[0];
        var reader = new FileReader();
        reader.onload = function () {
          appendMine(esc(f.name), { kind: 'photo', src: reader.result });
        };
        reader.readAsDataURL(f);
        file.value = '';
      });
    }
    var hi = $('hshsSayHi');
    if (hi && !hi.dataset.bound) { hi.dataset.bound = '1'; hi.onclick = function () { appendMine('Hi 👋'); }; }

    var msgs = $('hshsThreadMsgs');
    if (msgs && !msgs.dataset.reactBound) {
      msgs.dataset.reactBound = '1';
      msgs.addEventListener('pointerdown', function (e) {
        var row = e.target.closest('[data-mi]');
        if (!row) return;
        holdReact.idx = Number(row.getAttribute('data-mi'));
        clearTimeout(holdReact.timer);
        holdReact.timer = setTimeout(function () {
          showReact(holdReact.idx, row);
        }, 420);
      });
      msgs.addEventListener('pointerup', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('pointercancel', function () { clearTimeout(holdReact.timer); });
      msgs.addEventListener('pointermove', function () { clearTimeout(holdReact.timer); });
    }

    function comingSoon(e) {
      e.preventDefault();
      toastSoon('Coming soon');
    }
    ['hshsCallBtn', 'hshsVideoBtn'].forEach(function (id) {
      var el = $(id);
      if (!el || el.dataset.bound) return;
      el.dataset.bound = '1';
      el.removeAttribute('disabled');
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', comingSoon);
    });

    function newChat() {
      var firstOpen = INBOX[0];
      if (firstOpen) openThread(firstOpen);
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
    hydrate();
    wire();
    setTimeout(wire, 200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsMessagesUi = { boot: boot, openThread: openThread, showList: showList };
})(typeof window !== 'undefined' ? window : this);
