import { db } from "./db.js";

(function (g) {
  "use strict";
  if (g.__hshsChatLive) return;
  g.__hshsChatLive = true;

  var STORE_KEY = "hshsWorldChat_v1";
  var SEED = [
    { id: "daniel", name: "Daniel Okello", user: "daniel_ok", preview: "Hey! How are you doing?", group: false },
    { id: "aisha", name: "Aisha Nakitende", user: "aisha_n", preview: "Thanks! I'll check it out.", group: false },
    { id: "brian", name: "Brian Kato", user: "brian_k", preview: "See you tomorrow bro", group: false },
    { id: "faith", name: "Faith Namulondo", user: "faith_n", preview: "That's awesome!", group: false },
    { id: "joseph", name: "Joseph Ssemmanda", user: "joseph_s", preview: "Alright, got it.", group: false },
    { id: "gloria", name: "Gloria Nankinga", user: "gloria_n", preview: "Let's catch up soon.", group: false },
    { id: "mercy", name: "Mercy Atim", user: "mercy", preview: "See you at assembly tomorrow", group: false },
    { id: "maya", name: "Maya Okello", user: "maya_lens", preview: "New campus shots", group: false },
    { id: "joel", name: "Joel Wambede", user: "joel_pref", preview: "Assembly at 8 sharp", group: false },
    { id: "class4a", name: "Class 4A", user: "class4a", preview: "Maths homework is in the group", group: true, members: ["Ivan", "Aisha", "Brian", "Faith", "Mercy"] }
  ];

  var state = { ready: false, uid: "", name: "Campus student", active: null, unsub: null, seen: {}, live: false };

  function $(id) { return document.getElementById(id); }

  function me() {
    try {
      if (g.HshsStore && g.HshsStore.currentUser) {
        var u = g.HshsStore.currentUser();
        if (u && u.name) return String(u.name);
      }
    } catch (e) {}
    return "Campus student";
  }

  function uid() {
    if (g.auth && g.auth.currentUser) return g.auth.currentUser.uid;
    if (g.hshsUid) return g.hshsUid;
    var id = localStorage.getItem("guestId");
    if (!id) {
      id = "guest-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("guestId", id);
    }
    return id;
  }

  function toast(msg) {
    var el = $("hshsChatToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "hshsChatToast";
      el.className = "hshs-chat-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("is-on"); }, 1600);
  }

  function markLive(on) {
    state.live = !!on;
    var page = $("hshsChatPage");
    if (page) page.classList.toggle("is-live", state.live);
    var hero = document.querySelector(".msg-hero-titles p");
    if (hero && on) hero.textContent = "Live campus chat";
  }

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null") || { inbox: [], threads: {} }; }
    catch (e) { return { inbox: [], threads: {} }; }
  }

  function writeStore(payload) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(payload)); } catch (e) {}
  }

  function activeId() {
    if (state.active) return state.active;
    var handle = $("hshsThreadHandle");
    var name = $("hshsThreadName");
    var key = ((handle && handle.textContent) || (name && name.textContent) || "").toLowerCase();
    for (var i = 0; i < SEED.length; i++) {
      var row = SEED[i];
      if (key.indexOf(row.user) !== -1 || key.indexOf(row.name.toLowerCase()) !== -1) return row.id;
    }
    var open = $("hshsChatPage");
    return open && open.classList.contains("is-open") ? "daniel" : null;
  }

  function toLocalMsg(row) {
    var mine = row.senderId && row.senderId === state.uid;
    return {
      mine: !!mine,
      text: row.text || "",
      time: "Now",
      kind: row.kind && row.kind !== "text" ? row.kind : undefined,
      fileName: row.fileName || "",
      fileMeta: row.fileMeta || "",
      sender: mine ? undefined : (row.senderName || "Friend")
    };
  }

  function applyThread(chatId, rows) {
    var store = readStore();
    store.threads = store.threads || {};
    store.threads[chatId] = rows.map(toLocalMsg);
    var last = rows[rows.length - 1];
    if (last) {
      store.inbox = store.inbox || [];
      var hit = store.inbox.filter(function (r) { return r.id === chatId; })[0];
      if (hit) {
        hit.preview = last.kind && last.kind !== "text" ? last.kind : String(last.text || "").slice(0, 48);
        hit.time = "Now";
      }
    }
    writeStore(store);
    if (activeId() === chatId) paintRemote(chatId, rows);
  }

  function paintRemote(chatId, rows) {
    var box = $("hshsThreadMsgs");
    if (!box || !$("hshsThread") || $("hshsThread").hidden) return;
    var last = rows[rows.length - 1];
    if (!last || last.senderId === state.uid) return;
    if (state.seen[last.id]) return;
    state.seen[last.id] = 1;
    var welcome = $("hshsThreadWelcome");
    if (welcome) welcome.hidden = true;
    box.hidden = false;
    var msg = toLocalMsg(last);
    var inner = msg.kind === "file"
      ? '<div class="hshs-file-chip"><i class="fas fa-file-lines"></i><span><b>' + (msg.fileName || "Document") + "</b><small>" + (msg.fileMeta || "File") + "</small></span></div>"
      : '<div class="hshs-bubble-text">' + String(msg.text || "").replace(/</g, "&lt;") + "</div>";
    var sender = msg.sender ? '<span class="hshs-sender">' + msg.sender + "</span>" : "";
    var row = document.createElement("div");
    row.className = "hshs-row theirs";
    row.innerHTML = '<div class="hshs-bubble theirs">' + sender + inner + "<time>Now</time></div>";
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  async function seedIfNeeded() {
    var existing = await db.listChats();
    if (existing && existing.length) return existing;
    for (var i = 0; i < SEED.length; i++) {
      var row = SEED[i];
      await db.upsertChat(row.id, {
        name: row.name,
        user: row.user,
        preview: row.preview,
        group: !!row.group,
        members: row.members || [],
        campus: true
      });
    }
    return SEED;
  }

  function watch(chatId) {
    if (state.unsub) {
      try { state.unsub(); } catch (e) {}
      state.unsub = null;
    }
    if (!chatId) return;
    state.active = chatId;
    state.unsub = db.watchMessages(chatId, function (rows) {
      applyThread(chatId, rows);
    });
  }

  async function publish(text, extra) {
    var chatId = activeId();
    if (!chatId || !state.live) return;
    extra = extra || {};
    var saved = await db.sendMessage(chatId, {
      text: String(text || extra.fileName || "").slice(0, 2000),
      senderId: state.uid,
      senderName: state.name,
      kind: extra.kind || "text",
      fileName: extra.fileName || "",
      fileMeta: extra.fileMeta || "",
      clientId: "c" + Date.now()
    });
    if (!saved) toast("Saved on this device only");
  }

  function hookSend() {
    var form = $("hshsThreadForm");
    if (form && !form.dataset.liveBound) {
      form.dataset.liveBound = "1";
      form.addEventListener("submit", function () {
        var input = $("hshsThreadInput");
        var text = input ? String(input.value || "").trim() : "";
        if (text) setTimeout(function () { publish(text, { kind: "text" }); }, 0);
      }, true);
    }
    var ui = g.HshsMessagesUi;
    if (ui && ui.appendMine && !ui.__liveHooked) {
      ui.__liveHooked = true;
      var orig = ui.appendMine;
      ui.appendMine = function (text, extra) {
        var out = orig.apply(this, arguments);
        if (extra && extra.kind && extra.kind !== "text") publish(text, extra);
        return out;
      };
    }
    var list = $("hshsChatList");
    if (list && !list.dataset.liveBound) {
      list.dataset.liveBound = "1";
      list.addEventListener("click", function (e) {
        var row = e.target.closest("[data-demo]");
        if (!row) return;
        var item = SEED[Number(row.getAttribute("data-demo"))];
        if (item) setTimeout(function () { watch(item.id); }, 80);
      });
    }
  }

  async function start() {
    if (!$("hshsChatPage")) return;
    state.uid = uid();
    state.name = me();
    hookSend();
    try {
      await seedIfNeeded();
      await db.setPresence(state.uid, { name: state.name, page: "chat" });
      markLive(true);
      toast("Live chat on");
      var open = activeId();
      if (open) watch(open);
    } catch (err) {
      markLive(false);
      console.warn("Chat stays local:", err);
    }
    setTimeout(hookSend, 250);
  }

  function boot() {
    if (!$("hshsChatPage")) return;
    start();
  }

  document.addEventListener("hshs:page", boot);
  document.addEventListener("hshs:auth", function () {
    state.uid = uid();
    if ($("hshsChatPage")) start();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 120);

  g.HshsChatLive = { boot: boot, watch: watch, publish: publish };
})(typeof window !== "undefined" ? window : globalThis);
