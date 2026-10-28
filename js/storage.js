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

  /** Build the public r2.dev URL for an object key. */
  function publicUrl(key) {
    if (!key) return "";
    if (/^https?:\/\//i.test(key)) return key;
    return publicBase() + "/" + String(key).replace(/^\/+/, "");
  }

  /** Prefer an existing URL; otherwise build one from mediaKey. */
  function mediaUrl(item) {
    if (!item) return "";
    var direct = item.image || item.imageUrl || item.thumbnailUrl || item.videoUrl || "";
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    if (item.mediaKey) return publicUrl(item.mediaKey);
    if (direct) return publicUrl(direct);
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

  /**
   * List objects from the Worker (/list). Returns array of { key, url, type, size }.
   * Worker must expose GET /list and return { objects: [{ key, size }] } or an array.
   */
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
      var raw = Array.isArray(data) ? data : (data.objects || data.items || []);
      return raw.map(function (item) {
        var key = typeof item === "string" ? item : (item.key || item.name || "");
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
          title: key.split("/").pop() || "HSHS moment",
          likes: 0,
          views: 0,
          size: (item && item.size) || 0,
          provider: "cloudflare-r2"
        };
      }).filter(function (o) { return o.key; });
    } catch (err) {
      console.warn("[HshsStorage] R2 list failed:", err && err.message);
      return [];
    }
  }

  /**
   * Upload a File/Blob. Returns { url, key, provider, kind, size }.
   * Primary path: Worker signs a PUT → file goes to R2 → public URL is r2.dev base + key.
   */
  async function upload(file, options) {
    options = options || {};
    var kind = options.kind || (file && file.type && file.type.indexOf("video") === 0 ? "video" : "photo");
    checkSize(file, kind);
    var dims = await mediaSize(file);

    var key = objectKey(kind, file);
    var r2 = r2Config();
    var signTarget = r2.signUrl || "";
    // Prefer /sign if the configured URL is the Worker root
    if (signTarget && !/\/sign\/?$/i.test(signTarget)) {
      signTarget = signTarget.replace(/\/$/, "") + "/sign";
    }

    if (signTarget) {
      try {
        var signRes = await fetch(signTarget, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: key,
            contentType: (file && file.type) || (kind === "video" ? "video/webm" : "image/jpeg"),
            size: file && file.size
          })
        });
        if (!signRes.ok) throw new Error("Sign failed " + signRes.status);
        var signed = await signRes.json();
        var putUrl = signed.url || signed.putUrl;
        if (!putUrl) throw new Error("No presigned URL");

        var put = await fetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": (file && file.type) || (kind === "video" ? "video/webm" : "image/jpeg")
          },
          body: file
        });
        if (!put.ok) throw new Error("R2 PUT failed " + put.status);

        return {
          url: publicUrl(key),
          key: key,
          provider: "cloudflare-r2",
          kind: kind,
          size: (file && file.size) || 0,
          width: dims.width,
          height: dims.height
        };
      } catch (err) {
        console.warn("[HshsStorage] R2 upload failed, local fallback:", err && err.message);
      }
    }

    // Local fallback only (never writes media into Firestore)
    if (kind === "photo" && typeof createImageBitmap === "function") {
      try {
        var bitmap = await createImageBitmap(file);
        var scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        return {
          url: dataUrl,
          key: key,
          provider: "local-dataurl",
          kind: kind,
          size: dataUrl.length,
          width: dims.width,
          height: dims.height
        };
      } catch (e) { /* fall through */ }
    }

    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve({
          url: String(reader.result),
          key: key,
          provider: "local-dataurl",
          kind: kind,
          size: (file && file.size) || 0,
          width: dims.width,
          height: dims.height
        });
      };
      reader.onerror = reject;
      if (kind === "video") {
        try {
          var obj = URL.createObjectURL(file);
          resolve({
            url: obj,
            key: key,
            provider: "local-blob",
            kind: kind,
            size: (file && file.size) || 0,
          width: dims.width,
          height: dims.height
          });
          return;
        } catch (e) {}
      }
      reader.readAsDataURL(file);
    });
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
      return {
        url: src,
        key: objectKey(kind, null),
        provider: "passthrough",
        kind: kind,
        size: 0
      };
    }
  }

  /** Admin upload: validates type/size then PUTs to /admin/upload with token. */
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
})(typeof window !== "undefined" ? window : globalThis);
