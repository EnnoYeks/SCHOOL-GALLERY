(function (g) {
  if (g.HshsLocalSocial) return;
  function store() { return g.HshsStore || null; }
  function me() {
    var s = store();
    return s && s.currentUser ? s.currentUser() : null;
  }
  var api = {
    profile: function () { return me(); },
    saveProfile: function (patch) {
      var s = store();
      if (!s || !s.updateProfile) return { ok: false, error: 'Sign in first.' };
      return s.updateProfile(patch || {});
    },
    posts: function (uid) {
      var s = store();
      if (!s || !s.postsByUser) return [];
      return s.postsByUser(uid || (me() && me().id)) || [];
    },
    search: function (q) {
      var s = store();
      return s && s.searchPeople ? s.searchPeople(q) : [];
    },
    follow: function (id) { var s = store(); return s && s.toggleFollow ? s.toggleFollow(id) : { ok: false }; },
    requestFriend: function (id) { var s = store(); return s && s.requestFriend ? s.requestFriend(id) : { ok: false }; },
    requests: function () { var s = store(); return s && s.incomingRequests ? s.incomingRequests() : []; },
    like: function (id) { var s = store(); return s && s.toggleLike ? s.toggleLike(id) : { ok: false }; },
    save: function (id) { var s = store(); return s && s.toggleSave ? s.toggleSave(id) : { ok: false }; },
    comment: function (id, text) { var s = store(); return s && s.addComment ? s.addComment(id, text) : { ok: false }; },
    activity: function (uid) {
      var s = store();
      if (!s || !s.getState) return [];
      var state = s.getState();
      var id = uid || (me() && me().id);
      return (state.notifications || []).filter(function (n) { return !id || n.userId === id; }).slice(0, 20);
    }
  };
  g.HshsLocalSocial = api;
})(typeof window !== 'undefined' ? window : this);
