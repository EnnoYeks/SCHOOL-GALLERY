/**
 * HSHS upload context — wires bottom + to Studio and locks destination to current page section.
 * Loads after hshs-upload.js / mobile-shell.js.
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

  function destinationFromPath(pathname) {
    var file = ((pathname || location.pathname).split('/').pop() || '').toLowerCase();
    return PAGE_DEST[file] || null;
  }

  window.__hshsUploadDestinationFromPath = destinationFromPath;

  function openForPage(pathname) {
    var dest = destinationFromPath(pathname);
    var open = window.__hshsOpenUpload;
    if (typeof open !== 'function') {
      console.warn('[upload-context] Studio not ready');
      return false;
    }
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
    return true;
  }

  window.__hshsOpenUploadForPage = openForPage;

  function enhanceOpen() {
    var orig = window.__hshsOpenUpload;
    if (typeof orig !== 'function' || orig.__hshsContextWrapped) return;
    function wrapped(opts) {
      opts = opts || {};
      var result = orig.call(this, opts);
      try {
        if (opts.lockDestinations || opts.fromPage) {
          setTimeout(function hideBoardPicker() {
            var rows = document.querySelectorAll('.hshs-create-form .hshs-row[data-act="boards"]');
            rows.forEach(function (row) {
              var label = (opts.fromPage || (opts.destinations && opts.destinations[0]) || 'this section');
              var names = {
                gallery: 'Gallery', photos: 'Photos', buzz: 'Buzz', vibe: 'Vibe',
                spotlight: 'Spotlight', memories: 'Memories', trending: 'Trending'
              };
              var nice = names[label] || label;
              row.outerHTML = '<div class="hshs-row hshs-row-locked"><span>Posting to</span><strong>' + nice + '</strong></div>';
            });
          }, 50);
        }
      } catch (e) {}
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
