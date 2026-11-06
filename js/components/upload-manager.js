/**
 * HSHS shared upload manager — queue, progress rows, cancel, offline pause.
 * PR1: core API used by Studio/chat. Full multi-file UI continues in PR2.
 */
(function (g) {
  "use strict";
  if (g.HshsUploadManager) return;

  var queue = [];
  var active = 0;
  var maxParallel = 1;

  function detectParallel() {
    try {
      var c = navigator.connection;
      if (c && c.effectiveType === "4g" && !c.saveData && (c.downlink || 0) >= 5) return 2;
    } catch (e) {}
    return 1;
  }

  function formatBytes(n) {
    if (!n) return "0 B";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  }

  function enqueue(file, options) {
    options = options || {};
    maxParallel = detectParallel();
    var item = {
      id: "up_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      file: file,
      kind: options.kind || (file.type && file.type.indexOf("video/") === 0 ? "video" : "photo"),
      status: "queued",
      percent: 0,
      loaded: 0,
      total: file.size || 0,
      error: null,
      result: null,
      controller: typeof AbortController !== "undefined" ? new AbortController() : null,
      options: options
    };
    queue.push(item);
    pump();
    return item;
  }

  function cancel(id) {
    var item = queue.find(function (q) { return q.id === id; });
    if (!item) return;
    item.status = "cancelled";
    if (item.controller) {
      try { item.controller.abort(); } catch (e) {}
    }
    if (typeof item.options.onStatus === "function") item.options.onStatus(item);
  }

  function pump() {
    maxParallel = detectParallel();
    while (active < maxParallel) {
      var next = queue.find(function (q) { return q.status === "queued"; });
      if (!next) break;
      runOne(next);
    }
  }

  function runOne(item) {
    active += 1;
    item.status = "uploading";
    if (typeof item.options.onStatus === "function") item.options.onStatus(item);
    if (!g.HshsStorage || typeof g.HshsStorage.upload !== "function") {
      item.status = "failed";
      item.error = "Upload engine missing";
      active -= 1;
      if (typeof item.options.onStatus === "function") item.options.onStatus(item);
      pump();
      return;
    }
    g.HshsStorage.upload(item.file, {
      kind: item.kind,
      signal: item.controller && item.controller.signal,
      compress: item.options.compress,
      admin: item.options.admin,
      onProgress: function (p) {
        item.percent = p.percent || 0;
        item.loaded = p.loaded || 0;
        item.total = p.total || item.total;
        item.stage = p.stage;
        item.speed = p.speedBytesPerSec;
        item.eta = p.etaSeconds;
        if (p.stage === "paused") item.status = "paused";
        else if (item.status !== "cancelled") item.status = "uploading";
        if (typeof item.options.onProgress === "function") item.options.onProgress(item, p);
        if (typeof item.options.onStatus === "function") item.options.onStatus(item);
      }
    }).then(function (res) {
      item.result = res;
      item.status = "done";
      item.percent = 100;
      active -= 1;
      if (typeof item.options.onStatus === "function") item.options.onStatus(item);
      if (typeof item.options.onDone === "function") item.options.onDone(item, res);
      pump();
    }).catch(function (err) {
      if (item.status === "cancelled" || (err && err.code === "E_CANCELLED")) {
        item.status = "cancelled";
      } else {
        item.status = "failed";
        item.error = (err && err.message) || "Upload failed";
        item.errorCode = err && err.code;
      }
      active -= 1;
      if (typeof item.options.onStatus === "function") item.options.onStatus(item);
      if (typeof item.options.onError === "function") item.options.onError(item, err);
      pump();
    });
  }

  try {
    window.addEventListener("beforeunload", function (e) {
      var busy = queue.some(function (q) {
        return q.status === "uploading" || q.status === "queued" || q.status === "paused";
      });
      if (busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  } catch (e) {}

  g.HshsUploadManager = {
    enqueue: enqueue,
    cancel: cancel,
    formatBytes: formatBytes,
    getQueue: function () { return queue.slice(); }
  };
})(typeof window !== "undefined" ? window : globalThis);
