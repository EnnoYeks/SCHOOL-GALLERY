/**
 * Phase 6 – Data & interactive features bridge.
 * Unifies HshsStore + db + social under one API.
 * Does NOT rewrite Firebase, Firestore, Supabase, or store internals.
 */
(function (global) {
  'use strict';
  if (global.HshsData) return;
  function store() { return global.HshsStore || null; }
  function getState() {
    var s = store();
    if (s && typeof s.getState === 'function') return s.getState();
    return null;
  }
  function currentUser() {
    var s = store();
    if (s && typeof s.currentUser === 'function') return s.currentUser();
    if (s && s.user) return s.user;
    try { if (global.auth && global.auth.currentUser) return global.auth.currentUser; } catch (e) {}
    return null;
  }
  function postsByUser(userId) {
    var s = store();
    if (s && typeof s.postsByUser === 'function') return s.postsByUser(userId) || [];
    return [];
  }
  async function getPosts(limitCount, offset) {
    try {
      if (global.db && typeof global.db.getPosts === 'function') {
        return await global.db.getPosts(limitCount || 20, offset || 0);
      }
    } catch (e) {
      if (global.HshsApp) global.HshsApp.reportError(e, 'data.getPosts');
    }
    var s = store();
    if (s && s.getState) {
      var st = s.getState();
      var posts = (st && st.posts) || [];
      return posts.slice(offset || 0, (offset || 0) + (limitCount || 20));
    }
    return [];
  }
  function toggleLike(postId) {
    if (global.reactionManager && typeof global.reactionManager.toggleLike === 'function') {
      return global.reactionManager.toggleLike(postId);
    }
    var s = store();
    if (s && typeof s.toggleLike === 'function') return s.toggleLike(postId);
    return null;
  }
  function addComment(postId, text) {
    if (global.commentManager && typeof global.commentManager.add === 'function') {
      return global.commentManager.add(postId, text);
    }
    var s = store();
    if (s && typeof s.addComment === 'function') return s.addComment(postId, text);
    return null;
  }
  function notify(message, type) {
    if (global.HshsNotify && typeof global.HshsNotify.push === 'function') {
      return global.HshsNotify.push(message, type);
    }
    if (global.HshsError && type === 'error') global.HshsError.show(message);
    return null;
  }
  function markDataReady() {
    if (global.HshsApp) {
      global.HshsApp.setState({ dataReady: true });
      if (global.HshsApp.emit) global.HshsApp.emit('data', global.HshsApp.getState());
    }
    console.info('[HSHS] Data bridge ready (Phase 6)');
  }
  function boot() {
    var tries = 0;
    function tick() {
      tries++;
      if (store() || global.db || tries > 25) { markDataReady(); return; }
      setTimeout(tick, 40);
    }
    tick();
  }
  global.HshsData = {
    store: store, getState: getState, currentUser: currentUser, postsByUser: postsByUser,
    getPosts: getPosts, toggleLike: toggleLike, addComment: addComment, notify: notify
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    setTimeout(boot, 30);
  }
})(typeof window !== 'undefined' ? window : this);
