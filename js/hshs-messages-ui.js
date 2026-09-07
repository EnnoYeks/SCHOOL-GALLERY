(function (g) {
  'use strict';
  if (g.__hshsMessagesUi) return;
  g.__hshsMessagesUi = true;

  var NOTES = [
    { add: true, label: 'Note' },
    { label: 'Mercy', caption: 'Assembly fit check' },
    { label: 'Class 4A', caption: 'Group study after class' },
    { label: 'Prefects', caption: 'Duty roster pinned' },
    { label: 'Teachers', caption: 'Office hours today' },
    { label: 'Sports', caption: 'Match day energy' }
  ];

  var INBOX = [
    { id: 'brian', name: 'Brian Kato', user: 'brian_k', preview: 'For sure bro 👊', time: '3:48 PM', unread: 0, group: false, empty: false, online: true, sample: 'brian' },
    { id: 'mercy', name: 'Mercy', user: 'mercy', preview: 'See you at assembly tomorrow', time: '4:12 PM', unread: 1, group: false, empty: true, online: true },
    { id: 'maya', name: 'Maya Okello', user: 'maya_lens', preview: 'New campus shots 📸', time: '11:25 AM', unread: 0, group: false, empty: true, online: false },
    { id: 'joel', name: 'Joel Wambede', user: 'joel_pref', preview: 'Assembly at 8 sharp 📋', time: '11:39 AM', unread: 2, group: false, empty: true, online: true },
    { id: 'class4a', name: 'Class 4A', user: 'class4a', preview: 'Ivan: Maths homework is in the group', time: '3:48 PM', unread: 5, group: true, empty: true },
    { id: 'updates', name: 'HSHS Updates', user: 'updates', preview: 'New Sports Day photos are up', time: '2:30 PM', unread: 2, group: true, empty: true },
    { id: 'prefects', name: 'Prefects 2026', user: 'prefects', preview: 'Discipline · Service · Leadership', time: '12:03 PM', unread: 0, group: true, empty: true },
    { id: 'sports', name: 'Sports Club', user: 'hshs_sports', preview: 'Match day vibes ⚽', time: '10:12 AM', unread: 5, group: true, empty: true }
  ];

  var SAMPLE_BRIAN = [
    { mine: false, text: 'Hey bro 👋', time: '3:42 PM' },
    { mine: false, text: 'How are you doing?', time: '3:42 PM', cont: true },
    { mine: true, text: 'Heyy 👋', time: '3:43 PM', read: true },
    { mine: true, text: "I'm good man, just chilling", time: '3:43 PM', read: true, cont: true },
    { mine: false, text: 'Nicee<br>Any new updates on the gallery project?', time: '3:44 PM' },
    { mine: true, text: "Yeah! Working on the new design<br>It's looking really dope 🔥", time: '3:45 PM', read: true },
    { mine: false, text: "Can't wait to see it<br>You always cook 🔥", time: '3:46 PM' },
    { mine: true, text: "Appreciate that 🙌<br>I'll share a preview soon", time: '3:47 PM', read: true },
    { mine: false, text: 'Bet!<br>Keep going 💯', time: '3:48 PM' },
    { mine: true, text: 'For sure bro 👊', time: '3:48 PM', read: true }
  ];

  function initials(name) {
    return String(name || '?').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function first(name) { return String(name || 'there').split(' ')[0]; }
  function hideNoise() {
    var b = document.getElementById('hshsChatBanner');
    if (b) { b.hidden = true; b.textContent = ''; }
  }
  function paintNotes() {
    var box = document.getElementById('hshsChatNotes');
    if (!box) return;
    box.innerHTML = NOTES.map(function (n) {
      var mark = n.add ? '+' : initials(n.label);
      return '<button class="msg-note" type="button" data-note="' + n.label + '"><b>' + mark + '</b><span>' + n.label + '</span></button>';
    }).join('');
  }
  function ticks(read) {
    return '<span class="hshs-ticks' + (read ? ' read' : '') + '">✓✓</span>';
  }
  function showWelcome(on, name) {
    var w = document.getElementById('hshsThreadWelcome');
    var box = document.getElementById('hshsThreadMsgs');
    if (w) {
      w.hidden = !on;
      var h2 = w.querySelector('h2');
      if (h2 && name) h2.textContent = 'Say hi to ' + first(name);
    }
    if (box) box.hidden = !!on;
  }
  function paintSample(messages, avLabel) {
    var box = document.getElementById('hshsThreadMsgs');
    if (!box) return;
    showWelcome(false);
    box.innerHTML = '<div class="hshs-date-chip">Today</div>' + messages.map(function (m) {
      var av = (!m.mine && !m.cont) ? '<span class="hshs-bubble-av">' + (avLabel || 'BK') + '</span>' : '';
      return '<div class="hshs-row ' + (m.mine ? 'mine' : 'theirs') + (m.cont ? ' cont' : '') + '">' + av +
        '<div class="hshs-bubble ' + (m.mine ? 'mine' : 'theirs') + '"><div class="hshs-bubble-text">' + m.text + '</div><time>' + m.time + (m.mine ? ticks(m.read) : '') + '</time></div></div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }
  function fillHead(item) {
    var nm = document.getElementById('hshsThreadName');
    if (nm) nm.textContent = item.name;
    var handle = document.getElementById('hshsThreadHandle');
    if (handle) handle.textContent = '@' + (item.user || first(item.name).toLowerCase());
    var meta = document.getElementById('hshsThreadMeta');
    if (meta) meta.textContent = item.online ? 'Online now' : (item.group ? 'Group chat' : 'Campus');
    var av = document.getElementById('hshsThreadAvatar');
    if (av) av.textContent = initials(item.name);
    var input = document.getElementById('hshsThreadInput');
    if (input) input.placeholder = 'Message ' + first(item.name) + '...';
  }
  function openDemo(item) {
    var page = document.getElementById('hshsChatPage');
    if (page) page.classList.add('is-open');
    var empty = document.getElementById('hshsChatEmptyMain');
    if (empty) empty.hidden = true;
    var thread = document.getElementById('hshsThread');
    if (thread) thread.hidden = false;
    fillHead(item);
    hideNoise();
    if (item.sample === 'brian' && !item.empty) paintSample(SAMPLE_BRIAN, 'BK');
    else showWelcome(true, item.name);
  }
  function fillInbox(filterText) {
    var box = document.getElementById('hshsChatList');
    if (!box) return;
    var q = String(filterText || '').toLowerCase().trim();
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
      var online = c.online ? '<i class="msg-online"></i>' : '';
      return '<button type="button" class="hshs-contact" data-demo="' + idx + '" data-group="' + c.group + '" data-unread="' + (c.unread || 0) + '">' +
        '<span class="hshs-contact-avatar">' + online + initials(c.name) + '</span>' +
        '<span class="hshs-contact-body"><strong>' + c.name + '</strong><small>' + c.preview + '</small></span>' +
        '<span class="hshs-contact-meta"><span class="time' + (c.unread ? ' unread' : '') + '">' + c.time + '</span>' +
        (c.unread ? '<span class="hshs-badge">' + c.unread + '</span>' : '') + '</span></button>';
    }).join('');
  }
  function filterList(kind) {
    document.querySelectorAll('#hshsChatList .hshs-contact').forEach(function (row) {
      var unread = Number(row.getAttribute('data-unread') || 0) > 0;
      var group = row.getAttribute('data-group') === 'true';
      row.style.display = (kind === 'all' || (kind === 'unread' && unread) || (kind === 'groups' && group)) ? 'flex' : 'none';
    });
  }
  function sendHi() {
    var input = document.getElementById('hshsThreadInput');
    var form = document.getElementById('hshsThreadForm');
    if (input) input.value = 'Hi 👋';
    if (form) {
      if (form.requestSubmit) form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
    showWelcome(false);
  }
  function wireWelcome() {
    var hi = document.getElementById('hshsSayHi');
    if (hi && !hi.dataset.bound) { hi.dataset.bound = '1'; hi.onclick = sendHi; }
    function pick() {
      var f = document.getElementById('hshsAttachInput');
      if (f) f.click();
    }
    var photo = document.getElementById('hshsSharePhoto');
    var plus = document.getElementById('hshsPlusBtn');
    if (photo && !photo.dataset.bound) { photo.dataset.bound = '1'; photo.onclick = pick; }
    if (plus && !plus.dataset.bound) { plus.dataset.bound = '1'; plus.onclick = pick; }
  }
  function wire() {
    if (!document.getElementById('hshsChatPage')) return;
    hideNoise();
    paintNotes();
    fillInbox();
    wireWelcome();
    var chips = document.getElementById('hshsChatChips');
    if (chips && !chips.dataset.bound) {
      chips.dataset.bound = '1';
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-chip]');
        if (!b) return;
        chips.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        filterList(b.getAttribute('data-chip'));
      });
    }
    var list = document.getElementById('hshsChatList');
    if (list && !list.dataset.bound) {
      list.dataset.bound = '1';
      list.addEventListener('click', function (e) {
        var row = e.target.closest('[data-demo]');
        if (!row) return;
        e.preventDefault();
        e.stopPropagation();
        openDemo(INBOX[Number(row.getAttribute('data-demo'))]);
      }, true);
    }
    var search = document.getElementById('hshsChatSearch');
    if (search && !search.dataset.bound) {
      search.dataset.bound = '1';
      search.addEventListener('input', function () {
        fillInbox(search.value);
        var on = document.querySelector('#hshsChatChips button.on');
        if (on) filterList(on.getAttribute('data-chip') || 'all');
      });
    }
    var notes = document.getElementById('hshsChatNotes');
    if (notes && !notes.dataset.bound) {
      notes.dataset.bound = '1';
      notes.addEventListener('click', function (e) {
        var btn = e.target.closest('.msg-note');
        if (!btn) return;
        var label = btn.getAttribute('data-note') || '';
        if (label === 'Note' || !label) return;
        var match = INBOX.find(function (c) {
          return c.name.indexOf(label) === 0 || label.indexOf(c.name.split(' ')[0]) === 0;
        });
        if (match) openDemo(match);
      });
    }
  }
  function boot() {
    if (!document.getElementById('hshsChatPage')) return;
    wire();
    setTimeout(wire, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsMessagesUi = { boot: boot };
})(typeof window !== 'undefined' ? window : this);
