/**
 * HSHS Router
 * Updated to prefer clean folder URLs.
 */
(function (global) {
  'use strict';
  if (global.HshsRouter) return;

  var ROUTES = {
    home: { path: '/', appPath: '/', title: 'HSHS World' },
    gallery: { path: '/gallery/', appPath: '/gallery', title: 'Gallery' },
    photos: { path: '/photos/', appPath: '/photos', title: 'Photos' },
    videos: { path: '/videos/', appPath: '/videos', title: 'HSHS Studio' },
    vibe: { path: '/buzz/', appPath: '/vibe', title: 'Vibe', alias: true },
    trending: { path: '/trending/', appPath: '/trending', title: 'Trending' },
    spotlight: { path: '/spotlight/', appPath: '/spotlight', title: 'Spotlight' },
    polls: { path: '/polls/', appPath: '/polls', title: 'Polls' },
    memories: { path: '/memories/', appPath: '/memories', title: 'Memories' },
    more: { path: '/more/', appPath: '/more', title: 'More' },
    about: { path: '/about/', appPath: '/about', title: 'About' },
    contact: { path: '/contact/', appPath: '/contact', title: 'Contact' },
    contat: { path: '/contact/', appPath: '/contact', title: 'Contact', alias: true },
    profile: { path: '/profile/', appPath: '/profile', title: 'Profile' },
    settings: { path: '/settings/', appPath: '/settings', title: 'Settings' },
    notifications: { path: '/notifications/', appPath: '/notifications', title: 'Notifications' },
    saved: { path: '/saved/', appPath: '/saved', title: 'Saved' },
    buzz: { path: '/buzz/', appPath: '/buzz', title: 'Vibe' },
    clips: { path: '/buzz/', appPath: '/buzz', title: 'Vibe', alias: true },
    shorts: { path: '/buzz/', appPath: '/buzz', title: 'Vibe', alias: true },
    chat: { path: '/chat/', appPath: '/chat', title: 'Chat' },
    admin: { path: '/admin/', appPath: '/admin', title: 'Admin' },
    login: { path: '/login/', appPath: '/login', title: 'Sign in' },
    'edit-profile': { path: '/edit-profile/', appPath: '/edit-profile', title: 'Edit profile' }
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
    }
    return null;
  }

  function currentPath() {
    try { return location.pathname || '/'; } catch (e) { return '/'; }
  }

  function currentFile() {
    try {
      if (global.HshsPaths) {
        var key = HshsPaths.key();
        return key === 'home' ? 'index.html' : key + '.html';
      }
      var p = currentPath().replace(/\/+$/, '') || '/';
      return p === '/' ? 'index.html' : p.split('/').pop();
    } catch (e) {
      return 'index.html';
    }
  }

  function active() {
    var file = currentFile();
    if (file === 'index.html' || file === '' || currentPath() === '/') return ROUTES.home;
    var hit = resolve(currentPath());
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
