/* HSHS modern media helpers — used by videos.js and photos.js */
(function (g) {
  'use strict';
  if (g.HshsMediaCards) return;

  // Session-based view tracking
  var viewed = {};
  function hasViewed(id) {
    try { return !!sessionStorage.getItem('hshs-view-' + id); } catch (e) { return !!viewed[id]; }
  }
  function markViewed(id) {
    viewed[id] = true;
    try { sessionStorage.setItem('hshs-view-' + id, '1'); } catch (e) {}
  }

  // Capture a poster frame from a video element (client-side, cached in memory)
  var posterCache = {};
  function capturePoster(videoUrl, cb) {
    if (posterCache[videoUrl]) return cb(posterCache[videoUrl]);
    var v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.preload = 'metadata';
    v.muted = true;
    v.src = videoUrl;
    v.addEventListener('loadeddata', function () {
      try {
        v.currentTime = Math.min(1, (v.duration || 2) * 0.1);
      } catch (e) {}
    });
    v.addEventListener('seeked', function () {
      try {
        var c = document.createElement('canvas');
        c.width = v.videoWidth || 320;
        c.height = v.videoHeight || 180;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', 0.7);
        posterCache[videoUrl] = url;
        cb(url);
      } catch (e) { cb(''); }
      v.removeAttribute('src');
      v.load();
    });
    v.addEventListener('error', function () { cb(''); });
  }

  // Supabase view increment (falls back silently)
  async function incrementViews(id) {
    if (!id || hasViewed(id)) return;
    markViewed(id);
    try {
      if (g.supabase && g.supabase.rpc) {
        await g.supabase.rpc('increment_video_views', { video_id: id });
      } else if (g.db && g.db.queryTable) {
        // best-effort direct update if RPC not available
        await g.supabase.from('videos').update({ views: (await g.supabase.from('videos').select('views').eq('id', id).single()).data.views + 1 }).eq('id', id);
      }
    } catch (e) {
      console.warn('[HSHS] view count skipped', e && e.message);
    }
  }

  // Keyed photo grid update (avoids full innerHTML clear)
  function keyedPhotoUpdate(grid, list, createCard) {
    if (!grid) return;
    var existing = {};
    Array.from(grid.children).forEach(function (el) {
      var id = el.getAttribute('data-photo-id');
      if (id) existing[id] = el;
    });
    var frag = document.createDocumentFragment();
    var keep = {};
    list.forEach(function (photo) {
      var id = String(photo.id || '');
      keep[id] = true;
      if (existing[id]) {
        frag.appendChild(existing[id]);
      } else {
        frag.appendChild(createCard(photo));
      }
    });
    // remove ones no longer in list
    Object.keys(existing).forEach(function (id) {
      if (!keep[id]) existing[id].remove();
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  g.HshsMediaCards = {
    capturePoster: capturePoster,
    incrementViews: incrementViews,
    hasViewed: hasViewed,
    keyedPhotoUpdate: keyedPhotoUpdate
  };
})(typeof window !== 'undefined' ? window : this);
