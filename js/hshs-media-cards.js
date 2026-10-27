/* HSHS World media helpers. No external dependencies. */
(function (g) {
  'use strict';
  if (g.HshsMediaCards) return;

  var posterCache = new Map();
  var viewedFallback = new Set();
  var reducedMotion = !!(g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function dataSaver() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return reducedMotion || !!(c && (c.saveData || /^(2g|3g)$/i.test(c.effectiveType || '')));
  }
  function hasViewed(id) {
    try { return sessionStorage.getItem('hshs-view-' + id) === '1'; }
    catch (_) { return viewedFallback.has(String(id)); }
  }
  function markViewed(id) {
    viewedFallback.add(String(id));
    try { sessionStorage.setItem('hshs-view-' + id, '1'); } catch (_) {}
  }
  async function incrementViews(id) {
    if (!id || hasViewed(id)) return false;
    var sb = g.supabase;
    if (!sb || typeof sb.rpc !== 'function') return false;
    try {
      var result = await sb.rpc('increment_video_views', { video_id: id });
      if (result && result.error) throw result.error;
      markViewed(id);
      return true;
    } catch (e) {
      console.warn('[HSHS media] View count was not saved:', e && e.message);
      return false;
    }
  }
  function capturePoster(url, cb, videoId) {
    if (!url || dataSaver()) { cb(''); return; }
    var key = String(videoId || url);
    if (posterCache.has(key)) { cb(posterCache.get(key)); return; }
    var video = document.createElement('video');
    var done = false;
    function finish(value) {
      if (done) return; done = true;
      if (value) posterCache.set(key, value);
      video.pause(); video.removeAttribute('src'); video.load();
      cb(value || '');
    }
    video.muted = true; video.playsInline = true; video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    video.addEventListener('loadedmetadata', function () {
      var seek = Math.min(1, Math.max(0, (video.duration || 2) / 2));
      try { video.currentTime = seek; } catch (_) { finish(''); }
    }, { once: true });
    video.addEventListener('seeked', function () {
      try {
        var scale = Math.min(1, 640 / (video.videoWidth || 640));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round((video.videoWidth || 320) * scale));
        canvas.height = Math.max(1, Math.round((video.videoHeight || 180) * scale));
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.8));
      } catch (_) { finish(''); }
    }, { once: true });
    video.addEventListener('error', function () { finish(''); }, { once: true });
    video.src = url;
    video.load();
  }
  function keyedPhotoUpdate(grid, list, createCard) {
    if (!grid) return;
    var existing = new Map();
    Array.from(grid.children).forEach(function (node) {
      var id = node.getAttribute('data-photo-id');
      if (id) existing.set(id, node);
    });
    var keep = new Set();
    var cursor = grid.firstElementChild;
    list.forEach(function (photo) {
      var id = String(photo.id || photo.mediaKey || photo.media_key || '');
      keep.add(id);
      var node = existing.get(id) || createCard(photo);
      if (!node) return;
      if (node !== cursor) grid.insertBefore(node, cursor);
      cursor = node.nextElementSibling;
    });
    Array.from(grid.children).forEach(function (node) {
      var id = node.getAttribute('data-photo-id');
      if (id && !keep.has(id)) node.remove();
    });
  }
  function formatNumber(value) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0);
  }
  function timeAgo(value) {
    var date = value ? new Date(value).getTime() : 0;
    if (!date || !Number.isFinite(date)) return 'recently';
    var sec = Math.max(0, (Date.now() - date) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd';
    if (sec < 1814400) return Math.floor(sec / 604800) + 'w';
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(date));
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  g.HshsMediaCards = {
    capturePoster: capturePoster, incrementViews: incrementViews, hasViewed: hasViewed,
    keyedPhotoUpdate: keyedPhotoUpdate, dataSaver: dataSaver, formatNumber: formatNumber,
    timeAgo: timeAgo, escapeHtml: escapeHtml
  };
})(typeof window !== 'undefined' ? window : this);
