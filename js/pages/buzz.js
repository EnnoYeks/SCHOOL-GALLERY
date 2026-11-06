(function (global) {
  'use strict';
  var PAGE = 'buzz', PAGE_SIZE = 18;
  if (global.__hshsBuzzPageModule) return;
  global.__hshsBuzzPageModule = true;

  var state = {
    mounted: false, all: [], items: [], feed: 'discover', muted: true,
    liked: new Set(), follows: new Set(), likeCounts: {}, commentCounts: {},
    currentUserId: null, commentsVideoId: null, comments: [], observer: null,
    loading: false, offset: 0, hasMore: true, busy: new Set()
  };

  function isPage() {
    var key = global.HshsPaths ? global.HshsPaths.key() : '';
    return key === 'buzz' || key === 'vibe' || key === 'clips' || key === 'shorts' ||
      (global.HshsRoute && global.HshsRoute.is(PAGE));
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function mediaUrl(v) { return v.video_url || v.videoUrl || v.url || v.media_url || v.mediaUrl || v.src || ''; }
  function posterUrl(v) { return v.thumbnail_url || v.thumbnailUrl || v.thumbnail || v.cover || v.image_url || v.imageUrl || v.image || ''; }
  function author(v) { return String(v.author || v.username || v.userName || v.creator || 'HSHS Student').replace(/^@/, ''); }
  function creatorId(v) { return String(v.author_id || v.authorId || ''); }
  function idOf(v, i) { return String(v.id || v.video_id || i); }
  function db() { return global.db || null; }
  function toast(message) {
    var el = document.getElementById('buzzToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }
  function compact(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }
  function ago(value) {
    var time = value ? new Date(value).getTime() : 0;
    if (!time || !Number.isFinite(time)) return 'just now';
    var sec = Math.max(0, (Date.now() - time) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd ago';
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(time));
  }
  function visibleItems() {
    if (state.feed !== 'following') return state.all;
    return state.all.filter(function (item) {
      var creator = creatorId(item);
      return creator && state.follows.has(creator);
    });
  }

  function cardMarkup(item, index) {
    var id = idOf(item, index), creator = creatorId(item), who = author(item);
    var own = !!(creator && state.currentUserId && creator === state.currentUserId);
    var liked = state.liked.has(id), following = creator && state.follows.has(creator);
    var likes = state.likeCounts[id] == null ? Number(item.likes || item.likes_count || 0) : state.likeCounts[id];
    var comments = state.commentCounts[id] == null ? Number(item.comments || item.comments_count || 0) : state.commentCounts[id];
    var src = mediaUrl(item), poster = posterUrl(item);
    var caption = String(item.description || item.title || 'A moment from HSHS');
    return '<article class="buzz-card" data-buzz-id="' + esc(id) + '" data-author-id="' + esc(creator) + '">' +
      '<div class="buzz-media">' + (src
        ? '<video playsinline webkit-playsinline loop preload="metadata" muted ' + (poster ? 'poster="' + esc(poster) + '" ' : '') + 'src="' + esc(src) + '"></video>'
        : '<div class="buzz-placeholder"><i class="fas fa-circle-play"></i></div>') + '</div>' +
      '<div class="buzz-shade"></div>' +
      '<button class="buzz-sound" type="button" data-buzz-action="sound" aria-label="' + (state.muted ? 'Turn sound on' : 'Mute videos') + '"><i class="fas ' + (state.muted ? 'fa-volume-xmark' : 'fa-volume-high') + '"></i></button>' +
      '<div class="buzz-rail">' +
        '<button class="buzz-action' + (liked ? ' liked' : '') + '" type="button" data-buzz-action="like" aria-pressed="' + (liked ? 'true' : 'false') + '"><i class="fas fa-heart"></i><span>' + compact(likes) + '</span></button>' +
        '<button class="buzz-action" type="button" data-buzz-action="comments"><i class="fas fa-comment"></i><span>' + compact(comments) + '</span></button>' +
        '<button class="buzz-action" type="button" data-buzz-action="share"><i class="fas fa-share"></i><span>Share</span></button>' +
      '</div>' +
      '<div class="buzz-info"><div class="buzz-author-row"><div class="buzz-author">@' + esc(who) + '</div>' +
        (creator && !own ? '<button class="buzz-follow' + (following ? ' is-following' : '') + '" type="button" data-buzz-action="follow" aria-pressed="' + (following ? 'true' : 'false') + '">' + (following ? 'Following' : 'Follow') + '</button>' : '') +
      '</div><div class="buzz-caption">' + esc(caption) + '</div></div></article>';
  }

  function render() {
    var feed = document.getElementById('buzzFeed');
    if (!feed) return;
    state.items = visibleItems();
    document.querySelectorAll('.vibe-switch').forEach(function (tab) {
      var active = tab.dataset.feed === state.feed;
      tab.classList.toggle('is-on', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (!state.items.length) {
      var following = state.feed === 'following';
      feed.innerHTML = '<div class="buzz-state buzz-empty"><i class="far fa-circle-play"></i><strong>' +
        (following ? 'Your Following feed is quiet' : 'No Vibe clips yet') + '</strong><small>' +
        (following ? 'Follow creators to see their new campus moments here.' : 'Clips from sports, clubs and school life will appear here.') +
        '</small>' + (following ? '<button type="button" data-buzz-action="feed" data-feed="discover">Explore Discover</button>' : '') + '</div>';
      attachObserver();
      return;
    }
    feed.innerHTML = state.items.map(cardMarkup).join('') +
      (state.hasMore && state.feed === 'discover' ? '<div class="buzz-load-sentinel" id="buzzLoadMoreSentinel" aria-hidden="true"></div>' : '');
    feed.querySelectorAll('video').forEach(function (video) { video.muted = state.muted; });
    attachObserver();
    var requested = new URLSearchParams(global.location.search).get('video');
    if (requested) {
      var target = feed.querySelector('[data-buzz-id="' + CSS.escape(requested) + '"]');
      if (target && !target.dataset.deepLinked) {
        target.dataset.deepLinked = '1';
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function attachObserver() {
    if (state.observer) state.observer.disconnect();
    if (!('IntersectionObserver' in global)) return;
    state.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target.id === 'buzzLoadMoreSentinel') {
          if (entry.isIntersecting && state.feed === 'discover') loadMore();
          return;
        }
        var video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.62) {
          document.querySelectorAll('#buzzFeed video').forEach(function (other) { if (other !== video) other.pause(); });
          video.muted = state.muted;
          var playing = video.play();
          if (playing && playing.catch) playing.catch(function () {});
        } else video.pause();
      });
    }, { threshold: [0, 0.35, 0.62, 0.85] });
    document.querySelectorAll('#buzzFeed .buzz-card, #buzzLoadMoreSentinel').forEach(function (node) {
      state.observer.observe(node);
    });
  }

  async function refreshSocial(items) {
    var api = db();
    if (!api || !api.getVideoSocial) return;
    try {
      var ids = items.map(idOf);
      var social = await api.getVideoSocial(ids);
      state.currentUserId = social.currentUserId;
      items.forEach(function (item, index) {
        var id = idOf(item, index);
        state.liked.delete(id);
        state.likeCounts[id] = social.likeCounts[id] == null ? Number(item.likes || item.likes_count || 0) : social.likeCounts[id];
        state.commentCounts[id] = social.commentCounts[id] == null ? Number(item.comments || item.comments_count || 0) : social.commentCounts[id];
      });
      state.follows.clear();
      (social.likedIds || []).forEach(function (id) { state.liked.add(String(id)); });
      (social.followedCreatorIds || []).forEach(function (id) { state.follows.add(String(id)); });
    } catch (error) {
      console.warn('[HSHS Vibe] social state unavailable; keeping feed readable:', error && error.message);
    }
  }

  async function loadVideos(reset) {
    var api = db(), feed = document.getElementById('buzzFeed');
    if (!api || !api.getVideos) {
      if (feed) feed.innerHTML = '<div class="buzz-state"><strong>Vibe is unavailable</strong><small>The media service is not ready yet.</small></div>';
      if (global.HshsRoute) global.HshsRoute.reveal();
      return;
    }
    if (state.loading) return;
    if (reset) {
      state.all = []; state.offset = 0; state.hasMore = true;
      state.liked.clear(); state.follows.clear(); state.likeCounts = {}; state.commentCounts = {};
    }
    state.loading = true;
    if (feed && !state.all.length) feed.innerHTML = '<article class="hshs-sk-buzz" aria-hidden="true"><div class="hshs-sk-buzz-media"></div><div class="hshs-sk-buzz-cap"><b></b><em></em></div></article>';
    try {
      var rows = await api.getVideos(PAGE_SIZE, state.offset);
      rows = rows || [];
      state.offset += rows.length;
      state.hasMore = rows.length === PAGE_SIZE;
      var videos = rows.filter(function (item) { return !!mediaUrl(item); });
      state.all = state.all.concat(videos);
      render();
      refreshSocial(videos).then(render);
    } catch (error) {
      console.error('[HSHS Vibe] load failed:', error);
      if (feed && !state.all.length) feed.innerHTML = '<div class="buzz-state buzz-empty"><strong>Could not load Vibe</strong><small>Check your connection and try again.</small><button type="button" data-buzz-action="retry">Retry</button></div>';
    } finally {
      state.loading = false;
      if (global.HshsRoute) global.HshsRoute.reveal();
    }
  }
  async function loadMore() {
    if (!state.loading && state.hasMore && state.feed === 'discover') await loadVideos(false);
  }

  function setMuted(muted) {
    state.muted = !!muted;
    document.querySelectorAll('#buzzFeed video').forEach(function (video) { video.muted = state.muted; });
    document.querySelectorAll('.buzz-sound').forEach(function (button) {
      button.innerHTML = '<i class="fas ' + (state.muted ? 'fa-volume-xmark' : 'fa-volume-high') + '"></i>';
      button.setAttribute('aria-label', state.muted ? 'Turn sound on' : 'Mute videos');
    });
  }

  async function handleLike(button) {
    var card = button.closest('.buzz-card'), id = card && card.dataset.buzzId, api = db();
    if (!id || !api || !api.toggleVideoLike) return;
    if (!state.currentUserId) { toast('Sign in to like videos'); return; }
    if (state.busy.has('like:' + id)) return;
    state.busy.add('like:' + id); button.disabled = true;
    try {
      var result = await api.toggleVideoLike(id);
      if (!result || !result.ok) throw new Error((result && result.error) || 'Like failed');
      if (result.liked) state.liked.add(id); else state.liked.delete(id);
      state.likeCounts[id] = Math.max(0, (state.likeCounts[id] || 0) + (result.liked ? 1 : -1));
      var count = button.querySelector('span');
      if (count) count.textContent = compact(state.likeCounts[id]);
      button.classList.toggle('liked', !!result.liked);
      button.setAttribute('aria-pressed', result.liked ? 'true' : 'false');
    } catch (error) {
      console.warn('[HSHS Vibe] like failed:', error);
      toast('Like could not be saved. Check account setup and try again.');
    } finally {
      state.busy.delete('like:' + id); button.disabled = false;
    }
  }

  async function handleFollow(button) {
    var card = button.closest('.buzz-card'), creator = card && card.dataset.authorId, api = db();
    if (!creator || !api || !api.toggleVideoFollow) return;
    if (!state.currentUserId) { toast('Sign in to follow creators'); return; }
    if (state.busy.has('follow:' + creator)) return;
    state.busy.add('follow:' + creator); button.disabled = true;
    try {
      var result = await api.toggleVideoFollow(creator);
      if (!result || !result.ok) throw new Error((result && result.error) || 'Follow failed');
      if (result.following) state.follows.add(creator); else state.follows.delete(creator);
      button.textContent = result.following ? 'Following' : 'Follow';
      button.classList.toggle('is-following', !!result.following);
      button.setAttribute('aria-pressed', result.following ? 'true' : 'false');
      if (state.feed === 'following' && !result.following) render();
    } catch (error) {
      console.warn('[HSHS Vibe] follow failed:', error);
      toast('Follow could not be saved. Check account setup and try again.');
    } finally {
      state.busy.delete('follow:' + creator); button.disabled = false;
    }
  }

  function renderComments() {
    var list = document.getElementById('buzzCommentList');
    if (!list) return;
    if (!state.comments.length) {
      list.innerHTML = '<div class="buzz-comments-empty">No comments yet. Start the conversation.</div>';
      return;
    }
    list.innerHTML = state.comments.map(function (comment) {
      return '<article class="buzz-comment"><div class="buzz-comment-avatar">' +
        esc(String(comment.author || 'H').trim().charAt(0).toUpperCase()) +
        '</div><div class="buzz-comment-copy"><div class="buzz-comment-meta"><strong>' +
        esc(comment.author || 'HSHS Student') + '</strong><time>' + esc(ago(comment.created_at)) +
        '</time></div><p>' + esc(comment.text || '') + '</p></div></article>';
    }).join('');
    list.scrollTop = list.scrollHeight;
  }

  async function openComments(videoId) {
    var drawer = document.getElementById('buzzComments'), api = db();
    if (!drawer || !api || !api.getVideoComments) return;
    state.commentsVideoId = videoId; state.comments = [];
    drawer.hidden = false; drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('buzz-comments-open');
    var input = document.getElementById('buzzCommentInput');
    var gate = document.getElementById('buzzCommentGate');
    var form = document.getElementById('buzzCommentForm');
    var signedIn = !!state.currentUserId;
    if (input) { input.disabled = !signedIn; input.placeholder = signedIn ? 'Add a comment…' : 'Sign in to join the conversation'; }
    if (gate) gate.hidden = signedIn;
    if (form) form.classList.toggle('is-guest', !signedIn);
    var list = document.getElementById('buzzCommentList');
    if (list) list.innerHTML = '<div class="buzz-comments-loading">Loading comments…</div>';
    try { state.comments = await api.getVideoComments(videoId); renderComments(); }
    catch (error) {
      console.warn('[HSHS Vibe] comments failed:', error);
      if (list) list.innerHTML = '<div class="buzz-comments-empty">Comments could not be loaded. Try again.</div>';
    }
  }

  function closeComments() {
    var drawer = document.getElementById('buzzComments');
    if (drawer) { drawer.hidden = true; drawer.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('buzz-comments-open');
    state.commentsVideoId = null;
  }

  async function submitComment(form) {
    var input = document.getElementById('buzzCommentInput');
    var text = input ? input.value.trim() : '';
    if (!text || !state.commentsVideoId) return;
    if (!state.currentUserId) { toast('Sign in to comment'); return; }
    var api = db(), submit = form.querySelector('button[type="submit"]');
    if (!api || !api.addVideoComment) return;
    if (submit) submit.disabled = true;
    try {
      var result = await api.addVideoComment(state.commentsVideoId, text);
      if (!result || !result.ok) throw new Error((result && result.error) || 'Comment failed');
      state.comments.push(result.comment);
      state.commentCounts[state.commentsVideoId] = (state.commentCounts[state.commentsVideoId] || 0) + 1;
      if (input) input.value = '';
      renderComments();
      var card = document.querySelector('.buzz-card[data-buzz-id="' + CSS.escape(state.commentsVideoId) + '"]');
      var count = card && card.querySelector('[data-buzz-action="comments"] span');
      if (count) count.textContent = compact(state.commentCounts[state.commentsVideoId]);
    } catch (error) {
      console.warn('[HSHS Vibe] comment submit failed:', error);
      toast('Comment could not be posted. Check account setup and try again.');
    } finally { if (submit) submit.disabled = false; }
  }

  async function shareVideo(id) {
    var url = new URL('/buzz/?video=' + encodeURIComponent(id), global.location.origin).toString();
    try {
      if (navigator.share) { await navigator.share({ title: 'HSHS World Vibe', text: 'Watch this HSHS moment', url: url }); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(url); toast('Video link copied'); return; }
    } catch (error) { if (error && error.name === 'AbortError') return; }
    toast('Copy this page link to share the clip');
  }

  function bind() {
    if (global.__hshsBuzzEvents) return;
    global.__hshsBuzzEvents = true;
    document.addEventListener('click', function (event) {
      if (!isPage()) return;
      var button = event.target.closest('[data-buzz-action]');
      if (!button) return;
      var action = button.dataset.buzzAction;
      if (action === 'sound') setMuted(!state.muted);
      else if (action === 'feed') { state.feed = button.dataset.feed || 'discover'; render(); }
      else if (action === 'like') handleLike(button);
      else if (action === 'follow') handleFollow(button);
      else if (action === 'comments') { var card = button.closest('.buzz-card'); if (card) openComments(card.dataset.buzzId); }
      else if (action === 'close-comments') closeComments();
      else if (action === 'share') { var shareCard = button.closest('.buzz-card'); if (shareCard) shareVideo(shareCard.dataset.buzzId); }
      else if (action === 'retry') loadVideos(true);
    });
    document.addEventListener('submit', function (event) {
      if (event.target && event.target.id === 'buzzCommentForm') { event.preventDefault(); submitComment(event.target); }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.body.classList.contains('buzz-comments-open')) closeComments();
    });
    document.addEventListener('hshs:auth', function () {
      var api = db();
      if (api && api.getAuthenticatedUid) api.getAuthenticatedUid().then(function (uid) {
        state.currentUserId = uid;
        refreshSocial(state.all).then(render).catch(function () {});
      });
    });
  }

  async function mount() {
    if (!isPage() || !global.HshsRender || state.mounted) return;
    var root = document.getElementById('hshs-page');
    if (!root) return;
    var template = global.HshsTemplates && global.HshsTemplates.buzz;
    if (template && !document.getElementById('buzzFeed')) {
      if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, template);
      else root.innerHTML = template;
    }
    document.documentElement.dataset.hshsPage = PAGE;
    document.body.classList.add('vibe-watching');
    state.mounted = true;
    bind();
    var api = db();
    if (api && api.getAuthenticatedUid) state.currentUserId = await api.getAuthenticatedUid();
    await loadVideos(true);
  }

  function stop() {
    if (state.observer) state.observer.disconnect();
    state.observer = null;
    document.querySelectorAll('#buzzFeed video').forEach(function (video) { video.pause(); });
    document.body.classList.remove('vibe-watching', 'buzz-comments-open');
    closeComments();
    state.mounted = false;
  }

  function boot() {
    var go = function () {
      if (!isPage()) { stop(); return; }
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    };
    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    go();
    setTimeout(go, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function () { if (isPage()) mount(); else stop(); });
  global.HshsBuzz = { mount: mount, refresh: function () { return loadVideos(true); } };
})(typeof window !== 'undefined' ? window : this);
