(function (global) {
  'use strict';
  if (global.HshsRegistry) return;
  var ROUTES = {
    home: { path: '/', module: 'home', template: 'home', title: 'HSHS World' },
    gallery: { path: '/gallery/', module: 'gallery', template: 'gallery', title: 'Gallery · HSHS World' },
    photos: { path: '/photos/', module: 'photos', template: 'photos', title: 'Photos · HSHS World' },
    videos: { path: '/videos/', module: 'videos', template: 'videos', title: 'HSHS Studio · HSHS World' },
    vibe: { path: '/videos/', module: 'videos', template: 'videos', title: 'HSHS Studio · HSHS World', alias: true },
    trending: { path: '/trending/', module: 'trending', template: 'trending', title: 'Trending · HSHS World' },
    polls: { path: '/polls/', module: 'polls', template: 'polls', title: 'Polls · HSHS World' },
    memories: { path: '/memories/', module: 'memories', template: 'memories', title: 'Memories · HSHS World' },
    more: { path: '/more/', module: 'more', template: 'more', title: 'More · HSHS World' },
    search: { path: '/search/', module: 'search', template: 'search', title: 'Search · HSHS World' },
    about: { path: '/about/', module: 'about', template: 'about', title: 'About · HSHS World' },
    contact: { path: '/contact/', module: 'contact', template: 'contact', title: 'Contact · HSHS World' },
    profile: { path: '/profile/', module: 'profile', template: 'profile', title: 'Profile · HSHS World' },
    settings: { path: '/settings/', module: 'settings', template: 'settings', title: 'Settings · HSHS World' },
    notifications: { path: '/notifications/', module: 'notifications', template: 'notifications', title: 'Notifications · HSHS World' },
    saved: { path: '/saved/', module: 'saved', template: 'saved', title: 'Saved · HSHS World' },
    buzz: { path: '/buzz/', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World' },
    clips: { path: '/buzz/', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World', alias: true },
    shorts: { path: '/buzz/', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World', alias: true },
    chat: { path: '/chat/', module: 'chat', template: 'chat', title: 'Chat · HSHS World' },
    admin: { path: '/admin/', module: 'admin', template: 'admin', title: 'Admin · HSHS World' },
    spotlight: { path: '/spotlight/', module: 'spotlight', template: 'spotlight', title: 'Spotlight · HSHS World' },
    login: { path: '/login/', module: 'login', template: 'login', title: 'Sign in · HSHS World' },
    'edit-profile': { path: '/edit-profile/', module: 'edit-profile', template: 'edit-profile', title: 'Edit profile · HSHS World' }
  };
  function currentFile() {
    try {
      var p = (location.pathname || '/').replace(/\/+$/, '') || '/';
      if (p === '' || p === '/') return '/';
      if (p.indexOf('/index/') !== -1) {
        var last = p.split('/').pop();
        return '/' + last.replace('.html', '') + '/';
      }
      return p.endsWith('/') ? p : p + '/';
    } catch (e) { return '/'; }
  }
  function resolveByPath(file) {
    file = (file || '').toLowerCase();
    var keys = Object.keys(ROUTES);
    for (var i = 0; i < keys.length; i++) {
      var r = ROUTES[keys[i]];
      if (r.path.toLowerCase() === file || r.path.toLowerCase().replace(/\/$/, '') === file.replace(/\/$/, '')) return { name: keys[i], route: r };
    }
    return null;
  }
  function activeRoute() {
    var file = currentFile();
    var hit = resolveByPath(file);
    if (hit) return hit;
    return { name: 'home', route: ROUTES.home };
  }
  global.HshsRegistry = {
    routes: ROUTES,
    currentFile: currentFile,
    resolveByPath: resolveByPath,
    activeRoute: activeRoute,
    list: function () { return Object.keys(ROUTES).filter(function (k) { return !ROUTES[k].alias; }); }
  };
})(typeof window !== 'undefined' ? window : this);
