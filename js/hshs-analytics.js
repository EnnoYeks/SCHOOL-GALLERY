/**
 * HSHS World · Firebase Analytics — custom user events
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
  var MAX_PARAM = 100;

  function clean(params) {
    var out = {
      app_name: 'HSHS World',
      school: 'Hawthorne Scribner'
    };
    if (!params) return out;
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v == null) return;
      if (typeof v === 'string') out[k] = v.slice(0, MAX_PARAM);
      else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
      else out[k] = String(v).slice(0, MAX_PARAM);
    });
    return out;
  }

  function track(name, params) {
    if (!name) return;
    name = String(name).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
    var p = clean(params);
    if (!_ready) {
      _queue.push({ name: name, params: p });
      return;
    }
    try {
      _logEvent(_analytics, name, p);
      if (g.__HSHS_ANALYTICS_DEBUG) console.debug('[GA]', name, p);
    } catch (e) {
      console.warn('[analytics]', name, e);
    }
  }

  function flush() {
    if (!_ready || !_logEvent) return;
    while (_queue.length) {
      var item = _queue.shift();
      try { _logEvent(_analytics, item.name, item.params); } catch (e) {}
    }
  }

  function setUser(user) {
    if (!_ready || !_setUserId) return;
    try {
      if (user && user.uid && !user.isAnonymous) {
        _setUserId(_analytics, user.uid);
        if (_setUserProps) {
          _setUserProps(_analytics, {
            sign_in_method: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'password',
            is_anonymous: 'false'
          });
        }
      } else {
        _setUserId(_analytics, null);
      }
    } catch (e) {}
  }

  function pageView(pageName) {
    var path = location.pathname + location.search;
    track('page_view', {
      page_title: pageName || document.title || 'HSHS World',
      page_location: location.href,
      page_path: path
    });
  }

  function screenView(screen) {
    track('screen_view', {
      firebase_screen: screen || 'unknown',
      firebase_screen_class: 'HSHSWorld'
    });
  }

  var Events = {
    login: function (method) { track('login', { method: method || 'unknown' }); },
    signUp: function (method) { track('sign_up', { method: method || 'email' }); },
    logout: function () { track('logout', {}); },
    uploadStart: function (type) { track('upload_start', { content_type: type || 'media' }); },
    uploadComplete: function (type, board) {
      track('upload_complete', { content_type: type || 'media', board: board || 'general' });
    },
    uploadCancel: function () { track('upload_cancel', {}); },
    viewPost: function (postId, type) {
      track('view_item', { item_id: postId || '', content_type: type || 'post' });
    },
    like: function (postId, contentType) {
      track('like', { item_id: postId || '', content_type: contentType || 'post' });
    },
    unlike: function (postId) { track('unlike', { item_id: postId || '' }); },
    comment: function (postId) { track('comment', { item_id: postId || '' }); },
    share: function (postId, method) {
      track('share', { item_id: postId || '', method: method || 'app' });
    },
    save: function (postId) { track('save_post', { item_id: postId || '' }); },
    search: function (term) { track('search', { search_term: String(term || '').slice(0, 80) }); },
    selectContent: function (contentType, itemId) {
      track('select_content', { content_type: contentType || 'unknown', item_id: itemId || '' });
    },
    openStudio: function (context) { track('open_studio', { context: context || 'unknown' }); },
    openGallery: function (section) { track('open_gallery', { section: section || 'all' }); },
    tabSwitch: function (tab) { track('tab_switch', { tab: tab || '' }); },
    follow: function (userId) { track('follow', { target_uid: userId || '' }); },
    unfollow: function (userId) { track('unfollow', { target_uid: userId || '' }); },
    profileView: function (userId) { track('profile_view', { target_uid: userId || '' }); },
    profileEdit: function () { track('profile_edit', {}); },
    messageStart: function () { track('message_start', {}); },
    notificationOpen: function () { track('notification_open', {}); },
    moreMenuOpen: function () { track('more_menu_open', {}); },
    themeChange: function (mode) { track('theme_change', { mode: mode || '' }); },
    error: function (code, message) {
      track('app_error', { error_code: code || 'unknown', message: String(message || '').slice(0, 80) });
    }
  };

  async function boot() {
    if (typeof window === 'undefined') return;

    async function attach(instance) {
      var mod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js');
      _analytics = instance;
      _logEvent = mod.logEvent;
      _setUserId = mod.setUserId;
      _setUserProps = mod.setUserProperties;
      _ready = true;
      flush();
      pageView();
      screenView((location.pathname.split('/').pop() || 'home').replace(/\.html$/, '') || 'home');
    }

    try {
      if (g.analytics) {
        await attach(g.analytics);
        return;
      }
      if (g.firebaseApp) {
        var aMod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js');
        var inst = aMod.getAnalytics(g.firebaseApp);
        g.analytics = inst;
        await attach(inst);
        return;
      }
      if (g.firebaseConfig) {
        var appMod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js');
        if (!g.firebaseApp) g.firebaseApp = appMod.initializeApp(g.firebaseConfig);
        var aMod2 = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js');
        var inst2 = aMod2.getAnalytics(g.firebaseApp);
        g.analytics = inst2;
        await attach(inst2);
      }
    } catch (err) {
      console.warn('[analytics] init skipped:', err && err.message);
    }
  }

  g.HshsAnalytics = {
    track: track,
    pageView: pageView,
    screenView: screenView,
    setUser: setUser,
    events: Events,
    isReady: function () { return _ready; },
    debug: function (on) { g.__HSHS_ANALYTICS_DEBUG = !!on; }
  };

  g.hshsTrack = track;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 40); });
  } else {
    setTimeout(boot, 40);
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (_ready || ++tries > 50) { clearInterval(iv); return; }
    if (g.analytics || g.firebaseApp || g.firebaseConfig) boot();
  }, 200);
})(typeof window !== 'undefined' ? window : globalThis);
