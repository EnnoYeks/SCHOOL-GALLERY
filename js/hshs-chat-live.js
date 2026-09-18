import { db } from "./db.js";

(function (g) {
  "use strict";
  if (g.__hshsChatLive) return;
  g.__hshsChatLive = true;

  var AV = function (seed) {
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(seed) + "&backgroundColor=1e3a5f";
  };

  var state = {
    ready: false,
    uid: "",
    name: "Campus student",
    active: null,
    unsubThread: null,
    unsubList: null,
    unsubPresence: null,
    presenceTimer: 0,
    live: false,
    connecting: false,
    presence: {}
  };

  function $(id) { return document.getElementById(id); }

  function realUser() {
    var u = g.hshsAuthUser || (g.auth && g.auth.currentUser) || null;
    if (!u || u.isAnonymous) return null;
    return u;
  }

  function meName() {
    try {
      if (g.hshsProfile && g.hshsProfile.fullName) return String(g.hshsProfile.fullName);
      if (g.HshsStore && g.HshsStore.currentUser) {
        var u = g.HshsStore.currentUser();
        if (u && u.name) return String(u.name);
      }
    } catch (e) {}
    var user = realUser();
    return (user && (user.displayName || user.email)) || "Campus student";
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

  function setBanner(text, kind) {
    var banner = $("hshsChatBanner");
    if (!banner) return;
    if (!text) {
      banner.hidden = true;
      banner.setAttribute("aria-hidden", "true");
      banner.textContent = "";
      return;
    }
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
    banner.textContent = text;
    banner.dataset.kind = kind || "info";
  }

  function markMode(mode) {
    state.live = mode === "live";
    state.connecting = mode === "connecting";
    var page = $("hshsChatPage");
    if (page) {
      page.classList.toggle("is-live", state.live);
      page.classList.toggle("is-local", !state.live);
    }
    if (g.HshsMessagesUi && g.HshsMessagesUi.setMode) {
      g.HshsMessagesUi.setMode(mode);
    } else {
      var hero = document.querySelector(".msg-hero-titles p");
      if (hero) {
        hero.textContent = mode === "live" ? "Live campus chat" : (mode === "connecting" ? "Connecting…" : "On this device");
      }
    }
  }

  function tsMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (value.seconds) return value.seconds * 1000;
    var n = Date.parse(value);
    return isNaN(n) ? 0 : n;
  }

  function fmtTime(value) {
    var ms = tsMillis(value);
    if (!ms) return "Now";
    var d = new Date(ms);
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      var h = d.getHours(), m = d.getMinutes(), am = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return h + ":" + (m < 10 ? "0" : "") + m + " " + am;
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function presenceState(uid) {
    var row = state.presence[uid];
    if (!row) return { online: false, label: "Offline" };
    var ago = Date.now() - tsMillis(row.lastSeen);
    if (row.online && ago < 2 * 60 * 1000) return { online: true, label: "Online now" };
    if (ago < 15 * 60 * 1000) return { online: false, label: "Active recently" };
    return { online: false, label: "Offline" };
  }

  function otherMember(chat) {
    var ids = (chat && chat.memberIds) || [];
    for (var i = 0; i < ids.length; i++) if (ids[i] && ids[i] !== state.uid) return ids[i];
    return chat && chat.peerId ? chat.peerId : "";
  }

  function mapChat(row) {
    var peer = otherMember(row);
    var pres = presenceState(peer);
    var unread = 0;
    if (row.unread && typeof row.unread === "object" && row.unread[state.uid] != null) {
      unread = Number(row.unread[state.uid]) || 0;
    } else {
      unread = Number(row.unreadCount || 0) || 0;
    }
    return {
      id: row.id,
      name: row.name || row.peerName || "HSHS Student",
      user: row.user || row.peerUsername || "student",
      preview: row.preview || row.lastMessage || "",
      time: fmtTime(row.updatedAt),
      unread: unread,
      read: unread === 0,
      group: !!row.group,
      members: row.members || [],
      memberIds: row.memberIds || [],
      peerId: peer,
      online: pres.online,
      presenceLabel: pres.label,
      avatar: row.avatar || AV(row.name || row.id || "hshs")
    };
  }

  function mapMessage(row) {
    var mine = !!(row.senderId && row.senderId === state.uid);
    var reacts = row.reacts;
    if (reacts && !Array.isArray(reacts)) {
      reacts = Object.keys(reacts).map(function (k) { return reacts[k]; }).filter(Boolean);
    }
    return {
      id: row.id,
      clientId: row.clientId || "",
      mine: mine,
      text: row.text || "",
      time: fmtTime(row.createdAt),
      kind: row.kind && row.kind !== "text" ? row.kind : undefined,
      src: row.src || "",
      fileName: row.fileName || "",
      fileMeta: row.fileMeta || "",
      sender: mine ? undefined : (row.senderName || "Friend"),
      read: mine,
      pending: !!row.pending,
      reacts: reacts || []
    };
  }

  function stopList() {
    if (state.unsubList) {
      try { state.unsubList(); } catch (e) {}
      state.unsubList = null;
    }
  }

  function stopThread() {
    if (state.unsubThread) {
      try { state.unsubThread(); } catch (e) {}
      state.unsubThread = null;
    }
    state.active = null;
  }

  function stopPresence() {
    if (state.unsubPresence) {
      try { state.unsubPresence(); } catch (e) {}
      state.unsubPresence = null;
    }
    if (state.presenceTimer) {
      clearInterval(state.presenceTimer);
      state.presenceTimer = 0;
    }
  }

  function stopAll() {
    stopList();
    stopThread();
    stopPresence();
  }

  function applyInbox(rows) {
    if (!g.HshsMessagesUi || !g.HshsMessagesUi.setInbox) return;
    g.HshsMessagesUi.setInbox((rows || []).map(mapChat));
  }

  function applyThread(chatId, rows) {
    if (!g.HshsMessagesUi || !g.HshsMessagesUi.applyRemoteThread) return;
    g.HshsMessagesUi.applyRemoteThread(chatId, (rows || []).map(mapMessage));
  }

  function watchList() {
    stopList();
    if (!state.uid || !db.watchChats) return;
    state.unsubList = db.watchChats(state.uid, function (rows, err) {
      if (err) {
        if (state.live) setBanner("Chat list paused — reconnecting when the network returns.", "warn");
        else goLocal("Chat is on this device until Firestore is available.");
        return;
      }
      markMode("live");
      setBanner("");
      applyInbox(rows || []);
      var open = state.active || (g.HshsMessagesUi && g.HshsMessagesUi.activeId && g.HshsMessagesUi.activeId());
      if (open) watch(open);
    });
  }

  function watch(chatId) {
    if (!state.live || !chatId) return;
    if (state.active === chatId && state.unsubThread) return;
    stopThread();
    state.active = chatId;
    if (!db.watchMessages) return;
    state.unsubThread = db.watchMessages(chatId, function (rows, err) {
      if (err) {
        setBanner("This conversation paused. Messages stay on this device until it reconnects.", "warn");
        return;
      }
      setBanner("");
      applyThread(chatId, rows || []);
    });
  }

  function unwatchThread() {
    stopThread();
  }

  async function heartbeat(online) {
    if (!state.uid || !db.setPresence) return;
    if (!state.live && !state.connecting) return;
    await db.setPresence(state.uid, { name: state.name, page: "chat", online: online !== false });
  }

  function startPresence() {
    stopPresence();
    if (!db.watchPresence) return;
    heartbeat(true);
    state.presenceTimer = setInterval(function () { heartbeat(true); }, 60000);
    state.unsubPresence = db.watchPresence(function (map) {
      state.presence = map || {};
      if (g.HshsMessagesUi && g.HshsMessagesUi.setPresenceMap) {
        g.HshsMessagesUi.setPresenceMap(state.presence);
      }
    });
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
  }

  function onVis() {
    if (!state.live && !state.connecting) return;
    heartbeat(document.visibilityState !== "hidden");
  }
  function onHide() {
    if (!state.live && !state.connecting) return;
    heartbeat(false);
  }

  async function publish(text, extra) {
    extra = extra || {};
    if (!state.live) return null;
    var chatId = extra.chatId || state.active || (g.HshsMessagesUi && g.HshsMessagesUi.activeId && g.HshsMessagesUi.activeId());
    if (!chatId) return null;
    var clean = String(text || extra.fileName || "").replace(/<[^>]+>/g, " ").trim();
    var src = extra.src || "";
    var remote = !extra.localOnly && /^https?:\/\//i.test(src);
    var saved = await db.sendMessage(chatId, {
      text: extra.kind && extra.kind !== "text" ? (clean || extra.fileName || extra.kind) : clean,
      senderId: state.uid,
      senderName: state.name,
      kind: extra.kind || "text",
      fileName: extra.fileName || "",
      fileMeta: extra.fileMeta || "",
      src: remote ? src : "",
      mediaKey: extra.mediaKey || "",
      mediaProvider: extra.mediaProvider || (remote ? "remote" : ""),
      clientId: extra.clientId || ("c" + Date.now())
    });
    if (!saved) toast("Saved on this device only");
    return saved;
  }

  async function react(msgId, emo) {
    if (!state.live || !state.active || !msgId || !db.updateMessage) return false;
    var patch = {};
    patch["reacts." + state.uid] = emo;
    return db.updateMessage(state.active, msgId, patch);
  }

  function goLocal(reason) {
    stopAll();
    markMode("local");
    if (reason) setBanner(reason, "info");
  }

  async function start() {
    if (!$("hshsChatPage")) return;
    var user = realUser();
    state.name = meName();

    if (!user) {
      goLocal("");
      return;
    }

    state.uid = user.uid;
    try {
      if (!db || !db.watchChats || !db.watchMessages) throw new Error("no db");
      markMode("connecting");
      setBanner("");
      watchList();
      startPresence();
      var open = g.HshsMessagesUi && g.HshsMessagesUi.activeId && g.HshsMessagesUi.activeId();
      if (open) watch(open);
    } catch (err) {
      console.warn("Chat stays local:", err);
      goLocal("Chat is on this device until Firestore is available.");
    }
  }

  function boot() {
    if (!$("hshsChatPage")) {
      stopAll();
      return;
    }
    start();
  }

  document.addEventListener("hshs:page", function (e) {
    var name = e && e.detail && e.detail.page;
    if (name && name !== "chat") {
      stopAll();
      heartbeat(false);
      return;
    }
    boot();
  });
  document.addEventListener("hshs:auth", function () {
    if ($("hshsChatPage")) start();
    else stopAll();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 120);

  g.HshsChatLive = {
    boot: boot,
    watch: watch,
    unwatchThread: unwatchThread,
    publish: publish,
    react: react,
    isLive: function () { return !!state.live; }
  };
})(typeof window !== "undefined" ? window : globalThis);
