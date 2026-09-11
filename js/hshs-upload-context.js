/**
 * HSHS upload context — bottom + opens Studio; lock destination to current section.
 */
(function () {
  if (window.__hshsUploadContext) return;
  window.__hshsUploadContext = true;

  var PAGE_DEST = {
    'gallery.html': 'gallery',
    'photos.html': 'photos',
    'videos.html': 'buzz',
    'buzz.html': 'vibe',
    'clips.html': 'vibe',
    'shorts.html': 'vibe',
    'spotlight.html': 'spotlight',
    'memories.html': 'memories',
    'trending.html': 'trending'
  };

  var lockedDest = null;
  var names = {
    gallery: 'Gallery', photos: 'Photos', buzz: 'Buzz', vibe: 'Vibe',
    spotlight: 'Spotlight', memories: 'Memories', trending: 'Trending'
  };

  function destinationFromPath(pathname) {
    var file = ((pathname || location.pathname).split('/').pop() || '').toLowerCase();
    return PAGE_DEST[file] || null;
  }

  window.__hshsUploadDestinationFromPath = destinationFromPath;

  function applyBoardLock() {
    if (!lockedDest) return;
    var rows = document.querySelectorAll('.hshs-create-form .hshs-row[data-act="boards"]');
    rows.forEach(function (row) {
      var nice = names[lockedDest] || lockedDest;
      row.outerHTML = '<div class="hshs-row hshs-row-locked"><span>Posting to</span><strong>' + nice + '</strong></div>';
    });
  }

  function openForPage(pathname) {
    var dest = destinationFromPath(pathname);
    var open = window.__hshsOpenUpload;
    if (typeof open !== 'function') {
      console.warn('[upload-context] Studio not ready');
      return false;
    }
    lockedDest = dest || null;
    if (dest) {
      var preferVideo = dest === 'vibe' || dest === 'buzz';
      open({
        destinations: [dest],
        lockDestinations: true,
        fromPage: dest,
        prefer: preferVideo ? 'video' : undefined
      });
    } else {
      open();
    }
    setTimeout(applyBoardLock, 80);
    setTimeout(applyBoardLock, 400);
    return true;
  }

  window.__hshsOpenUploadForPage = openForPage;

  function enhanceOpen() {
    var orig = window.__hshsOpenUpload;
    if (typeof orig !== 'function' || orig.__hshsContextWrapped) return;
    function wrapped(opts) {
      opts = opts || {};
      if (opts.lockDestinations || opts.fromPage) {
        lockedDest = opts.fromPage || (opts.destinations && opts.destinations[0]) || lockedDest;
      } else if (!opts.destinations) {
        lockedDest = null;
      }
      var result = orig.call(this, opts);
      setTimeout(applyBoardLock, 80);
      setTimeout(applyBoardLock, 400);
      return result;
    }
    wrapped.__hshsContextWrapped = true;
    window.__hshsOpenUpload = wrapped;
  }

  function rebindUploadButton() {
    var btn = document.getElementById('openUploadStudio');
    if (!btn || btn.__hshsContextBound) return;
    btn.__hshsContextBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openForPage(location.pathname);
    }, true);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('#openUploadStudio, .tab-upload, [data-open-studio], .js-open-studio, a[href="#upload"]');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    openForPage(location.pathname);
  }, true);

  // When compose UI re-renders (after capture), re-apply lock
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function () {
      if (lockedDest) applyBoardLock();
    });
    function watchStudio() {
      var root = document.getElementById('hshsStudio');
      if (root && !root.__hshsContextObserved) {
        root.__hshsContextObserved = true;
        mo.observe(root, { childList: true, subtree: true });
      }
    }
    setInterval(watchStudio, 500);
  }

  function boot() {
    enhanceOpen();
    rebindUploadButton();
    var n = 0;
    var iv = setInterval(function () {
      enhanceOpen();
      rebindUploadButton();
      if (++n > 40) clearInterval(iv);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
