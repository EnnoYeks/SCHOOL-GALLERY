(function (global) {
  'use strict';
  if (global.HshsRegistry) return;
  var ROUTES = {
    home: { path: 'index.html', module: 'home', template: 'home', title: 'HSHS World' },
    gallery: { path: 'index/gallery.html', module: 'gallery', template: 'gallery', title: 'Gallery · HSHS World' },
    photos: { path: 'index/photos.html', module: 'photos', template: 'photos', title: 'Photos · HSHS World' },
    videos: { path: 'index/videos.html', module: 'videos', template: 'videos', title: 'HSHS Studio · HSHS World' },
    vibe: { path: 'index/videos.html', module: 'videos', template: 'videos', title: 'HSHS Studio · HSHS World', alias: true },
    trending: { path: 'index/trending.html', module: 'trending', template: 'trending', title: 'Trending · HSHS World' },
    polls: { path: 'index/polls.html', module: 'polls', template: 'polls', title: 'Polls · HSHS World' },
    memories: { path: 'index/memories.html', module: 'memories', template: 'memories', title: 'Memories · HSHS World' },
    more: { path: 'index/more.html', module: 'more', template: 'more', title: 'More · HSHS World' },
    about: { path: 'index/about.html', module: 'about', template: 'about', title: 'About · HSHS World' },
    contact: { path: 'index/contact.html', module: 'contact', template: 'contact', title: 'Contact · HSHS World' },
    profile: { path: 'index/profile.html', module: 'profile', template: 'profile', title: 'Profile · HSHS World' },
    settings: { path: 'index/settings.html', module: 'settings', template: 'settings', title: 'Settings · HSHS World' },
    notifications: { path: 'index/notifications.html', module: 'notifications', template: 'notifications', title: 'Notifications · HSHS World' },
    saved: { path: 'index/saved.html', module: 'saved', template: 'saved', title: 'Saved · HSHS World' },
    buzz: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World' },
    clips: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World', alias: true },
    shorts: { path: 'index/buzz.html', module: 'buzz', template: 'buzz', title: 'Vibe · HSHS World', alias: true },
    chat: { path: 'index/chat.html', module: 'chat', template: 'chat', title: 'Chat · HSHS World' },
    admin: { path: 'index/admin.html', module: 'admin', template: 'admin', title: 'Admin · HSHS World' },
    spotlight: { path: 'index/spotlight.html', module: 'spotlight', template: 'spotlight', title: 'Spotlight · HSHS World' }
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
