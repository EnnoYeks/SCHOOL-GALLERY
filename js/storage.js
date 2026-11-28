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
    var direct = item.image || item.imageUrl || item.image_url || item.thumbnailUrl || item.thumbnail_url || item.videoUrl || item.video_url || item.mediaUrl || item.media_url || "";
    if (/^(blob:|data:)/i.test(String(direct || ""))) return "";
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    var key = item.mediaKey || item.media_key || "";
    var provider = item.mediaProvider || item.media_provider;
    if (key && (!provider || provider === "cloudflare-r2")) return publicUrl(key);
    if (direct && /^\/?(assets|images|media)\//i.test(direct)) return direct;
    if (direct && !/^https?:\/\//i.test(direct)) return publicUrl(direct);
    return "";
  }

  function onMediaError(el, kind) {
    if (!el) return;
    var tag = String(el.tagName || "").toUpperCase();
    if (tag === "SOURCE" && el.parentElement && String(el.parentElement.tagName).toUpperCase() === "VIDEO") {
      el = el.parentElement;
      tag = "VIDEO";
    }
    if (tag !== "IMG" && tag !== "VIDEO") return;
    if (el.dataset && el.dataset.hshsMediaFallback === "1") return;
    if (el.dataset) el.dataset.hshsMediaFallback = "1";
    var isAvatar = kind === "avatar" || (el.dataset && el.dataset.mediaKind === "avatar");
    var fallback = isAvatar ? "/assets/placeholder-avatar.svg" : "/assets/placeholder-media.svg";
    if (tag === "IMG") {
      if (el.getAttribute("src") !== fallback) el.setAttribute("src", fallback);
      return;
    }
    try { el.pause(); } catch (e) {}
    el.removeAttribute("src");
    Array.prototype.forEach.call(el.querySelectorAll("source"), function (source) {
      source.removeAttribute("src");
    });
    el.setAttribute("poster", fallback);
    try { el.load(); } catch (e) {}
  }

  function installMediaGuards() {
    if (typeof document === "undefined" || document.__hshsMediaGuards) return;
    document.__hshsMediaGuards = true;
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && /^(IMG|VIDEO|SOURCE)$/i.test(target.tagName || "")) {
        onMediaError(target);
      }
    }, true);
    function stripEmptySources(root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll('img[src=""],video[src=""],source[src=""]').forEach(function (el) {
        el.removeAttribute("src");
      });
    }
    stripEmptySources(document);
    if (typeof MutationObserver === "function" && document.documentElement) {
      var observer = new MutationObserver(function (records) {
        records.forEach(function (record) {
          if (record.type === "attributes" && record.target && record.target.getAttribute("src") === "") {
            record.target.removeAttribute("src");
          }
          (record.addedNodes || []).forEach(function (node) {
            if (node.nodeType === 1) {
              if (node.matches && node.matches('img[src=""],video[src=""],source[src=""]')) node.removeAttribute("src");
              stripEmptySources(node);
            }
          });
        });
      });
      observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
    }
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
    var complete = false;
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
            console.warn("[HshsStorage] R2 listing stopped: invalid or repeated cursor; results are partial.");
            break;
          }
          seenCursors.add(data.cursor);
          cursor = data.cursor;
          continue;
        }
        if (data.truncated === false || raw.length < limit) {
          complete = true;
          break;
        }
        // Older deployed Workers omit pagination metadata. Keep UI fallbacks
        // usable, but mark the result partial; the audit script rejects it.
        console.warn("[HshsStorage] R2 listing is partial until the updated Worker is deployed.");
        break;
      }
      if (all.length && all.length >= limit * maxPages) {
        console.warn("[HshsStorage] R2 listing reached its page safety limit; results are partial.");
      }
      var result = all.map(function (item) {
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
      result.complete = complete;
      return result;
    } catch (err) {
      console.warn("[HshsStorage] R2 list failed:", err && err.message);
      throw err;
    }
  }

  function emitProgress(options, info) {
    if (!options || typeof options.onProgress !== "function") return;
    try { options.onProgress(info); } catch (e) {}
  }

  function putWithProgress(putUrl, file, contentType, onByte, signal, idToken) {
    return new Promise(function (resolve, reject) {
      if (signal && signal.aborted) {
        reject(Object.assign(new Error("Upload cancelled"), { name: "AbortError" }));
        return;
      }
      if (typeof XMLHttpRequest !== "function") {
        fetch(putUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType || "application/octet-stream", "Authorization": "Bearer " + idToken },
          body: file,
          signal: signal
        }).then(function (put) {
          if (!put.ok) reject(new Error("Cloudflare R2 upload failed (" + put.status + ")."));
          else resolve();
        }).catch(function (err) {
          if (err && err.name === "AbortError") reject(Object.assign(new Error("Upload cancelled"), { name: "AbortError" }));
          else reject(new Error("Cloudflare R2 upload failed."));
        });
        return;
      }
      var xhr = new XMLHttpRequest();
      var settled = false;
      function finish(err) {
        if (settled) return;
        settled = true;
        if (signal) signal.removeEventListener("abort", onAbort);
        if (err) reject(err);
        else resolve();
      }
      function onAbort() {
        try { xhr.abort(); } catch (e) {}
        finish(Object.assign(new Error("Upload cancelled"), { name: "AbortError" }));
      }
      if (signal) signal.addEventListener("abort", onAbort);
      xhr.open("PUT", putUrl);
      xhr.setRequestHeader("Content-Type", contentType || "application/octet-stream");
      xhr.setRequestHeader("Authorization", "Bearer " + idToken);
      if (xhr.upload && onByte) {
        xhr.upload.onprogress = function (ev) {
          var total = ev.lengthComputable && ev.total ? ev.total : ((file && file.size) || 0);
          var ratio = total ? (ev.loaded / total) : 0;
          onByte({ loaded: ev.loaded || 0, total: total, ratio: Math.max(0, Math.min(1, ratio)) });
        };
      }
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) finish();
        else finish(new Error("Cloudflare R2 upload failed (" + xhr.status + ")."));
      };
      xhr.onerror = function () { finish(new Error("Cloudflare R2 upload failed.")); };
      xhr.onabort = function () { finish(Object.assign(new Error("Upload cancelled"), { name: "AbortError" })); };
      xhr.send(file);
    });
  }

  async function uploadObject(file, key, contentType, onByte, signal) {
    var r2 = r2Config();
    var signTarget = r2.signUrl || "";
    if (signTarget && !/\/sign\/?$/i.test(signTarget)) signTarget = signTarget.replace(/\/$/, "") + "/sign";
    if (!signTarget) throw new Error("Cloudflare R2 is not configured. The file was not saved.");
    var currentUser = g.auth && g.auth.currentUser;
    if (!currentUser || currentUser.isAnonymous) {
      throw new Error("Sign in with your school account before uploading.");
    }
    var idToken = await currentUser.getIdToken();
    var signRes = await fetch(signTarget, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + idToken
      },
      body: JSON.stringify({ key: key, contentType: contentType, size: file && file.size }),
      signal: signal
    });
    if (!signRes.ok) throw new Error("Cloudflare R2 signing failed (" + signRes.status + ").");
    var signed = await signRes.json();
    var putUrl = signed.url || signed.putUrl;
    if (!putUrl) throw new Error("Cloudflare R2 did not return an upload URL.");
    await putWithProgress(putUrl, file, contentType, onByte, signal, idToken);
    return { key: key, url: publicUrl(key) };
  }

  function variantId() {
    try {
      if (g.crypto && typeof g.crypto.randomUUID === "function") return g.crypto.randomUUID();
    } catch (e) {}
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
  }

  function loadDrawable(file) {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(file).then(function (bitmap) {
        return { image: bitmap, width: bitmap.width, height: bitmap.height, close: function () { if (bitmap.close) bitmap.close(); } };
      });
    }
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function () {
        resolve({
          image: image, width: image.naturalWidth || image.width, height: image.naturalHeight || image.height,
          close: function () { URL.revokeObjectURL(objectUrl); }
        });
      };
      image.onerror = function () { URL.revokeObjectURL(objectUrl); reject(new Error("Could not decode image for size generation.")); };
      image.src = objectUrl;
    });
  }

  function canvasWebp(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) return reject(new Error("This browser could not create a WebP image."));
        resolve(blob);
      }, "image/webp", 0.8);
    });
  }

  async function createImageVariants(file, id, onVariant, signal) {
    var drawable = await loadDrawable(file);
    try {
      var base = "media/" + id;
      var targets = [
        { name: "thumb", max: 400 },
        { name: "medium", max: 900 },
        { name: "large", max: 1600 }
      ];
      var blobs = await Promise.all(targets.map(async function (target) {
        var scale = Math.min(1, target.max / Math.max(drawable.width, drawable.height));
        var width = Math.max(1, Math.round(drawable.width * scale));
        var height = Math.max(1, Math.round(drawable.height * scale));
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is unavailable for image size generation.");
        context.drawImage(drawable.image, 0, 0, width, height);
        return { key: base + "/" + target.name + ".webp", blob: await canvasWebp(canvas) };
      }));
      var completed = 0;
      await Promise.all(blobs.map(function (variant) {
        return uploadObject(variant.blob, variant.key, "image/webp", null, signal).then(function () {
          completed++;
          if (typeof onVariant === "function") onVariant(completed, blobs.length);
        });
      }));
      return base;
    } finally {
      drawable.close();
    }
  }

  async function upload(file, options) {
    options = options || {};
    var kind = options.kind || (file && file.type && file.type.indexOf("video") === 0 ? "video" : "photo");
    emitProgress(options, { stage: "checking", percent: 8 });
    checkSize(file, kind);
    emitProgress(options, { stage: "measuring", percent: 12 });
    var dims = await mediaSize(file);
    var key = objectKey(kind, file);
    var contentType = (file && file.type) || (kind === "video" ? "video/webm" : "image/jpeg");
    emitProgress(options, { stage: "signing", percent: 16, total: (file && file.size) || 0, loaded: 0 });
    await uploadObject(file, key, contentType, function (ev) {
      var percent = 16 + Math.round((ev.ratio || 0) * 62);
      emitProgress(options, { stage: "uploading", percent: percent, loaded: ev.loaded, total: ev.total });
    }, options.signal);

    var processedKey = "";
    if (kind !== "video" && file && /^image\//i.test(file.type || "")) {
      emitProgress(options, { stage: "sizes", percent: 80 });
      try {
        processedKey = await createImageVariants(file, variantId(), function (done, total) {
          var percent = 80 + Math.round((done / total) * 14);
          emitProgress(options, { stage: "sizes", percent: percent, done: done, totalSizes: total });
        }, options.signal);
      } catch (variantError) {
        if (variantError && variantError.name === "AbortError") throw variantError;
        console.warn("[HshsStorage] Image variants could not be generated:", variantError && variantError.message);
      }
    }

    emitProgress(options, { stage: "uploaded", percent: 96 });
    return {
      url: publicUrl(key),
      key: key,
      processedKey: processedKey,
      variantKeys: processedKey ? {
        thumb: processedKey + "/thumb.webp",
        medium: processedKey + "/medium.webp",
        large: processedKey + "/large.webp"
      } : null,
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
    emitProgress(options, { stage: "reading", percent: 4 });
    var res = await fetch(src);
    if (!res.ok) throw new Error("Could not read the file for upload");
    var blob = await res.blob();
    var file = new File([blob], "capture." + (kind === "video" ? "webm" : "jpg"), {
      type: blob.type || (kind === "video" ? "video/webm" : "image/jpeg")
    });
    return upload(file, options);
  }

  async function uploadAdmin(file, options) {
    options = options || {};
    if (!file) throw new Error("No file");
    var kind = (file.type && file.type.indexOf("video") === 0) ? "video" : "photo";
    checkSize(file, kind);
    var dims = await mediaSize(file);
    var allowed = kind === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp"];
    if (allowed.indexOf(file.type) === -1) throw new Error("Unsupported file type");
    var token = await (g.auth && g.auth.currentUser ? g.auth.currentUser.getIdToken() : Promise.reject(new Error("Not signed in")));
    var base = workerBase();
    emitProgress(options, { stage: "signing", percent: 8 });
    var data = await new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", base + "/admin/upload");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-Type", file.type);
      if (options.signal) {
        if (options.signal.aborted) { reject(Object.assign(new Error("Upload cancelled"), { name: "AbortError" })); return; }
        options.signal.addEventListener("abort", function () { try { xhr.abort(); } catch (e) {} });
      }
      if (xhr.upload) {
        xhr.upload.onprogress = function (ev) {
          var total = ev.lengthComputable && ev.total ? ev.total : (file.size || 0);
          var ratio = total ? ev.loaded / total : 0;
          emitProgress(options, { stage: "uploading", percent: 8 + Math.round(ratio * 88), loaded: ev.loaded, total: total });
        };
      }
      xhr.onload = function () {
        var body = {};
        try { body = JSON.parse(xhr.responseText || "{}"); } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body.error || "Upload failed"));
      };
      xhr.onerror = function () { reject(new Error("Upload failed")); };
      xhr.onabort = function () { reject(Object.assign(new Error("Upload cancelled"), { name: "AbortError" })); };
      xhr.send(file);
    });
    emitProgress(options, { stage: "uploaded", percent: 96 });
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
    generateVariants: function (file) { return createImageVariants(file, variantId()); },
    uploadAdmin: uploadAdmin,
    list: list,
    objectKey: objectKey,
    publicUrl: publicUrl,
    mediaUrl: mediaUrl,
    onMediaError: onMediaError,
    publicBase: publicBase,
    r2Config: r2Config,
    mediaSize: mediaSize,
    provider: function () {
      var r = r2Config();
      return r && r.signUrl ? "cloudflare-r2" : (cfg.provider || "local");
    }
  };
  installMediaGuards();

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
