(function (g) {
  'use strict';
  if (g.__hshsPeople) return;
  g.__hshsPeople = true;

  var cache = { users: [], at: 0 };

  function db() { return g.db || null; }
  function realUser() {
    var u = g.hshsAuthUser || (g.auth && g.auth.currentUser) || null;
    if (!u || u.isAnonymous) return null;
    return u;
  }
  function localProfile() {
    if (g.hshsProfile && g.hshsProfile.uid) return g.hshsProfile;
    try {
      var p = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (p && p.uid) return p;
    } catch (e) {}
    return null;
  }
  function shape(p) {
    if (!p) return null;
    return {
      id: p.uid || p.id || '',
      uid: p.uid || p.id || '',
      name: p.fullName || p.name || 'HSHS Student',
      fullName: p.fullName || p.name || 'HSHS Student',
      username: String(p.username || '').replace(/^@/, '').toLowerCase(),
      role: p.role || 'Student',
      classYear: p.classYear || '',
      house: p.house || '',
      bio: p.bio || '',
      email: p.email || '',
      avatar: p.photoURL || p.avatar || '',
      photoURL: p.photoURL || p.avatar || '',
      cover: p.coverURL || p.cover || '',
      coverURL: p.coverURL || p.cover || ''
    };
  }
  function me() {
    var user = realUser();
    var p = shape(localProfile());
    if (user) {
      return p && p.uid === user.uid ? p : shape({
        uid: user.uid,
        fullName: (p && p.name) || user.displayName || 'HSHS Student',
        username: (p && p.username) || '',
        email: user.email || (p && p.email) || '',
        photoURL: (p && p.photoURL) || user.photoURL || '',
        role: (p && p.role) || 'Student',
        classYear: (p && p.classYear) || ''
      });
    }
    return null;
  }
  function authState() {
    if (g.hshsAuthState) return g.hshsAuthState;
    if (realUser()) return 'authenticated';
    if (localProfile()) return 'authenticated';
    return g.HshsAuthApi ? 'loading' : 'guest';
  }

  async function listUsers(force) {
    var now = Date.now();
    if (!force && cache.users.length && now - cache.at < 20000) return cache.users.slice();
    var rows = [];
    if (db() && db().listUsers) rows = await db().listUsers(80);
    cache.users = rows || [];
    cache.at = now;
    var self = me();
    if (self && !cache.users.some(function (u) { return u.uid === self.uid; })) cache.users.unshift(self);
    return cache.users.slice();
  }

  async function getUser(uid) {
    if (!uid) return null;
    var hit = cache.users.filter(function (u) { return u.uid === uid || u.id === uid; })[0];
    if (hit) return hit;
    if (db() && db().getUser) return db().getUser(uid);
    return null;
  }

  async function getByUsername(username) {
    var value = String(username || '').replace(/^@/, '').toLowerCase();
    if (!value) return null;
    var hit = cache.users.filter(function (u) { return u.username === value; })[0];
    if (hit) return hit;
    if (db() && db().getUserByUsername) return db().getUserByUsername(value);
    return null;
  }

  async function search(q) {
    if (db() && db().searchUsers) return db().searchUsers(q, 24);
    var rows = await listUsers();
    var needle = String(q || '').toLowerCase().trim().replace(/^@/, '');
    if (!needle) return rows;
    return rows.filter(function (u) {
      return [u.name, u.username, u.role, u.classYear, u.bio].join(' ').toLowerCase().indexOf(needle) !== -1;
    });
  }

  async function toggleFollow(uid) {
    if (!realUser()) return { ok: false, error: 'Sign in first.', following: false };
    if (!db() || !db().toggleFollow) return { ok: false, error: 'Follow is not ready.', following: false };
    return db().toggleFollow(uid);
  }

  function profileUrl(user) {
    var base = location.pathname.indexOf('/index/') !== -1 ? '' : 'index/';
    if (!user) return base + 'profile.html';
    if (user.username) return base + 'profile.html?u=' + encodeURIComponent(user.username);
    return base + 'profile.html?uid=' + encodeURIComponent(user.uid || user.id || '');
  }

  function chatUrl(user) {
    var base = location.pathname.indexOf('/index/') !== -1 ? '' : 'index/';
    if (!user) return base + 'chat.html';
    var q = user.uid ? ('uid=' + encodeURIComponent(user.uid)) : ('u=' + encodeURIComponent(user.username || ''));
    return base + 'chat.html?' + q;
  }

  g.HshsPeople = {
    me: me,
    realUser: realUser,
    authState: authState,
    listUsers: listUsers,
    getUser: getUser,
    getByUsername: getByUsername,
    search: search,
    toggleFollow: toggleFollow,
    isFollowing: function (uid) { return db() && db().isFollowing ? db().isFollowing(uid) : Promise.resolve(false); },
    followCounts: function (uid) { return db() && db().followCounts ? db().followCounts(uid) : Promise.resolve({ followers: 0, following: 0 }); },
    listFollowers: function (uid) { return db() && db().listFollowers ? db().listFollowers(uid) : Promise.resolve([]);
    },
    listFollowing: function (uid) { return db() && db().listFollowing ? db().listFollowing(uid) : Promise.resolve([]);
    },
    mediaByAuthor: function (uid) { return db() && db().mediaByAuthor ? db().mediaByAuthor(uid) : Promise.resolve([]);
    },
    startChat: function (peer) { return db() && db().startDirectChat ? db().startDirectChat(peer) : Promise.resolve({ ok: false, error: 'Chat is not ready.' }); },
    profileUrl: profileUrl,
    chatUrl: chatUrl,
    shape: shape
  };
})(typeof window !== 'undefined' ? window : this);
