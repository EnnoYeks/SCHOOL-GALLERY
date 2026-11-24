// ============================================
// HSHS WORLD – STORAGE LAYER (Cloudflare R2 only)
// ============================================
// Media files never go into Firestore.
// Firestore holds metadata only. Public media URLs come from the r2.dev base.
// Uploads go through the hshs-r2-sign Worker (presigned PUT).
// Display can list objects from the same Worker and build public URLs.
// No secrets in the client.

(function (g) {
  "use strict";
  if (g.HshsStorage) return;

  // r2.dev public URL is for testing only. Replace with a custom domain in Cloudflare when ready.
  var DEFAULT_PUBLIC_BASE = "https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev";

  var cfg = (g.CONFIG && g.CONFIG.storage) || {
    provider: "cloudflare-r2",
    maxFileSize: 104857600,
    maxPhotoSize: 52428800,
    maxVideoSize: 104857600
  };

  function r2Config() {
    var c = g.__R2 || (g.CONFIG && g.CONFIG.r2) || {};
    if (!c.publicBaseUrl) c.publicBaseUrl = DEFAULT_PUBLIC_BASE;
    return c;
  }

  function publicBase() {
    var r = r2Config();
    return String(r.publicBaseUrl || DEFAULT_PUBLIC_BASE).replace(/\/$/, "");
  }

  function workerBase() {
    var r = r2Config();
    return String(r.signUrl || "").replace(/\/sign\/?$/i, "").replace(/\/$/, "");
  }

  function publicUrl(key) {
    if (!key) return "";
    if (/^https?:\/\//i.test(key)) return key;
    return publicBase() + "/" + String(key).replace(/^\/+/, "");
  }

  function mediaUrl(item) {
    if (!item) return "";
    var direct = item.image || item.imageUrl || item.thumbnailUrl || item.videoUrl || "";
    if (/^(blob:|data:)/i.test(String(direct || ""))) return "";
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    if (item.mediaKey && (!item.mediaProvider || item.mediaProvider === "cloudflare-r2")) {
      return publicUrl(item.mediaKey);
    }
    if (direct && /^\/(assets|images)\//i.test(direct)) return direct;
    if (direct && !/^https?:\/\//i.test(direct)) return publicUrl(direct);
    return "";
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

  function extFrom(fileOrType, kind) {
    if (fileOrType && fileOrType.name) {
      var m = String(fileOrType.name).match(/\.([a-z0-9]+)$/i);
      if (m) return m[1].toLowerCase();
    }
    var t = (fileOrType && fileOrType.type) || "";
    if (t.indexOf("png") !== -1) return "png";
    if (t.indexOf("webp") !== -1) return "webp";
    if (t.indexOf("gif") !== -1) return "gif";
    if (t.indexOf("mp4") !== -1) return "mp4";
    if (t.indexOf("webm") !== -1) return "webm";
    return kind === "video" ? "webm" : "jpg";
  }

  function objectKey(kind, file) {
    var d = new Date();
    var y = d.getUTCFullYear();
    var m = String(d.getUTCMonth() + 1).padStart(2, "0");
    var day = String(d.getUTCDate()).padStart(2, "0");
    var e = extFrom(file, kind);
    return kind + "s/" + y + "/" + m + "/" + day + "/" + uid() + "-" + Date.now() + "." + e;
  }

  function isTestKey(key) {
    var k = String(key || "").toLowerCase();
    return k.indexOf("restore-check") !== -1 || k.indexOf("/test/") !== -1 || k.indexOf("test/") === 0;
  }

  function friendlyTitle(key, type) {
    var raw = String(key || "").split("/").pop() || "";
    var stem = raw.replace(/\.[a-z0-9]+$/i, "");
    var looksGenerated = /[a-z0-9]{12,}-\d{10,}/i.test(stem) || /^[a-z0-9_-]{24,}$/i.test(stem);
    if (!stem || looksGenerated) return type === "video" ? "Campus video" : "Campus photo";
    return stem.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || (type === "video" ? "Campus video" : "Campus photo");
  }

  function mediaSize(file) {
    return new Promise(function (resolve) {
      var empty = { width: 0, height: 0 };
      if (!file) return resolve(empty);
      if (file.type && file.type.indexOf("video/") === 0) {
        var video = document.createElement("video");
        var objectUrl = URL.createObjectURL(file);
        video.preload = "metadata";
        video.onloadedmetadata = function () {
          var dims = { width: video.videoWidth || 0, height: video.videoHeight || 0 };
          URL.revokeObjectURL(objectUrl);
          resolve(dims);
        };
        video.onerror = function () {
          URL.revokeObjectURL(objectUrl);
          resolve(empty);
        };
        video.src = objectUrl;
        return;
      }
      if (typeof createImageBitmap === "function") {
        createImageBitmap(file).then(function (bitmap) {
          var dims = { width: bitmap.width || 0, height: bitmap.height || 0 };
          if (bitmap.close) bitmap.close();
          resolve(dims);
        }).catch(function () { resolve(empty); });
        return;
      }
      var image = new Image();
      var objectUrl = URL.createObjectURL(file);
      image.onload = function () {
        var dims = { width: image.naturalWidth || 0, height: image.naturalHeight || 0 };
        URL.revokeObjectURL(objectUrl);
        resolve(dims);
      };
      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        resolve(empty);
      };
      image.src = objectUrl;
    });
  }

  function checkSize(file, kind) {
    var max = kind === "video" ? (cfg.maxVideoSize || 104857600) : (cfg.maxPhotoSize || 52428800);
    if (file && file.size && file.size > max) {
      throw new Error("File too large (max " + Math.round(max / 1048576) + " MB)");
    }
  }

  function isVideoKey(key) {
    return /\.(mp4|webm|mov|m4v)$/i.test(String(key || ""));
  }

  async function list(options) {
    options = options || {};
    var base = workerBase();
    if (!base) return [];
    var limit = Math.max(1, Math.min(100, Number(options.limit) || 100));
    var prefix = options.prefix || "";
    var maxPages = Math.max(1, Math.min(10000, Number(options.maxPages) || 1000));
    var cursor = "";
    var seenCursors = new Set();
    var all = [];
    try {
      for (var page = 0; page < maxPages; page++) {
        var url = base + "/list?limit=" + encodeURIComponent(limit);
        if (prefix) url += "&prefix=" + encodeURIComponent(prefix);
        if (cursor) url += "&cursor=" + encodeURIComponent(cursor);
        var res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error("List failed " + res.status);
        var data = await res.json();
        var raw = Array.isArray(data) ? data : (data.objects || data.items || []);
        all = all.concat(raw);
        if (data.truncated === true) {
          if (!data.cursor || seenCursors.has(data.cursor)) {
            throw new Error("R2 listing returned an invalid or repeated cursor; inventory is incomplete");
          }
          seenCursors.add(data.cursor);
          cursor = data.cursor;
          continue;
        }
        if (data.truncated === false || raw.length < limit) break;
        throw new Error("R2 Worker does not expose pagination metadata. Deploy the updated Worker before relying on a complete listing.");
      }
      if (all.length && all.length >= limit * maxPages) {
        throw new Error("R2 listing exceeded the page safety limit; inventory is incomplete");
      }
      return all.map(function (item) {
        var key = typeof item === "string" ? item : (item.key || item.name || "");
        if (isTestKey(key)) return null;
        var type = isVideoKey(key) ? "video" : "photo";
        return {
          id: key,
          key: key,
          mediaKey: key,
          url: publicUrl(key),
          image: publicUrl(key),
          imageUrl: publicUrl(key),
          thumbnailUrl: publicUrl(key),
          type: type,
          title: friendlyTitle(key, type),
          likes: 0,
          views: 0,
          size: (item && item.size) || 0,
          provider: "cloudflare-r2"
        };
      }).filter(function (o) { return o && o.key; });
    } catch (err) {
      console.warn("[HshsStorage] R2 list failed:", err && err.message);
      throw err;
    }
  }

  async function upload(file, options) {
    options = options || {};
    var kind = options.kind || (file && file.type && file.type.indexOf("video") === 0 ? "video" : "photo");
    checkSize(file, kind);
    var dims = await mediaSize(file);
    var key = objectKey(kind, file);
    var r2 = r2Config();
    var signTarget = r2.signUrl || "";
    if (signTarget && !/\/sign\/?$/i.test(signTarget)) {
      signTarget = signTarget.replace(/\/$/, "") + "/sign";
    }
    if (!signTarget) {
      throw new Error("Cloudflare R2 is not configured. The file was not saved.");
    }
    var signRes = await fetch(signTarget, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key,
        contentType: (file && file.type) || (kind === "video" ? "video/webm" : "image/jpeg"),
        size: file && file.size
      })
    });
    if (!signRes.ok) throw new Error("Cloudflare R2 signing failed (" + signRes.status + "). The file was not saved.");
    var signed = await signRes.json();
    var putUrl = signed.url || signed.putUrl;
    if (!putUrl) throw new Error("Cloudflare R2 did not return an upload URL.");
    var put = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": (file && file.type) || (kind === "video" ? "video/webm" : "image/jpeg")
      },
      body: file
    });
    if (!put.ok) throw new Error("Cloudflare R2 upload failed (" + put.status + "). The file was not saved.");
    return {
      url: publicUrl(key),
      key: key,
      provider: "cloudflare-r2",
      kind: kind,
      size: (file && file.size) || 0,
      width: dims.width,
      height: dims.height
    };
  }

  async function uploadFromUrl(src, options) {
    options = options || {};
    var kind = options.kind || "photo";
    if (!src) throw new Error("No media source");
    if (/^https?:\/\//i.test(src)) {
      return { url: src, key: objectKey(kind, null), provider: "remote", kind: kind, size: 0 };
    }
    try {
      var res = await fetch(src);
      var blob = await res.blob();
      var file = new File([blob], "capture." + (kind === "video" ? "webm" : "jpg"), {
        type: blob.type || (kind === "video" ? "video/webm" : "image/jpeg")
      });
      return upload(file, { kind: kind });
    } catch (e) {
      return { url: src, key: objectKey(kind, null), provider: "passthrough", kind: kind, size: 0 };
    }
  }

  async function uploadAdmin(file) {
    if (!file) throw new Error("No file");
    var kind = (file.type && file.type.indexOf("video") === 0) ? "video" : "photo";
    checkSize(file, kind);
    var dims = await mediaSize(file);
    var allowed = kind === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp"];
    if (allowed.indexOf(file.type) === -1) throw new Error("Unsupported file type");
    var token = await (g.auth && g.auth.currentUser ? g.auth.currentUser.getIdToken() : Promise.reject(new Error("Not signed in")));
    var base = workerBase();
    var res = await fetch(base + "/admin/upload", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": file.type,
        "Content-Length": String(file.size)
      },
      body: file
    });
    if (!res.ok) {
      var msg = "Upload failed";
      try { var j = await res.json(); msg = j.error || msg; } catch (e) {}
      throw new Error(msg);
    }
    var data = await res.json();
    return {
      url: publicUrl(data.key),
      key: data.key,
      provider: "cloudflare-r2",
      kind: kind,
      size: file.size,
      width: dims.width,
      height: dims.height
    };
  }

  g.HshsStorage = {
    upload: upload,
    uploadFromUrl: uploadFromUrl,
    uploadAdmin: uploadAdmin,
    list: list,
    objectKey: objectKey,
    publicUrl: publicUrl,
    mediaUrl: mediaUrl,
    publicBase: publicBase,
    r2Config: r2Config,
    mediaSize: mediaSize,
    provider: function () {
      var r = r2Config();
      return r && r.signUrl ? "cloudflare-r2" : (cfg.provider || "local");
    }
  };
  // Startup reachability check. Does not change the base URL.
  (function checkR2() {
    try {
      var base = publicBase();
      if (!base) return;
      var probe = base + "/";
      fetch(probe, { method: "HEAD", mode: "no-cors" }).catch(function () {
        console.warn("[HSHS] R2 public URL not reachable: " + base);
      });
    } catch (e) {
      console.warn("[HSHS] R2 public URL check failed:", e && e.message);
    }
  })();

})(typeof window !== "undefined" ? window : globalThis);
