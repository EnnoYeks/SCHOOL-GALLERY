/**
 * JS-first page module: home
 */
(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;
  var PAGE = 'home';
  var PATH = 'index.html';
  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'index.html' || f === '';
  }
  async function hydrateFeed(elId, typeFilter) {
    var el = document.getElementById(elId);
    if (!el) return;
    try {
      var posts = [];
      if (global.HshsData && global.HshsData.getPosts) posts = await global.HshsData.getPosts(24, 0) || [];
      global.HshsRender.clear(el);
      if (!posts.length) {
        el.appendChild(global.HshsUI.emptyState('No posts yet. Be the first to share.', 'fa-images'));
        return;
      }
      posts.slice(0, 8).forEach(function (p) {
        el.appendChild(global.HshsUI.mediaCard({
          id: p.id,
          url: p.imageUrl || p.url || p.mediaUrl || p.thumbnail,
          caption: p.caption || p.title || '',
          likes: p.likes || p.likeCount || 0,
          type: p.type
        }));
      });
    } catch (e) {
      global.HshsRender.clear(el);
      el.appendChild(global.HshsUI.emptyState('Could not load content.', 'fa-exclamation-triangle'));
    }
  }
  function render(root) {
    var UI = global.HshsUI, R = global.HshsRender, b = (global.HshsShell && global.HshsShell.basePath()) || '';
    function statCard(icon, num, label, id) {
      return R.el('div', { className: 'stat-card' }, [
        R.el('div', { className: 'stat-icon' }, [R.icon(icon)]),
        R.el('div', { className: 'stat-content' }, [
          R.el('div', { className: 'stat-number', id: id, text: num }),
          R.el('div', { className: 'stat-label', text: label })
        ])
      ]);
    }
    R.mount(root, [
      UI.hero({
        title: 'HSHS WORLD',
        subtitle: 'Your school. One world. Photos, Vibe, Buzz and memories.',
        description: 'The HSHS home for school moments, achievements and community.',
        buttons: [
          UI.btn('Explore Feed', { href: b + 'index/gallery.html', icon: 'fa-play', variant: 'btn-primary', id: 'exploreBtn' }),
          UI.btn('Learn More', { href: b + 'index/about.html', icon: 'fa-info-circle', variant: 'btn-secondary', id: 'learnMoreBtn' })
        ]
      }),
      R.el('section', { className: 'featured-section' }, [
        R.el('div', { className: 'container' }, [
          UI.sectionTitle('Featured Today', 'fa-crown'),
          R.el('div', { className: 'featured-grid', id: 'featuredGrid' }, [UI.skeleton(4)])
        ])
      ]),
      R.el('section', { className: 'quick-stats' }, [
        R.el('div', { className: 'container' }, [
          R.el('div', { className: 'stats-grid' }, [
            statCard('fa-images', '0', 'Photos', 'totalPhotos'),
            statCard('fa-video', '0', 'Vibe', 'totalVideos'),
            statCard('fa-users', '0', 'Students', 'totalStudents'),
            statCard('fa-heart', '0', 'Likes', 'totalLikes')
          ])
        ])
      ]),
      R.el('section', { className: 'cta-section' }, [
        R.el('div', { className: 'cta-content' }, [
          R.el('h2', { text: 'Ready to share your story?' }),
          R.el('p', { text: 'Upload photos and videos to HSHS World' }),
          UI.btn('Start Uploading', { href: b + 'index/photos.html', icon: 'fa-cloud-upload-alt', id: 'uploadBtn' })
        ])
      ])
    ]);
    hydrateFeed('featuredGrid');
  }
  function mount() {
    if (!isPage()) return;
    if (!global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    document.documentElement.classList.add('hshs-page-' + PAGE, 'hshs-js-page');
    render(root);
    console.info('[HSHS] JS-first page active:', PAGE);
  }
  function register() {
    global.HshsPages = global.HshsPages || {};
    global.HshsPages[PAGE] = {
      name: PAGE, path: PATH, isActive: isPage, mount: mount,
      reinit: function () { if (isPage()) mount(); },
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate(PAGE);
        location.href = PATH;
      }
    };
  }
  function boot() {
    register();
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender || !global.HshsUI) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
    if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
