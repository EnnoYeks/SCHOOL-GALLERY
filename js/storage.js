// ============================================
// HSHS WORLD - STORAGE LAYER (Cloudflare R2)
// ============================================
// Media never goes into the database. DB holds metadata only.
// Uploads: sign -> XHR PUT to Worker /put -> public r2.dev URL.
// Progress, retry, cancel, offline pause, real errors. No fake local success.
// Public API of window.HshsStorage is backward compatible.

(function (g) {
  "use strict";
  if (g.HshsStorage && g.HshsStorage.__engineV2) return;

  var DEFAULT_PUBLIC_BASE = "https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev";
  var MAX_VIDEO_BYTES = 50 * 1024 * 1024;
  var MAX_PHOTO_BYTES = 25 * 1024 * 1024;
  var PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  var VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  var DEFAULT_RETRIES = 3;
  var DEFAULT_TIMEOUT_MS = 120000;

  var cfg = (g.CONFIG && g.CONFIG.storage) || {
    provider: "cloudflare-r2",
    maxFileSize: MAX_VIDEO_BYTES,
    maxPhotoSize: MAX_PHOTO_BYTES,
    maxVideoSize: MAX_VIDEO_BYTES
  };

  function r2Config() {
    var c = g.__R2 || (g.CONFIG && g.CONFIG.r2) || {};
    if (!c.publicBaseUrl) c.publicBaseUrl = DEFAULT_PUBLIC_BASE;
    return c;
  }
  function publicBase() {
    return String(r2Config().publicBaseUrl || DEFAULT_PUBLIC_BASE).replace(/\/$/, "");
  }
  function workerBase() {
    var r = r2Config();
    return String(r.signUrl || "").replace(/\/sign\/?$/i, "").replace(/\/$/, "");
  }
  function publicUrl(key) {
    if (!key) return "";
    if (/^https?:\/\//i.test(key)) return key;
    if (/^(data:|blob:)/i.test(key)) return key;
    return publicBase() + "/" + String(key).replace(/^\/+/, "");
  }
  function mediaUrl(item) {
    if (!item) return "";
    var direct = item.image || item.imageUrl || item.thumbnailUrl || item.videoUrl || "";
    if (direct && (/^https?:\/\//i.test(direct) || /^(data:|blob:)/i.test(direct))) return direct;
    if (item.mediaKey) return publicUrl(item.mediaKey);
    if (direct) return publicUrl(direct);
    return "";
  }
  function requireUid() {
    if (g.auth && g.auth.currentUser && !g.auth.currentUser.isAnonymous) return g.auth.currentUser.uid;
    var err = new Error("Sign in to upload");
    err.code = "E_AUTH";
    throw err;
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
  async function idToken() {
    if (!g.auth || !g.auth.currentUser || g.auth.currentUser.isAnonymous) {
      var err = new Error("Sign in to upload");
      err.code = "E_AUTH";
      throw err;
    }
    return g.auth.currentUser.getIdToken();
  }
  function extFrom(fileOrType, kind) {
    if (fileOrType && fileOrType.name) {
      var m = String(fileOrType.name).match(/\.([a-z0-9]+)$/i);
      if (m) return m[1].toLowerCase().replace(/jpeg/, "jpg");
    }
    var t = (fileOrType && fileOrType.type) || "";
    if (t.indexOf("png") !== -1) return "png";
    if (t.indexOf("webp") !== -1) return "webp";
    if (t.indexOf("gif") !== -1) return "gif";
    if (t.indexOf("mp4") !== -1) return "mp4";
    if (t.indexOf("webm") !== -1) return "webm";
    if (t.indexOf("quicktime") !== -1) return "mov";
    return kind === "video" ? "webm" : "jpg";
  }
  function objectKey(kind, file) {
    var d = new Date();
    var y = d.getUTCFullYear();
    var m = String(d.getUTCMonth() + 1).padStart(2, "0");
    var day = String(d.getUTCDate()).padStart(2, "0");
    var e = extFrom(file, kind);
    var rand = Math.random().toString(36).slice(2, 6);
    return kind + "s/" + y + "/" + m + "/" + day + "/" + uid() + "-" + Date.now() + "-" + rand + "." + e;
  }
  function isVideoKey(key) {
    return /\.(mp4|webm|mov|m4v)$/i.test(String(key || ""));
  }
  function validateFile(file, kind) {
    if (!file || !(file instanceof Blob)) {
      var e0 = new Error("No file selected");
      e0.code = "E_TYPE";
      throw e0;
    }
    if (!file.size) {
      var e1 = new Error("Empty file");
      e1.code = "E_TYPE";
      throw e1;
    }
    var type = file.type || "";
    if (kind === "video") {
      var okV = VIDEO_TYPES.some(function (t) { return type === t; }) || type.indexOf("video/") === 0;
      if (type && !okV) {
        var e2 = new Error("Unsupported video type. Use MP4 or WebM.");
        e2.code = "E_TYPE";
        throw e2;
      }
      var maxV = Math.min(cfg.maxVideoSize || MAX_VIDEO_BYTES, MAX_VIDEO_BYTES);
      if (file.size > maxV) {
        var e3 = new Error("Video too large (max " + Math.round(maxV / 1048576) + " MB)");
        e3.code = "E_TOO_LARGE";
        throw e3;
      }
    } else {
      var okP = !type || PHOTO_TYPES.indexOf(type) !== -1 || type.indexOf("image/") === 0 || /\.heic$/i.test(file.name || "");
      if (!okP) {
        var e4 = new Error("Unsupported image type. Use JPEG, PNG, WebP or GIF.");
        e4.code = "E_TYPE";
        throw e4;
      }
      var maxP = cfg.maxPhotoSize || MAX_PHOTO_BYTES;
      if (file.size > maxP) {
        var e5 = new Error("Photo too large (max " + Math.round(maxP / 1048576) + " MB)");
        e5.code = "E_TOO_LARGE";
        throw e5;
      }
    }
  }
  function heicHint(file) {
    if (file && /\.heic$/i.test(file.name || "") && (!file.type || file.type === "image/heic" || file.type === "image/heif")) {
      var e = new Error("HEIC photos need conversion. Export as JPEG from your gallery, then upload.");
      e.code = "E_TYPE";
      throw e;
    }
  }
  function makeProgressTracker(onProgress, total) {
    var lastEmit = 0;
    var samples = [];
    return function (loaded, stage) {
      var now = Date.now();
      if (now - lastEmit < 100 && loaded < total && stage === "uploading") return;
      lastEmit = now;
      samples.push({ t: now, loaded: loaded });
      if (samples.length > 8) samples.shift();
      var speed = 0;
      if (samples.length >= 2) {
        var a = samples[0];
        var b = samples[samples.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt > 0) speed = (b.loaded - a.loaded) / dt;
      }
      var remaining = Math.max(0, total - loaded);
      var eta = speed > 0 ? remaining / speed : 0;
      var percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
      if (typeof onProgress === "function") {
        try {
          onProgress({
            loaded: loaded, total: total, percent: percent,
            speedBytesPerSec: speed, etaSeconds: eta, stage: stage || "uploading"
          });
        } catch (e) {}
      }
    };
  }
  function debugLog() {}
  function waitOnline(signal) {
    if (typeof navigator === "undefined" || navigator.onLine !== false) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      function onOnline() { cleanup(); resolve(); }
      function onAbort() {
        cleanup();
        var err = new Error("Upload cancelled");
        err.code = "E_CANCELLED";
        reject(err);
      }
      function cleanup() {
        window.removeEventListener("online", onOnline);
        if (signal) signal.removeEventListener("abort", onAbort);
      }
      window.addEventListener("online", onOnline);
      if (signal) {
        if (signal.aborted) return onAbort();
        signal.addEventListener("abort", onAbort);
      }
    });
  }
  function mapHttpError(status, bodyText) {
    var msg = "Upload failed";
    var code = "E_SERVER";
    if (status === 401 || status === 403) { code = "E_AUTH"; msg = "Sign in required or session expired"; }
    else if (status === 413) { code = "E_TOO_LARGE"; msg = "File too large for the server"; }
    else if (status === 415) { code = "E_TYPE"; msg = "Unsupported file type"; }
    else if (status === 429) { code = "E_SERVER"; msg = "Too many uploads - wait a moment and retry"; }
    else if (status === 408) { code = "E_TIMEOUT"; msg = "Upload timed out"; }
    else if (status >= 500) { code = "E_SERVER"; msg = "Server error (" + status + ")"; }
    else if (status >= 400) { code = "E_SERVER"; msg = "Request failed (" + status + ")"; }
    try {
      var j = JSON.parse(bodyText || "{}");
      if (j && j.error) msg = String(j.error);
    } catch (e) {}
    var err = new Error(msg);
    err.code = code;
    err.status = status;
    return err;
  }
  function xhrPut(url, file, contentType, token, timeoutMs, signal, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var total = file.size || 0;
      var emit = makeProgressTracker(onProgress, total);
      var finished = false;
      function fail(err) { if (finished) return; finished = true; reject(err); }
      function ok() { if (finished) return; finished = true; resolve(); }
      if (signal) {
        if (signal.aborted) {
          var c0 = new Error("Upload cancelled");
          c0.code = "E_CANCELLED";
          return fail(c0);
        }
        signal.addEventListener("abort", function () {
          try { xhr.abort(); } catch (e) {}
          var c1 = new Error("Upload cancelled");
          c1.code = "E_CANCELLED";
          fail(c1);
        });
      }
      xhr.open("PUT", url, true);
      xhr.timeout = timeoutMs || DEFAULT_TIMEOUT_MS;
      if (contentType) xhr.setRequestHeader("Content-Type", contentType);
      if (token) xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.upload.onprogress = function (ev) {
        emit(ev.lengthComputable ? ev.loaded : (ev.loaded || 0), "uploading");
      };
      xhr.upload.onloadstart = function () { emit(0, "uploading"); };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) { emit(total, "finishing"); ok(); }
        else fail(mapHttpError(xhr.status, xhr.responseText));
      };
      xhr.onerror = function () {
        var err = new Error(navigator.onLine === false ? "You are offline" : "Network error");
        err.code = "E_NETWORK";
        fail(err);
      };
      xhr.ontimeout = function () {
        var err = new Error("Upload timed out");
        err.code = "E_TIMEOUT";
        fail(err);
      };
      xhr.onabort = function () {
        var err = new Error("Upload cancelled");
        err.code = "E_CANCELLED";
        fail(err);
      };
      xhr.send(file);
    });
  }
  function shouldRetry(err, attempt, maxAttempts) {
    if (!err || attempt >= maxAttempts) return false;
    if (err.code === "E_CANCELLED" || err.code === "E_AUTH" || err.code === "E_TYPE" || err.code === "E_TOO_LARGE") return false;
    if (err.status && err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) return false;
    return true;
  }
  function backoffMs(attempt) {
    return Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 250);
  }
  async function upload(file, options) {
    options = options || {};
    var kind = options.kind || (file && file.type && file.type.indexOf("video") === 0 ? "video" : "photo");
    var stage = function (s) {
      if (typeof options.onStage === "function") { try { options.onStage(s); } catch (e) {} }
      if (typeof options.onProgress === "function") {
        try {
          options.onProgress({ loaded: 0, total: (file && file.size) || 0, percent: 0, speedBytesPerSec: 0, etaSeconds: 0, stage: s });
        } catch (e) {}
      }
    };
    stage("preparing");
    requireUid();
    heicHint(file);
    validateFile(file, kind);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      stage("paused");
      await waitOnline(options.signal);
    }
    var workFile = file;
    var thumbResult = null;
    var width = 0;
    var height = 0;
    if (kind === "photo" && options.compress !== false && g.HshsMediaPrep) {
      stage("compressing");
      try {
        var prep = await g.HshsMediaPrep.compressPhoto(file, { admin: !!options.admin });
        workFile = prep.file || file;
        width = prep.width || 0;
        height = prep.height || 0;
      } catch (e) { workFile = file; }
      if (!options.skipThumb) {
        try { thumbResult = await g.HshsMediaPrep.makeThumbnail(workFile); } catch (e) {}
      }
    }
    if (kind === "video" && g.HshsMediaPrep && !options.skipThumb) {
      try {
        var meta = await g.HshsMediaPrep.videoMeta(file);
        if (meta.duration > 180 && !options.admin) {
          var eDur = new Error("Video is longer than 3 minutes");
          eDur.code = "E_TYPE";
          throw eDur;
        }
        thumbResult = await g.HshsMediaPrep.videoPoster(file);
      } catch (e) { if (e && e.code) throw e; }
    }
    var key = objectKey(kind, workFile);
    var contentType = (workFile && workFile.type) || (kind === "video" ? "video/webm" : "image/jpeg");
    var token = await idToken();
    var base = workerBase();
    if (!base) {
      var eCfg = new Error("Upload service is not configured");
      eCfg.code = "E_SERVER";
      throw eCfg;
    }
    var signTarget = r2Config().signUrl || base + "/sign";
    if (signTarget && !/\/sign\/?$/i.test(signTarget)) {
      signTarget = signTarget.replace(/\/$/, "") + "/sign";
    }
    var retries = options.retries != null ? options.retries : DEFAULT_RETRIES;
    var timeout = options.timeout || Math.max(DEFAULT_TIMEOUT_MS, Math.round(((workFile.size || 0) / (100 * 1024)) * 1000));
    var attempt = 0;
    var lastErr = null;
    while (attempt <= retries) {
      if (options.signal && options.signal.aborted) {
        var c = new Error("Upload cancelled");
        c.code = "E_CANCELLED";
        throw c;
      }
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        stage("paused");
        await waitOnline(options.signal);
      }
      try {
        stage("signing");
        var signRes = await fetch(signTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ key: key, contentType: contentType, size: workFile.size || 0, kind: kind }),
          signal: options.signal
        });
        if (!signRes.ok) {
          var bodyText = await signRes.text().catch(function () { return ""; });
          throw mapHttpError(signRes.status, bodyText);
        }
        var signed = await signRes.json();
        var putUrl = signed.url || signed.putUrl;
        if (!putUrl) {
          var eNo = new Error("No upload URL from server");
          eNo.code = "E_SERVER";
          throw eNo;
        }
        stage("uploading");
        await xhrPut(putUrl, workFile, contentType, token, timeout, options.signal, options.onProgress);
        stage("finishing");
        var result = {
          url: publicUrl(key), key: key, provider: "cloudflare-r2",
          kind: kind, size: workFile.size || 0, width: width, height: height
        };
        if (thumbResult && thumbResult.file) {
          try {
            var thumbKey = key.replace(/(\.[a-z0-9]+)$/i, "-thumb$1").replace(/\.(mp4|webm|mov)$/i, "-thumb.jpg");
            if (thumbKey === key) thumbKey = key + "-thumb.jpg";
            var thumbType = thumbResult.file.type || "image/jpeg";
            var sign2 = await fetch(signTarget, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({ key: thumbKey, contentType: thumbType, size: thumbResult.file.size || 0, kind: "photo" })
            });
            if (sign2.ok) {
              var s2 = await sign2.json();
              var put2 = s2.url || s2.putUrl;
              if (put2) {
                await xhrPut(put2, thumbResult.file, thumbType, token, 60000, options.signal, null);
                result.thumbnailKey = thumbKey;
                result.thumbnailUrl = publicUrl(thumbKey);
              }
            }
          } catch (eThumb) {}
        }
        return result;
      } catch (err) {
        lastErr = err;
        if (!shouldRetry(err, attempt, retries)) throw err;
        attempt += 1;
        if (typeof options.onProgress === "function") {
          try {
            options.onProgress({
              loaded: 0, total: workFile.size || 0, percent: 0, speedBytesPerSec: 0, etaSeconds: 0,
              stage: "uploading", retry: attempt, retries: retries
            });
          } catch (e) {}
        }
        await new Promise(function (r) { setTimeout(r, backoffMs(attempt)); });
        try { token = await idToken(); } catch (e) { throw lastErr; }
      }
    }
    throw lastErr || new Error("Upload failed");
  }
  async function uploadFromUrl(src, options) {
    options = options || {};
    var kind = options.kind || "photo";
    if (!src) {
      var e = new Error("No media source");
      e.code = "E_TYPE";
      throw e;
    }
    if (/^https?:\/\//i.test(src)) {
      return { url: src, key: objectKey(kind, null), provider: "remote", kind: kind, size: 0 };
    }
    if (/^(data:|blob:)/i.test(src)) {
      var res = await fetch(src);
      var blob = await res.blob();
      var ext = kind === "video" ? "webm" : "jpg";
      var file = new File([blob], "capture." + ext, {
        type: blob.type || (kind === "video" ? "video/webm" : "image/jpeg")
      });
      return upload(file, options);
    }
    try {
      var res2 = await fetch(src);
      var blob2 = await res2.blob();
      var file2 = new File([blob2], "capture." + (kind === "video" ? "webm" : "jpg"), {
        type: blob2.type || (kind === "video" ? "video/webm" : "image/jpeg")
      });
      return upload(file2, options);
    } catch (e) {
      var err = new Error("Could not load media for upload");
      err.code = "E_NETWORK";
      throw err;
    }
  }
  async function uploadAdmin(file, options) {
    options = options || {};
    options.admin = true;
    options.compress = options.compress !== false;
    return upload(file, options);
  }
  async function list(options) {
    options = options || {};
    var base = workerBase();
    if (!base) return [];
    var limit = options.limit || 40;
    var prefix = options.prefix || "";
    try {
      var url = base + "/list?limit=" + encodeURIComponent(limit);
      if (prefix) url += "&prefix=" + encodeURIComponent(prefix);
      var res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("List failed " + res.status);
      var data = await res.json();
      var raw = Array.isArray(data) ? data : data.objects || data.items || [];
      return raw.map(function (item) {
        var key = typeof item === "string" ? item : item.key || item.name || "";
        var type = isVideoKey(key) ? "video" : "photo";
        return {
          id: key, key: key, mediaKey: key,
          url: publicUrl(key), image: publicUrl(key), imageUrl: publicUrl(key), thumbnailUrl: publicUrl(key),
          type: type, title: key.split("/").pop() || "HSHS moment",
          likes: 0, views: 0, size: (item && item.size) || 0, provider: "cloudflare-r2"
        };
      }).filter(function (o) { return o.key; });
    } catch (err) {
      console.warn("[HshsStorage] R2 list failed:", err && err.message);
      return [];
    }
  }
  g.HshsStorage = {
    __engineV2: true,
    upload: upload,
    uploadFromUrl: uploadFromUrl,
    uploadAdmin: uploadAdmin,
    list: list,
    objectKey: objectKey,
    publicUrl: publicUrl,
    mediaUrl: mediaUrl,
    publicBase: publicBase,
    r2Config: r2Config,
    provider: function () {
      var r = r2Config();
      return r && r.signUrl ? "cloudflare-r2" : cfg.provider || "local";
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
