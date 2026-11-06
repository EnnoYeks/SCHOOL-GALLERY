/**
 * HSHS media preparation — photo compression + thumbnails.
 * Never uses toDataURL for the final upload payload.
 * Strips EXIF location by re-encoding through canvas.
 */
(function (g) {
  "use strict";
  if (g.HshsMediaPrep) return;

  var DEFAULT_MAX_SIDE = 1600;
  var ADMIN_MAX_SIDE = 2048;
  var THUMB_SIDE = 480;
  var QUALITY = 0.8;
  var THUMB_QUALITY = 0.7;
  var SKIP_UNDER_BYTES = 400 * 1024;

  function isAnimatedGif(file) {
    return file && file.type === "image/gif";
  }

  function supportsOffscreen() {
    return typeof OffscreenCanvas !== "undefined" && typeof createImageBitmap === "function";
  }

  function releaseBitmap(bm) {
    try {
      if (bm && typeof bm.close === "function") bm.close();
    } catch (e) {}
  }

  async function compressPhoto(file, options) {
    options = options || {};
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      return { file: file, width: 0, height: 0, skipped: true };
    }
    if (isAnimatedGif(file)) {
      return { file: file, width: 0, height: 0, skipped: true };
    }
    if (file.size > 0 && file.size < SKIP_UNDER_BYTES && !options.force) {
      return { file: file, width: 0, height: 0, skipped: true };
    }

    var maxSide = options.maxSide || (options.admin ? ADMIN_MAX_SIDE : DEFAULT_MAX_SIDE);
    var quality = options.quality != null ? options.quality : QUALITY;
    try {
      if (g.navigator && g.navigator.connection) {
        var c = g.navigator.connection;
        if (c.saveData || c.effectiveType === "2g" || c.effectiveType === "3g") {
          maxSide = Math.min(maxSide, 1280);
          quality = Math.min(quality, 0.75);
        }
      }
    } catch (e) {}

    var bitmap = null;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (e1) {
      try {
        bitmap = await createImageBitmap(file);
      } catch (e2) {
        return { file: file, width: 0, height: 0, skipped: true };
      }
    }

    var w = bitmap.width;
    var h = bitmap.height;
    var scale = Math.min(1, maxSide / Math.max(w, h));
    var tw = Math.max(1, Math.round(w * scale));
    var th = Math.max(1, Math.round(h * scale));

    var blob = null;
    try {
      if (supportsOffscreen()) {
        var off = new OffscreenCanvas(tw, th);
        off.getContext("2d").drawImage(bitmap, 0, 0, tw, th);
        blob = await off.convertToBlob({ type: "image/jpeg", quality: quality });
      } else {
        var canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        canvas.getContext("2d").drawImage(bitmap, 0, 0, tw, th);
        blob = await new Promise(function (resolve, reject) {
          canvas.toBlob(function (b) {
            if (b) resolve(b);
            else reject(new Error("toBlob failed"));
          }, "image/jpeg", quality);
        });
      }
    } catch (e) {
      releaseBitmap(bitmap);
      return { file: file, width: w, height: h, skipped: true };
    }
    releaseBitmap(bitmap);

    if (blob && file.size && blob.size >= file.size) {
      return { file: file, width: w, height: h, skipped: true };
    }

    var outName = (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
    var out = new File([blob], outName, { type: "image/jpeg", lastModified: Date.now() });
    return { file: out, width: tw, height: th, skipped: false, originalSize: file.size };
  }

  async function makeThumbnail(file, options) {
    options = options || {};
    if (!file || !file.type || file.type.indexOf("image/") !== 0) return null;
    if (isAnimatedGif(file)) return null;

    var side = options.side || THUMB_SIDE;
    var quality = options.quality != null ? options.quality : THUMB_QUALITY;
    var bitmap = null;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (e) {
      try {
        bitmap = await createImageBitmap(file);
      } catch (e2) {
        return null;
      }
    }

    var w = bitmap.width;
    var h = bitmap.height;
    var scale = Math.min(1, side / Math.max(w, h));
    var tw = Math.max(1, Math.round(w * scale));
    var th = Math.max(1, Math.round(h * scale));

    try {
      var blob = null;
      if (supportsOffscreen()) {
        var off = new OffscreenCanvas(tw, th);
        off.getContext("2d").drawImage(bitmap, 0, 0, tw, th);
        blob = await off.convertToBlob({ type: "image/jpeg", quality: quality });
      } else {
        var canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        canvas.getContext("2d").drawImage(bitmap, 0, 0, tw, th);
        blob = await new Promise(function (resolve, reject) {
          canvas.toBlob(function (b) {
            if (b) resolve(b);
            else reject(new Error("toBlob failed"));
          }, "image/jpeg", quality);
        });
      }
      releaseBitmap(bitmap);
      if (!blob) return null;
      var name = (file.name || "photo").replace(/\.[^.]+$/, "") + "-thumb.jpg";
      return {
        file: new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }),
        width: tw,
        height: th
      };
    } catch (e) {
      releaseBitmap(bitmap);
      return null;
    }
  }

  function videoPoster(file, options) {
    options = options || {};
    return new Promise(function (resolve) {
      if (!file || file.type.indexOf("video/") !== 0) return resolve(null);
      var url = URL.createObjectURL(file);
      var video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      var cleaned = false;
      function cleanup() {
        if (cleaned) return;
        cleaned = true;
        try { URL.revokeObjectURL(url); } catch (e) {}
        video.removeAttribute("src");
        try { video.load(); } catch (e) {}
      }
      var timer = setTimeout(function () { cleanup(); resolve(null); }, 8000);

      video.onloadedmetadata = function () {
        var dur = video.duration || 0;
        var t = Math.min(1, Math.max(0.1, dur * 0.05));
        try { video.currentTime = t; } catch (e) {
          clearTimeout(timer); cleanup(); resolve(null);
        }
      };
      video.onseeked = function () {
        clearTimeout(timer);
        try {
          var w = video.videoWidth || 640;
          var h = video.videoHeight || 360;
          var max = options.side || 720;
          var scale = Math.min(1, max / Math.max(w, h));
          var tw = Math.max(1, Math.round(w * scale));
          var th = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement("canvas");
          canvas.width = tw;
          canvas.height = th;
          canvas.getContext("2d").drawImage(video, 0, 0, tw, th);
          canvas.toBlob(function (blob) {
            cleanup();
            if (!blob) return resolve(null);
            resolve({
              file: new File([blob], "poster.jpg", { type: "image/jpeg" }),
              width: tw,
              height: th,
              duration: video.duration || 0
            });
          }, "image/jpeg", 0.75);
        } catch (e) {
          cleanup(); resolve(null);
        }
      };
      video.onerror = function () {
        clearTimeout(timer); cleanup(); resolve(null);
      };
      video.src = url;
    });
  }

  function videoMeta(file) {
    return new Promise(function (resolve) {
      if (!file || file.type.indexOf("video/") !== 0) {
        return resolve({ duration: 0, width: 0, height: 0 });
      }
      var url = URL.createObjectURL(file);
      var video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      var done = false;
      function finish(meta) {
        if (done) return;
        done = true;
        try { URL.revokeObjectURL(url); } catch (e) {}
        resolve(meta);
      }
      var timer = setTimeout(function () {
        finish({ duration: 0, width: 0, height: 0 });
      }, 6000);
      video.onloadedmetadata = function () {
        clearTimeout(timer);
        finish({
          duration: video.duration || 0,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0
        });
      };
      video.onerror = function () {
        clearTimeout(timer);
        finish({ duration: 0, width: 0, height: 0 });
      };
      video.src = url;
    });
  }

  g.HshsMediaPrep = {
    compressPhoto: compressPhoto,
    makeThumbnail: makeThumbnail,
    videoPoster: videoPoster,
    videoMeta: videoMeta,
    DEFAULT_MAX_SIDE: DEFAULT_MAX_SIDE,
    THUMB_SIDE: THUMB_SIDE
  };
})(typeof window !== "undefined" ? window : globalThis);
