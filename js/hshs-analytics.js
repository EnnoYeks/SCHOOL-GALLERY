/**
 * HSHS World · Firebase Analytics helper
 * Safe init, page views, user id, and product events.
 */
(function (g) {
  if (g.__hshsAnalyticsBoot) return;
  g.__hshsAnalyticsBoot = true;

  var _analytics = null;
  var _logEvent = null;
  var _setUserId = null;
  var _setUserProps = null;
  var _ready = false;
  var _queue = [];

  function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  function flush() {
    if (!_ready || !_logEvent) return;
    while (_queue.length) {
      var item = _queue.shift();
      try {
        _logEvent(_analytics, item.name, item.params || {});
      } catch (e) {
        console.warn('[analytics]', e);
      }
    }
  }

  function track(name, params) {
    if (!name) return;
    var p = params || {};
    p.app_name = 'HSHS World';
    p.school = 'Hawthorne Scribner High School';
    if (!_ready) {
      _queue.push({ name: name, params: p });
      return;
    }
    try {
      _logEvent(_analytics, name, p);
    } catch (e) {
      console.warn('[analytics] logEvent', name, e);
    }
  }

  function setUser(user) {
    if (!_ready || !_setUserId) return;
    try {
      if (user && user.uid && !user.isAnonymous) {
        _setUserId(_analytics, user.uid);
        if (_setUserProps) {
          _setUserProps(_analytics, {
            sign_in_method: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'unknown',
            is_anonymous: 'false'
          });
        }
      } else {
        _setUserId(_analytics, null);
      }
    } catch (e) {
      console.warn('[analytics] setUserId', e);
    }
  }

  function pageView(pageName, pagePath) {
    var path = pagePath || (location.pathname + location.search);
    var title = pageName || document.title || 'HSHS World';
    track('page_view', {
      page_title: title,
      page_location: location.href,
      page_path: path
    });
  }

  function screenView(screenName) {
    track('screen_view', {
      firebase_screen: screenName || 'unknown',
      firebase_screen_class: 'HSHSWorld'
    });
  }

  var Events = {
    login: function (method) {
      track('login', { method: method || 'unknown' });
    },
    signUp: function (method) {
      track('sign_up', { method: method || 'email' });
    },
    logout: function () {
      track('logout', {});
    },
    uploadStart: function (type) {
      track('upload_start', { content_type: type || 'media' });
    },
    uploadComplete: function (type, board) {
      track('upload_complete', {
        content_type: type || 'media',
        board: board || 'general'
      });
    },
    like: function (contentType) {
      track('like', { content_type: contentType || 'post' });
    },
    comment: function () {
      track('comment', {});
    },
    share: function (method) {
      track('share', { method: method || 'app' });
    },
    search: function (term) {
      track('search', { search_term: String(term || '').slice(0, 80) });
    },
    profileEdit: function () {
      track('profile_edit', {});
    },
    openStudio: function (context) {
      track('open_studio', { context: context || 'unknown' });
    }
  };

  async function boot() {
    if (!isBrowser()) return;
    if (g.analytics && g.firebaseApp) {
      try {
        var mod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js');
        _analytics = g.analytics;
        _logEvent = mod.logEvent;
        _setUserId = mod.setUserId;
        _setUserProps = mod.setUserProperties;
        _ready = true;
        flush();
        bindHooks();
        pageView();
        return;
      } catch (e) {
        console.warn('[analytics] attach failed', e);
      }
    }

    try {
      if (!g.firebaseApp && g.firebaseConfig) {
        var appMod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js');
        g.firebaseApp = appMod.initializeApp(g.firebaseConfig);
      }
      if (g.firebaseApp) {
        var aMod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js');
        _analytics = aMod.getAnalytics(g.firebaseApp);
        _logEvent = aMod.logEvent;
        _setUserId = aMod.setUserId;
        _setUserProps = aMod.setUserProperties;
        g.analytics = _analytics;
        _ready = true;
        flush();
        bindHooks();
        pageView();
      }
    } catch (err) {
      console.warn('[analytics] init skipped:', err && err.message);
    }
  }

  function bindHooks() {
    document.addEventListener('hshs:auth', function (ev) {
      var user = ev.detail && ev.detail.user;
      setUser(user || null);
    });

    document.addEventListener('hshs:profile', function () {
      Events.profileEdit();
    });

    var lastPath = location.pathname;
    setInterval(function () {
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        pageView();
        var name = (lastPath.split('/').pop() || 'home').replace(/\.html$/, '') || 'home';
        screenView(name);
      }
    }, 800);

    document.addEventListener('click', function (e) {
      var t = e.target.closest('#openUploadStudio, .tab-upload, [data-open-studio]');
      if (t) Events.openStudio(location.pathname);
    }, true);
  }

  g.HshsAnalytics = {
    track: track,
    pageView: pageView,
    screenView: screenView,
    setUser: setUser,
    events: Events,
    isReady: function () { return _ready; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50);
    });
  } else {
    setTimeout(boot, 50);
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (_ready || ++tries > 40) {
      clearInterval(iv);
      return;
    }
    if (g.analytics || g.firebaseApp) boot();
  }, 250);
})(typeof window !== 'undefined' ? window : globalThis);
