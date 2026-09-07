(function (g) {
  'use strict';
  if (g.__hshsChatPacks) return;
  g.__hshsChatPacks = true;

  var CATS = [
    { id: 'recent', label: 'Recent', icon: '🕒' },
    { id: 'smileys', label: 'Smileys', icon: '😀' },
    { id: 'people', label: 'People', icon: '👋' },
    { id: 'love', label: 'Love', icon: '❤️' },
    { id: 'animals', label: 'Animals', icon: '🐻' },
    { id: 'food', label: 'Food', icon: '🍔' },
    { id: 'activities', label: 'Activities', icon: '⚽' },
    { id: 'objects', label: 'Objects', icon: '💡' },
    { id: 'flags', label: 'Flags', icon: '🇺🇬' }
  ];

  var DATA = {
    smileys: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 🥱 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🥴 😇 🥳 🥺 🤠 🤡 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 ☠️ 👻 👽 🤖 💩'.split(' '),
    people: '👋 🤚 🖐️ ✋ 🖖 👌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 🦷 🦴 👀 👁️ 👅 👄 👶 👧 🧒 👦 👩 🧑 👨 👵 👴 👲 👳 👮 👷 💂 🕵️ 👩‍⚕️ 👨‍🎓 👨‍🏫 👨‍🎨 👨‍🍳 👨‍👩‍👧 👪 💏 💑'.split(' '),
    love: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤'.split(' '),
    animals: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦟 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊'.split(' '),
    food: '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍦 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍮 🍯'.split(' '),
    activities: '⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🥅 ⛳ 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚴 🚵 🎪 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩'.split(' '),
    objects: '⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💾 💿 📀 📷 📹 🎥 📞 ☎️ 📺 📻 🧭 ⏱️ ⏰ ⌛ 📡 🔋 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 💰 💳 💎 ⚖️ 🧰 🔧 🔨 ⚒️ 🛠️ ⛏️ 🔩 ⚙️ 🧱 🔫 💣 🔪 🗡️ 🛡️ 🚬 ⚰️ ⚱️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴'.split(' '),
    flags: '🇺🇬 🇰🇪 🇹🇿 🇷🇼 🇨🇩 🇸🇸 🇳🇬 🇬🇭 🇿🇦 🇺🇸 🇬🇧 🇨🇦 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇨🇳 🇯🇵 🇰🇷 🇮🇳 🇧🇷 🇦🇺 🇳🇿 🇪🇺 🇺🇳 🏳️ 🏴 🏁 🚩 🏳️‍🌈 🏳️‍⚧️'.split(' ')
  };

  var recent = [];
  try { recent = JSON.parse(localStorage.getItem('hshsEmojiRecent') || '[]'); } catch (e) { recent = []; }
  if (!Array.isArray(recent)) recent = [];
  var activeCat = 'recent';

  function $(id) { return document.getElementById(id); }

  function saveRecent(emo) {
    recent = [emo].concat(recent.filter(function (x) { return x !== emo; })).slice(0, 24);
    try { localStorage.setItem('hshsEmojiRecent', JSON.stringify(recent)); } catch (e) {}
  }

  function pick(emo) {
    if (!emo) return;
    saveRecent(emo);
    if (g.__hshsInsertEmoji) g.__hshsInsertEmoji(emo);
  }

  function renderTabs() {
    var tabs = $('hshsEmojiTabs');
    if (!tabs) return;
    tabs.innerHTML = CATS.map(function (c) {
      return '<button type="button" data-cat="' + c.id + '" class="' + (c.id === activeCat ? 'on' : '') + '">' + c.label + '</button>';
    }).join('');
  }

  function renderDock() {
    var dock = $('hshsEmojiDock');
    if (!dock) return;
    dock.innerHTML =
      '<button type="button" data-dock="abc" title="Keyboard">ABC</button>' +
      CATS.map(function (c) {
        return '<button type="button" data-dock="' + c.id + '" title="' + c.label + '">' + c.icon + '</button>';
      }).join('') +
      '<button type="button" data-dock="back" title="Backspace"><i class="fas fa-delete-left"></i></button>';
  }

  function listFor(cat, q) {
    q = String(q || '').trim();
    var list;
    if (cat === 'recent') list = recent.length ? recent.slice() : DATA.smileys.slice(0, 16);
    else list = (DATA[cat] || DATA.smileys).slice();
    if (q) {
      list = list.filter(function (e) { return e.indexOf(q) !== -1; });
      if (!list.length) {
        var all = [];
        Object.keys(DATA).forEach(function (k) { all = all.concat(DATA[k]); });
        list = all.filter(function (e) { return e.indexOf(q) !== -1; }).slice(0, 64);
      }
    }
    return list;
  }

  function renderBody() {
    var body = $('hshsEmojiBody');
    if (!body) return;
    var q = ($('hshsEmojiSearch') && $('hshsEmojiSearch').value) || '';
    var list = listFor(activeCat, q);
    var title = activeCat === 'recent' ? 'Recently Used' : ((CATS.find(function (c) { return c.id === activeCat; }) || {}).label || 'Emoji');
    body.innerHTML = '<h4>' + title + '</h4><div class="msg-emoji-grid">' +
      list.map(function (e) {
        return '<button type="button" class="msg-emoji-item" data-emo="' + e + '">' + e + '</button>';
      }).join('') + '</div>';
  }

  function setCat(id) {
    activeCat = id || 'smileys';
    renderTabs();
    renderBody();
  }

  function open() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) sheet.hidden = false;
    renderTabs();
    renderDock();
    renderBody();
  }
  function close() {
    var sheet = $('hshsEmojiSheet');
    if (sheet) sheet.hidden = true;
  }

  function wire() {
    var tabs = $('hshsEmojiTabs');
    if (tabs && !tabs.dataset.bound) {
      tabs.dataset.bound = '1';
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (!b) return;
        setCat(b.getAttribute('data-cat'));
      });
    }
    var body = $('hshsEmojiBody');
    if (body && !body.dataset.bound) {
      body.dataset.bound = '1';
      body.addEventListener('click', function (e) {
        var b = e.target.closest('[data-emo]');
        if (!b) return;
        pick(b.getAttribute('data-emo'));
      });
    }
    var dock = $('hshsEmojiDock');
    if (dock && !dock.dataset.bound) {
      dock.dataset.bound = '1';
      dock.addEventListener('click', function (e) {
        var b = e.target.closest('[data-dock]');
        if (!b) return;
        var id = b.getAttribute('data-dock');
        if (id === 'abc') { close(); var inp = $('hshsThreadInput'); if (inp) inp.focus(); return; }
        if (id === 'back') {
          var inp = $('hshsThreadInput');
          if (!inp) return;
          inp.value = inp.value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]$|.$/, '');
          inp.dispatchEvent(new Event('input'));
          return;
        }
        setCat(id);
      });
    }
    var search = $('hshsEmojiSearch');
    if (search && !search.dataset.bound) {
      search.dataset.bound = '1';
      search.addEventListener('input', function () { renderBody(); });
    }
  }

  function boot() {
    if (!$('hshsChatPage')) return;
    wire();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
  g.HshsChatPacks = { boot: boot, open: open, close: close, pick: pick };
})(typeof window !== 'undefined' ? window : this);
