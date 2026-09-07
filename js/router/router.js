/**
 * HSHS Router
 *
 * Phase 1 keeps the existing page files as the compatibility layer while
 * exposing clean application routes for the future single-shell SPA.
 */
(function (global) {
  'use strict';
  if (global.HshsRouter) return;

  var ROUTES = {
    home: { path: 'index.html', appPath: '/', title: 'HSHS World' },
    gallery: { path: 'index/gallery.html', appPath: '/gallery', title: 'Gallery' },
    photos: { path: 'index/photos.html', appPath: '/photos', title: 'Photos' },
    videos: { path: 'index/videos.html', appPath: '/videos', title: 'HSHS Studio' },
    vibe: { path: 'index/videos.html', appPath: '/vibe', title: 'HSHS Studio', alias: true },
    trending: { path: 'index/trending.html', appPath: '/trending', title: 'Trending' },
    spotlight: { path: 'index/spotlight.html', appPath: '/spotlight', title: 'Spotlight' },
    polls: { path: 'index/polls.html', appPath: '/polls', title: 'Polls' },
    memories: { path: 'index/memories.html', appPath: '/memories', title: 'Memories' },
    more: { path: 'index/more.html', appPath: '/more', title: 'More' },
    about: { path: 'index/about.html', appPath: '/about', title: 'About' },
    contact: { path: 'index/contact.html', appPath: '/contact', title: 'Contact' },
    contat: { path: 'index/contact.html', appPath: '/contact', title: 'Contact', alias: true },
    profile: { path: 'index/profile.html', appPath: '/profile', title: 'Profile' },
    settings: { path: 'index/settings.html', appPath: '/settings', title: 'Settings' },
    notifications: { path: 'index/notifications.html', appPath: '/notifications', title: 'Notifications' },
    saved: { path: 'index/saved.html', appPath: '/saved', title: 'Saved' },
    buzz: { path: 'index/buzz.html', appPath: '/buzz', title: 'Vibe' },
    clips: { path: 'index/buzz.html', appPath: '/buzz', title: 'Vibe', alias: true },
    shorts: { path: 'index/buzz.html', appPath: '/buzz', title: 'Vibe', alias: true },
    chat: { path: 'index/chat.html', appPath: '/chat', title: 'Chat' },
    admin: { path: 'index/admin.html', appPath: '/admin', title: 'Admin' }
  };

  function clean(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\.html$/, '');
  }

  function resolve(nameOrUrl) {
    if (!nameOrUrl) return null;
    var raw = String(nameOrUrl);
    var key = clean(raw);
    if (ROUTES[key]) return ROUTES[key];

    var pathname;
    try { pathname = new URL(raw, location.href).pathname; } catch (e) { pathname = raw; }
    var normalized = clean(pathname);
    var keys = Object.keys(ROUTES);
    for (var i = 0; i < keys.length; i++) {
      var route = ROUTES[keys[i]];
      if (clean(route.path) === normalized || clean(route.appPath) === normalized) return route;
      if (clean(route.path).split('/').pop() === normalized.split('/').pop()) return route;
    }
    return null;
  }

  function currentPath() {
    try { return location.pathname || '/'; } catch (e) { return '/'; }
  }

  function currentFile() {
    try {
      return (currentPath().split('/').pop() || 'index.html').toLowerCase();
    } catch (e) {
      return 'index.html';
    }
  }

  function active() {
    var file = currentFile();
    if (file === 'index.html' || file === '') return ROUTES.home;
    var hit = resolve(file);
    return hit || ROUTES.home;
  }

  function toAbsolute(path) {
    try { return new URL(path, location.href).href; } catch (e) { return path; }
  }

  function navigate(nameOrUrl, options) {
    options = options || {};
    var route = resolve(nameOrUrl);
    var target = route ? toAbsolute(route.path) : toAbsolute(nameOrUrl);

    if (global.HshsApp) {
      var state = global.HshsApp.getState();
      global.HshsApp.setState({
        navigating: true,
        previousRoute: state.currentRoute,
        currentRoute: route ? (route.appPath || route.path) : target
      });
    }

    if (typeof global.__hshsNavigate === 'function' && !options.forceReload) {
      try {
        global.__hshsNavigate(target, !!options.fromHistory);
        if (global.HshsApp) global.HshsApp.setState({ navigating: false });
        return true;
      } catch (err) {
        if (global.HshsApp) global.HshsApp.reportError(err, 'router.navigate');
      }
    }

    try {
      if (options.replace) location.replace(target);
      else location.assign(target);
      return true;
    } catch (err) {
      if (global.HshsApp) global.HshsApp.reportError(err, 'router.fallback');
      return false;
    }
  }

  global.HshsRouter = {
    routes: ROUTES,
    resolve: resolve,
    navigate: navigate,
    go: navigate,
    back: function () { history.back(); },
    forward: function () { history.forward(); },
    getRoutes: function () { return Object.assign({}, ROUTES); },
    activeRoute: active,
    currentPath: currentPath,
    currentFile: currentFile,
    isActive: function (name) {
      var route = resolve(name);
      if (!route) return false;
      return active() === route || (route.alias && active().path === route.path);
    }
  };

  global.hshsGo = navigate;
})(typeof window !== 'undefined' ? window : this);
