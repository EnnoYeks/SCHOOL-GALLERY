/**
 * HSHS Router – modular routing on top of existing mobile-shell navigate.
 */
(function (global) {
  'use strict';
  if (global.HshsRouter) return;
  var ROUTES = {
    home: { path: 'index.html', title: 'HSHS World' },
    gallery: { path: 'index/gallery.html', title: 'Gallery' },
    photos: { path: 'index/photos.html', title: 'Photos' },
    videos: { path: 'index/videos.html', title: 'Vibe' },
    vibe: { path: 'index/videos.html', title: 'Vibe' },
    trending: { path: 'index/trending.html', title: 'Trending' },
    spotlight: { path: 'index/spotlight.html', title: 'Spotlight' },
    polls: { path: 'index/polls.html', title: 'Polls' },
    memories: { path: 'index/memories.html', title: 'Memories' },
    more: { path: 'index/more.html', title: 'More' },
    about: { path: 'index/about.html', title: 'About' },
    contact: { path: 'index/contat.html', title: 'Contact' },
    contat: { path: 'index/contat.html', title: 'Contact' },
    profile: { path: 'index/profile.html', title: 'Profile' },
    settings: { path: 'index/settings.html', title: 'Settings' },
    notifications: { path: 'index/notifications.html', title: 'Notifications' },
    saved: { path: 'index/saved.html', title: 'Saved' },
    buzz: { path: 'index/buzz.html', title: 'Buzz' },
    clips: { path: 'index/buzz.html', title: 'Buzz' },
    chat: { path: 'index/chat.html', title: 'Chat' },
    admin: { path: 'index/admin.html', title: 'Admin' }
  };
  function resolve(nameOrUrl) {
    if (!nameOrUrl) return null;
    var key = String(nameOrUrl).toLowerCase().replace(/^\//, '').replace(/\.html$/, '');
    if (ROUTES[key]) return ROUTES[key];
    for (var k in ROUTES) { if (ROUTES[k].path.indexOf(key) !== -1) return ROUTES[k]; }
    return null;
  }
  function currentFile() {
    try { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }
    catch (e) { return 'index.html'; }
  }
  function toAbsolute(path) {
    try { return new URL(path, location.href).href; } catch (e) { return path; }
  }
  function navigate(nameOrUrl, options) {
    options = options || {};
    var route = resolve(nameOrUrl);
    var target = route ? toAbsolute(route.path) : toAbsolute(nameOrUrl);
    if (global.HshsApp) {
      global.HshsApp.setState({
        navigating: true,
        previousRoute: global.HshsApp.getState().currentRoute,
        currentRoute: route ? route.path : target
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
    } catch (e) {
      if (global.HshsApp) global.HshsApp.reportError(e, 'router.fallback');
      return false;
    }
  }
  global.HshsRouter = {
    routes: ROUTES, resolve: resolve, navigate: navigate, go: navigate,
    back: function () { history.back(); },
    forward: function () { history.forward(); },
    getRoutes: function () { return Object.assign({}, ROUTES); },
    isActive: function (name) {
      var route = resolve(name); if (!route) return false;
      var file = currentFile();
      var routeFile = route.path.split('/').pop().toLowerCase();
      if (file === 'index.html' || file === '') return routeFile === 'index.html';
      return file === routeFile;
    },
    currentFile: currentFile
  };
  global.hshsGo = navigate;
})(typeof window !== 'undefined' ? window : this);
