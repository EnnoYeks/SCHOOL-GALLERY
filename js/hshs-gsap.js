/**
 * HSHS World · GSAP motion
 * Adds page-load, scroll-reveal, and light interaction animations
 * where they help the UI — never at the cost of reduced-motion users.
 */
(function (global) {
  'use strict';
  if (global.__hshsGsapModule) return;
  global.__hshsGsapModule = true;

  var GSAP_CORE = 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js';
  var GSAP_ST = 'https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js';
  var rafPending = false;
  var lastPageKey = '';
  var hoverBound = false;
  var observer = null;

  function prefersReduced() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      if (id && document.getElementById(id)) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureGsap() {
    if (global.gsap) {
      if (global.ScrollTrigger && global.gsap.registerPlugin) {
        try { global.gsap.registerPlugin(global.ScrollTrigger); } catch (e) {}
      }
      return Promise.resolve(global.gsap);
    }
    return loadScript(GSAP_CORE, 'hshs-gsap-core')
      .then(function () { return loadScript(GSAP_ST, 'hshs-gsap-st'); })
      .then(function () {
        if (global.gsap && global.ScrollTrigger && global.gsap.registerPlugin) {
          global.gsap.registerPlugin(global.ScrollTrigger);
        }
        return global.gsap;
      });
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function fresh(nodes) {
    return (nodes || []).filter(function (el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.getAttribute('data-gsap') === 'done') return false;
      if (el.classList && el.classList.contains('home-skeleton')) return false;
      if (el.classList && el.classList.contains('home-empty')) return false;
      el.setAttribute('data-gsap', 'done');
      return true;
    });
  }

  function killScrollTriggers() {
    try {
      if (global.ScrollTrigger && typeof global.ScrollTrigger.getAll === 'function') {
        global.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      }
    } catch (e) {}
  }

  function revealBatch(gsap, items, opts) {
    if (!items.length) return;
    opts = opts || {};
    var fromVars = {
      opacity: 0,
      y: opts.y == null ? 28 : opts.y,
      duration: opts.duration || 0.55,
      stagger: opts.stagger == null ? 0.08 : opts.stagger,
      ease: opts.ease || 'power3.out',
      clearProps: 'transform'
    };
    if (opts.x) fromVars.x = opts.x;
    if (opts.scale) fromVars.scale = opts.scale;
    if (global.ScrollTrigger && opts.scroll !== false) {
      fromVars.scrollTrigger = {
        trigger: opts.trigger || items[0],
        start: opts.start || 'top 88%',
        once: true
      };
    }
    gsap.from(items, fromVars);
  }

  function animateHero(gsap) {
    var card = document.querySelector('.vibe-hero-card');
    if (!card || card.getAttribute('data-gsap') === 'done') return;
    card.setAttribute('data-gsap', 'done');

    gsap.from(card, {
      opacity: 0,
      y: 24,
      scale: 0.98,
      duration: 0.7,
      ease: 'power3.out'
    });

    var copy = fresh(qsa('.vibe-pill, .vibe-hero-copy h1, .vibe-sub, .vibe-desc, .vibe-cta', card));
    if (copy.length) {
      gsap.from(copy, {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.12,
        ease: 'power3.out'
      });
    }

    var sparks = qsa('.vibe-spark, .vibe-hero-photos span', card);
    if (sparks.length) {
      gsap.from(sparks, {
        opacity: 0,
        scale: 0.6,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.2,
        ease: 'back.out(1.6)'
      });
    }
  }

  function animateNav(gsap) {
    var nav = document.querySelector('.navbar');
    if (!nav || nav.getAttribute('data-gsap') === 'done') return;
    nav.setAttribute('data-gsap', 'done');
    gsap.from(nav, {
      opacity: 0,
      y: -16,
      duration: 0.5,
      ease: 'power3.out'
    });
  }

  function animateHome(gsap) {
    qsa('.home-section').forEach(function (section) {
      var head = fresh(qsa('.home-section-head, .home-section-title', section));
      if (head.length) revealBatch(gsap, head, { trigger: section, y: 18, stagger: 0.06 });

      var cards = fresh(qsa(
        '.home-feature-card, .home-stat, .home-split-card, .home-event-card, .home-trend-item',
        section
      ));
      if (cards.length) revealBatch(gsap, cards, { trigger: section, y: 32, stagger: 0.1, scale: 0.98 });
    });

    var cta = fresh(qsa('.home-cta'));
    if (cta.length) revealBatch(gsap, cta, { y: 24 });

    var footer = fresh(qsa('.home-footer, footer.footer'));
    if (footer.length) revealBatch(gsap, footer, { y: 20, duration: 0.5 });
  }

  function animateGeneric(gsap) {
    var cards = fresh(qsa([
      '.gallery-item',
      '.gallery-card',
      '.photo-card',
      '.video-card',
      '.clip-card',
      '.memory-card',
      '.spotlight-card',
      '.trending-card',
      '.poll-card',
      '.post-card',
      '.media-tile',
      '.hshs-card',
      '.feed-card'
    ].join(', ')));
    if (cards.length) {
      revealBatch(gsap, cards.slice(0, 40), { y: 26, stagger: 0.06, scale: 0.97 });
    }

    var titles = fresh(qsa('main h1, main h2, .page-title, .section-title'));
    if (titles.length) revealBatch(gsap, titles.slice(0, 12), { y: 16, stagger: 0.05 });
  }

  function animateShapes(gsap) {
    var shapes = qsa('.animated-bg .shape');
    if (!shapes.length) return;
    shapes.forEach(function (shape, i) {
      if (shape.getAttribute('data-gsap-loop') === '1') return;
      shape.setAttribute('data-gsap-loop', '1');
      gsap.to(shape, {
        y: i % 2 === 0 ? -18 : 16,
        x: i % 2 === 0 ? 10 : -12,
        rotation: i % 2 === 0 ? 8 : -8,
        duration: 4 + i,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });
  }

  function bindHovers(gsap) {
    if (hoverBound) return;
    hoverBound = true;
    document.addEventListener('pointerenter', function (e) {
      if (prefersReduced()) return;
      var card = e.target && e.target.closest
        ? e.target.closest('.home-feature-card, .home-stat, .home-split-card, .gallery-item, .gallery-card, .photo-card, .video-card, .vibe-btn-primary, .vibe-btn-ghost')
        : null;
      if (!card) return;
      gsap.to(card, { y: -6, scale: 1.02, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
    }, true);
    document.addEventListener('pointerleave', function (e) {
      var card = e.target && e.target.closest
        ? e.target.closest('.home-feature-card, .home-stat, .home-split-card, .gallery-item, .gallery-card, .photo-card, .video-card, .vibe-btn-primary, .vibe-btn-ghost')
        : null;
      if (!card) return;
      gsap.to(card, { y: 0, scale: 1, duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
    }, true);

    document.addEventListener('click', function (e) {
      if (prefersReduced()) return;
      var heart = e.target && e.target.closest
        ? e.target.closest('.fa-heart, [data-like], .like-btn, .hshs-like')
        : null;
      if (!heart) return;
      gsap.fromTo(heart, { scale: 1 }, {
        scale: 1.28,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'back.out(2)'
      });
    }, true);
  }

  function play() {
    if (prefersReduced() || !global.gsap) {
      document.documentElement.classList.add('hshs-gsap-reduced');
      return;
    }
    document.documentElement.classList.add('hshs-gsap-on');
    var gsap = global.gsap;
    var page = document.documentElement.getAttribute('data-hshs-page') || '';
    var key = page + '|' + (location.pathname || '/') + '|' + ((document.getElementById('hshs-page') || {}).innerHTML || '').length;
    if (key === lastPageKey) {
      animateGeneric(gsap);
      return;
    }
    lastPageKey = key;
    killScrollTriggers();
    qsa('[data-gsap="done"]').forEach(function (el) {
      if (el.classList.contains('navbar') || el.classList.contains('vibe-hero-card')) return;
      el.removeAttribute('data-gsap');
    });
    animateNav(gsap);
    animateHero(gsap);
    animateHome(gsap);
    animateGeneric(gsap);
    animateShapes(gsap);
    bindHovers(gsap);
    if (global.ScrollTrigger && typeof global.ScrollTrigger.refresh === 'function') {
      global.ScrollTrigger.refresh();
    }
  }

  function schedulePlay() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      play();
    });
  }

  function watchDynamic() {
    if (observer || !global.MutationObserver) return;
    var root = document.getElementById('hshs-page') || document.body;
    observer = new MutationObserver(function () {
      schedulePlay();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function start() {
    if (prefersReduced()) {
      document.documentElement.classList.add('hshs-gsap-reduced');
      return;
    }
    ensureGsap().then(function (gsap) {
      if (!gsap) return;
      global.HshsGsap = {
        refresh: schedulePlay,
        reduced: prefersReduced
      };
      schedulePlay();
      watchDynamic();
    }).catch(function (err) {
      console.warn('[HSHS] GSAP unavailable', err);
    });
  }

  document.addEventListener('hshs:page', schedulePlay);
  document.addEventListener('hshs:foundation-ready', start, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) start();
    }, { once: true });
  } else if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) {
    start();
  } else {
    setTimeout(start, 800);
  }
})(typeof window !== 'undefined' ? window : this);
