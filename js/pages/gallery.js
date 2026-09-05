/**
 * JS-first Gallery – filters, feed, infinite scroll, existing post-card CSS.
 */
(function (global) {
  'use strict';
  if (global.__hshsGalleryPageModule) return;
  global.__hshsGalleryPageModule = true;

  var PAGE = 'gallery';
  var state = { category: 'all', page: 0, perPage: 12, loading: false, observer: null, allPosts: [] };

  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'gallery.html';
  }

  function R() { return global.HshsRender; }
  function UI() { return global.HshsUI; }

  function chip(label, cat, active) {
    return R().el('button', {
      type: 'button',
      className: 'category-btn' + (active ? ' active' : ''),
      dataset: { category: cat },
      text: label
    });
  }

  function render(root) {
    R().mount(root, [
      R().el('div', { className: 'gallery-container' }, [
        R().el('div', { className: 'category-filter', id: 'categoryFilter' }, [
          chip('All', 'all', true),
          chip('Photos', 'photo'),
          chip('Videos', 'video'),
          chip('Events', 'event')
        ]),
        R().el('div', { className: 'story-bar', id: 'storyBar' }),
        R().el('div', { className: 'gallery-feed', id: 'galleryFeed' }, [UI().skeleton(6)]),
        R().el('div', { id: 'gallerySentinel', style: { height: '1px' } })
      ])
    ]);
    bindFilters();
    loadPosts(true);
    setupInfiniteScroll();
  }

  function bindFilters() {
    var bar = document.getElementById('categoryFilter');
    if (!bar) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.category-btn');
      if (!btn) return;
      bar.querySelectorAll('.category-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.category = btn.getAttribute('data-category') || 'all';
      state.page = 0;
      loadPosts(true);
    });
  }

  function filterPosts(posts) {
    if (state.category === 'all') return posts;
    return posts.filter(function (p) {
      var cat = (p.category || p.type || p.mediaType || '').toLowerCase();
      if (state.category === 'photo') return cat.indexOf('video') === -1 && cat.indexOf('event') === -1;
      if (state.category === 'video') return cat.indexOf('video') !== -1;
      if (state.category === 'event') return cat.indexOf('event') !== -1;
      return cat === state.category;
    });
  }

  async function loadPosts(reset) {
    if (state.loading) return;
    state.loading = true;
    var feed = document.getElementById('galleryFeed');
    if (!feed) { state.loading = false; return; }
    if (reset) {
      R().clear(feed);
      feed.appendChild(UI().skeleton(4));
    }
    try {
      if (!state.allPosts.length || reset) {
        var fetched = [];
        if (global.HshsData && global.HshsData.getPosts) {
          fetched = await global.HshsData.getPosts(state.perPage * 5, 0) || [];
        } else if (global.db && global.db.getPosts) {
          fetched = await global.db.getPosts(state.perPage * 5, 0) || [];
        }
        state.allPosts = fetched;
      }
      var filtered = filterPosts(state.allPosts);
      var slice = filtered.slice(0, (state.page + 1) * state.perPage);
      R().clear(feed);
      if (!slice.length) {
        feed.appendChild(UI().emptyState('No posts in this category yet.', 'fa-images'));
      } else {
        slice.forEach(function (p) {
          feed.appendChild(UI().postCard ? UI().postCard(p) : UI().mediaCard(p));
        });
      }
    } catch (e) {
      R().clear(feed);
      feed.appendChild(UI().emptyState('Could not load gallery.', 'fa-exclamation-triangle'));
      if (global.HshsApp) global.HshsApp.reportError(e, 'gallery.load');
    }
    state.loading = false;
  }

  function setupInfiniteScroll() {
    if (state.observer) try { state.observer.disconnect(); } catch (e) {}
    var sent = document.getElementById('gallerySentinel');
    if (!sent || !('IntersectionObserver' in global)) return;
    state.observer = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting && !state.loading) {
        state.page += 1;
        loadPosts(false);
      }
    }, { rootMargin: '200px' });
    state.observer.observe(sent);
  }

  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    global.__hshsGalleryOwnedByJsFirst = true;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    render(root);
    console.info('[HSHS] JS-first gallery active (filters + feed)');
  }

  function boot() {
    global.HshsPages = global.HshsPages || {};
    global.HshsPages[PAGE] = {
      name: PAGE, path: 'index/gallery.html', isActive: isPage, mount: mount,
      reinit: function () { if (isPage()) mount(); }
    };
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender || !global.HshsUI) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
