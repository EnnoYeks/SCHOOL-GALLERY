(function (global) {
  'use strict';
  if (global.HshsUI) return;
  function R() { return global.HshsRender; }
  function skeleton(n) {
    n = n || 3;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) frag.appendChild(R().el('div', { className: 'loading-skeleton' }));
    return frag;
  }
  function emptyState(message, iconName) {
    return R().el('div', { className: 'empty-state', style: { textAlign: 'center', padding: '2rem' } }, [
      R().icon(iconName || 'fa-inbox'),
      R().el('p', { text: message || 'Nothing here yet.' })
    ]);
  }
  function btn(label, opts) {
    opts = opts || {};
    return R().el(opts.href ? 'a' : 'button', {
      className: 'btn ' + (opts.variant || 'btn-primary') + (opts.className ? ' ' + opts.className : ''),
      href: opts.href || null, id: opts.id || null,
      type: opts.href ? null : (opts.type || 'button')
    }, [opts.icon ? R().icon(opts.icon) : null, document.createTextNode(' ' + label)]);
  }
  function sectionTitle(text, iconName) {
    return R().el('h2', { className: 'section-title' }, [
      iconName ? R().icon(iconName) : null, document.createTextNode(' ' + text)
    ]);
  }
  function hero(opts) {
    opts = opts || {};
    return R().el('section', { className: 'hero' }, [
      R().el('div', { className: 'hero-content' }, [
        R().el('div', { className: 'hero-text' }, [
          R().el('h1', { className: 'hero-title', text: opts.title || 'HSHS WORLD' }),
          R().el('p', { className: 'hero-subtitle', text: opts.subtitle || '' }),
          opts.description ? R().el('div', { className: 'hero-description', text: opts.description }) : null,
          R().el('div', { className: 'hero-buttons' }, opts.buttons || [])
        ])
      ])
    ]);
  }
  function pageHeader(title, subtitle) {
    return R().el('div', { className: 'page-header', style: { padding: '1.5rem 1rem 0.5rem' } }, [
      R().el('h1', { text: title }),
      subtitle ? R().el('p', { text: subtitle }) : null
    ]);
  }
  function mediaCard(item) {
    item = item || {};
    var media = item.type === 'video'
      ? R().el('video', { src: item.url || '', controls: true, className: 'media-thumb' })
      : R().el('img', { src: item.url || item.thumb || 'https://via.placeholder.com/400x300', alt: item.caption || 'Post', className: 'media-thumb' });
    return R().el('article', { className: 'gallery-item post-card', dataset: { id: item.id || '' } }, [
      R().el('div', { className: 'post-media' }, [media]),
      R().el('div', { className: 'post-body' }, [
        R().el('p', { className: 'post-caption', text: item.caption || item.title || '' }),
        R().el('div', { className: 'post-meta' }, [
          R().el('span', { text: (item.likes != null ? item.likes : 0) + ' likes' })
        ])
      ])
    ]);
  }
  global.HshsUI = { skeleton: skeleton, emptyState: emptyState, btn: btn, sectionTitle: sectionTitle, hero: hero, pageHeader: pageHeader, mediaCard: mediaCard };
})(typeof window !== 'undefined' ? window : this);
