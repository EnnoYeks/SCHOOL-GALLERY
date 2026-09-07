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
