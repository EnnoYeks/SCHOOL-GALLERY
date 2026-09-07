(function (global) {
  'use strict';
  if (global.HshsRegistry) return;
  var ROUTES = {
    home: { path: 'index.html', module: 'home', template: 'home', title: 'HSHS World' },
    gallery: { path: 'index/gallery.html', module: 'gallery', template: 'gallery', title: 'Gallery \u00b7 HSHS World' },
    photos: { path: 'index/photos.html', module: 'photos', template: 'photos', title: 'Photos \u00b7 HSHS World' },
    videos: { path: 'index/videos.html', module: 'videos', template: 'videos', title: 'HSHS Studio \u00b7 HSHS World' },
    vibe: { path: 'index/videos.html', module: 'videos', template: 'videos', title: 'HSHS Studio \u00b7 HSHS World', alias: true },
    trending: { path: 'index/trending.html', module: 'trending', template: 'trending', title: 'Trending \u00b7 HSHS World' },
    polls: { path: 'index/polls.html', module: 'polls', template: 'polls', title: 'Polls \u00b7 HSHS World' },
    memories: { path: 'index/memories.html', module: 'memories', template: 'memories', title: 'Memories \u00b7 HSHS World' },
    more: { path: 'index/more.html', module: 'more', template: 'more', title: 'More \u00b7 HSHS World' },
    about: { path: 'index/about.html', module: 'about', template: 'about', title: 'About \u00b7 HSHS World' },
    contact: { path: 'index/contact.html', module: 'contact', template: 'contact', title: 'Contact \u00b7 HSHS World' },
    contat: { path: 'index/contact.html', module: 'contact', template: 'contact', title: 'Contact \u00b7 HSHS World', alias: true },
    profile: { path: 'index/profile.html', module: 'profile', template: 'profile', title: 'Profile \u00b7 HSHS World' },
    settings: { path: 'index/settings.html', module: 'settings', template: 'settings', title: 'Settings \u00b7 HSHS World' },
    notifications: { path: 'index/notifications.html', module: 'notifications', template: 'notifications', title: 'Notifications \u00b7 HSHS World' },
    saved: { path: 'index/saved.html', module: 'saved', template: 'saved', title: 'Saved \u00b7 HSHS World' },
    buzz: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe \u00b7 HSHS World' },
    clips: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe \u00b7 HSHS World', alias: true },
    shorts: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe \u00b7 HSHS World', alias: true },
    chat: { path: 'index/chat.html', module: 'chat', template: 'chat', title: 'Chat \u00b7 HSHS World' },
    admin: { path: 'index/admin.html', module: 'admin', template: 'admin', title: 'Admin \u00b7 HSHS World' },
    spotlight: { path: 'index/spotlight.html', module: 'spotlight', template: 'spotlight', title: 'Spotlight \u00b7 HSHS World' }
  };
  function currentFile() {
    try {
      var p = (location.pathname || '/').replace(/\/+$/, '');
      if (!p || p === '') return 'index.html';
      var parts = p.split('/');
      var last = parts[parts.length - 1] || 'index.html';
      if (last.indexOf('.') === -1) last = last + '.html';
      if (p.indexOf('/index/') !== -1 || (last !== 'index.html' && parts.indexOf('index') !== -1)) {
        return 'index/' + last.replace(/^index\//, '');
      }
      if (last === 'index.html') return 'index.html';
      return 'index/' + last;
    } catch (e) { return 'index.html'; }
  }
  function resolveByPath(file) {
    file = (file || '').toLowerCase().replace(/^\//, '');
    var keys = Object.keys(ROUTES);
    for (var i = 0; i < keys.length; i++) {
      var r = ROUTES[keys[i]];
      if (r.path.toLowerCase() === file) return { name: keys[i], route: r };
      var bare = r.path.split('/').pop();
      if (bare === file || bare === file.split('/').pop()) return { name: keys[i], route: r };
    }
    return null;
  }
  function activeRoute() {
    var file = currentFile();
    var hit = resolveByPath(file);
    if (hit) return hit;
    var bare = file.split('/').pop();
    var keys = Object.keys(ROUTES);
    for (var i = 0; i < keys.length; i++) {
      var r = ROUTES[keys[i]];
      if (r.path.split('/').pop() === bare) return { name: keys[i], route: r };
    }
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
