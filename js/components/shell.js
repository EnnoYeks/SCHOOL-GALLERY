(function (global) {
  'use strict';
  if (global.HshsShell) return;
  function R() { return global.HshsRender; }
  function basePath() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function navLink(href, icon, label, page) {
    return R().el('a', { href: href, className: 'nav-link', dataset: { page: page } }, [
      R().icon(icon), R().el('span', { text: label })
    ]);
  }
  function renderNavbar() {
    var b = basePath();
    return R().el('nav', { className: 'navbar' }, [
      R().el('div', { className: 'navbar-container' }, [
        R().el('div', { className: 'logo' }, [R().icon('fa-graduation-cap'), R().el('div', { className: 'brand-lockup' }, [R().el('span', { className: 'brand-school', text: 'Hawthorne Scribner High School' }), R().el('span', { className: 'brand-mark', text: 'HSHS World' })])]),
        R().el('div', { className: 'search-container' }, [
          R().icon('fa-search'),
          R().el('input', { type: 'text', className: 'search-input', id: 'searchInput', placeholder: 'Search posts, students, events...' }),
          R().el('div', { className: 'search-results', id: 'searchResults' })
        ]),
        R().el('div', { className: 'nav-links' }, [
          navLink(b + 'index.html', 'fa-home', 'Home', 'home'),
          navLink(b + 'index/gallery.html', 'fa-images', 'Gallery', 'gallery'),
          navLink(b + 'index/photos.html', 'fa-photo-video', 'Photos', 'photos'),
          navLink(b + 'index/videos.html', 'fa-video', 'Vibe', 'videos'),
          navLink(b + 'index/trending.html', 'fa-fire', 'Trending', 'trending'),
          navLink(b + 'index/spotlight.html', 'fa-star', 'Spotlight', 'spotlight'),
          navLink(b + 'index/polls.html', 'fa-poll', 'Polls', 'polls'),
          navLink(b + 'index/memories.html', 'fa-history', 'Memories', 'memories')
        ]),
        R().el('div', { className: 'nav-actions' }, [
          R().el('div', { className: 'notification-icon' }, [R().icon('fa-bell'), R().el('span', { className: 'notification-badge', id: 'notificationBadge', text: '0' })]),
          R().el('button', { className: 'theme-toggle', id: 'themeToggle', type: 'button' }, [R().icon('fa-moon')]),
          R().el('div', { className: 'profile-icon' }, [
            R().el('img', { src: 'https://via.placeholder.com/40', alt: 'Profile', className: 'profile-img', id: 'profileImg' })
          ]),
          R().el('button', { className: 'mobile-menu-toggle', id: 'mobileMenuToggle', type: 'button' }, [R().icon('fa-bars')])
        ])
      ])
    ]);
  }
  function renderFooter() {
    var b = basePath();
    return R().el('footer', { className: 'footer' }, [
      R().el('div', { className: 'container' }, [
        R().el('div', { className: 'footer-content' }, [
          R().el('div', { className: 'footer-section' }, [
            R().el('h4', { text: 'Hawthorne Scribner High School' }),
            R().el('p', { text: 'HSHS World \u00b7 Educate. Engage. Empower.' })
          ]),
          R().el('div', { className: 'footer-section' }, [
            R().el('h4', { text: 'Quick Links' }),
            R().el('a', { href: b + 'index.html', text: 'Home' }),
            R().el('a', { href: b + 'index/gallery.html', text: 'Gallery' }),
            R().el('a', { href: b + 'index/videos.html', text: 'Vibe' }),
            R().el('a', { href: b + 'index/about.html', text: 'About' })
          ]),
          R().el('div', { className: 'footer-section' }, [
            R().el('h4', { text: 'Contact' }),
            R().el('p', { text: 'Email: info@hshs.ac.ug' }),
            R().el('p', { text: 'Phone: +256 200 946933' })
          ])
        ]),
        R().el('div', { className: 'footer-bottom' }, [
          R().el('p', { text: '\u00a9 2026 HSHS World. All rights reserved.' })
        ])
      ])
    ]);
  }
  function renderBackground() {
    return R().el('div', { className: 'animated-bg' }, [
      R().el('div', { className: 'gradient-bg' }),
      R().el('div', { className: 'particles-container', id: 'particlesContainer' }),
      R().el('div', { className: 'floating-shapes' }, [
        R().el('div', { className: 'shape shape-1' }),
        R().el('div', { className: 'shape shape-2' }),
        R().el('div', { className: 'shape shape-3' }),
        R().el('div', { className: 'shape shape-4' })
      ])
    ]);
  }
  function ensureShell() {
    if (!document.querySelector('.animated-bg')) {
      document.body.insertBefore(renderBackground(), document.body.firstChild);
    }
    if (!document.querySelector('.navbar')) {
      var bg = document.querySelector('.animated-bg');
      if (bg && bg.nextSibling) document.body.insertBefore(renderNavbar(), bg.nextSibling);
      else document.body.appendChild(renderNavbar());
    }
    var page = document.getElementById('hshs-page');
    if (!page) {
      page = R().el('div', { id: 'hshs-page' });
      var nav = document.querySelector('.navbar');
      if (nav && nav.nextSibling) document.body.insertBefore(page, nav.nextSibling);
      else document.body.appendChild(page);
    }
    if (!document.querySelector('footer.footer')) {
      document.body.appendChild(renderFooter());
    }
    return page;
  }
  function bindNavScroll() {
    if (global.__hshsNavScrollBound) return;
    global.__hshsNavScrollBound = true;
    function onScroll() {
      document.documentElement.classList.toggle('hshs-nav-scrolled', window.scrollY > 12);
      document.documentElement.style.setProperty('--hero-shift', String(Math.round(window.scrollY * 0.12)) + 'px');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var _ensure = ensureShell;
  ensureShell = function () {
    var page = _ensure();
    bindNavScroll();
    return page;
  };
  global.HshsShell = { ensureShell: ensureShell, renderNavbar: renderNavbar, renderFooter: renderFooter, basePath: basePath };
})(typeof window !== 'undefined' ? window : this);
