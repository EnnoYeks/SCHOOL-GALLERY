// ============================================
// HSHS WORLD – STORAGE LAYER (Cloudflare R2 only)
// ============================================
// Media files never go into Firestore.
// Firestore holds metadata only. Public media URLs come from the r2.dev base.
// Uploads go through the hshs-r2-sign Worker (presigned PUT). No secrets in the client.

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

  /** Build the public r2.dev URL for an object key. */
  function publicUrl(key) {
    if (!key) return "";
    return publicBase() + "/" + String(key).replace(/^\/+/, "");
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

  function checkSize(file, kind) {
    var max = kind === "video" ? (cfg.maxVideoSize || 104857600) : (cfg.maxPhotoSize || 52428800);
    if (file && file.size && file.size > max) {
      throw new Error("File too large (max " + Math.round(max / 1048576) + " MB)");
    }
  }

  /**
   * Upload a File/Blob. Returns { url, key, provider, kind, size }.
   * Primary path: Worker signs a PUT → file goes to R2 → public URL is r2.dev base + key.
   * Fallback only if the Worker is unreachable (local preview).
   */
  async function upload(file, options) {
    options = options || {};
    var kind = options.kind || (file && file.type && file.type.indexOf("video") === 0 ? "video" : "photo");
    checkSize(file, kind);

    var key = objectKey(kind, file);
    var r2 = r2Config();

    if (r2 && r2.signUrl) {
      try {
        var signRes = await fetch(r2.signUrl, {
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
          size: (file && file.size) || 0
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
          size: dataUrl.length
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
          size: (file && file.size) || 0
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
            size: (file && file.size) || 0
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

  g.HshsStorage = {
    upload: upload,
    uploadFromUrl: uploadFromUrl,
    objectKey: objectKey,
    publicUrl: publicUrl,
    publicBase: publicBase,
    r2Config: r2Config,
    provider: function () {
      var r = r2Config();
      return r && r.signUrl ? "cloudflare-r2" : (cfg.provider || "local");
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
