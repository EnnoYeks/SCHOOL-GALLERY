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
  function postCard(post) {
    post = post || {};
    var id = post.id || '';
    var img = post.image || post.imageUrl || post.url || post.mediaUrl || post.thumbnail || 'https://via.placeholder.com/600x800';
    var title = post.title || post.caption || 'Untitled';
    var desc = post.description || post.caption || '';
    var author = post.author || post.userName || 'Student';
    var likes = post.likes || post.likeCount || 0;
    var comments = post.comments || post.commentCount || 0;
    var shares = post.shares || 0;
    var saves = post.saves || 0;
    var isVideo = (post.type === 'video') || (String(post.mediaType || '').indexOf('video') !== -1);
    var media = isVideo
      ? R().el('video', { src: img, className: 'post-media', controls: true, playsInline: true })
      : R().el('img', { src: img, alt: title, className: 'post-media' });
    return R().el('article', { className: 'post-card', dataset: { id: id, category: post.category || '' } }, [
      R().el('div', { className: 'post-content' }, [
        media,
        R().el('div', { className: 'post-overlay' }),
        R().el('div', { className: 'post-info' }, [
          R().el('h2', { className: 'post-title', text: title }),
          R().el('p', { className: 'post-description', text: desc.length > 150 ? desc.slice(0, 150) + '\u2026' : desc }),
          R().el('div', { className: 'post-meta' }, [
            R().el('div', { className: 'meta-item' }, [R().icon('fa-user'), ' ' + author])
          ])
        ]),
        R().el('div', { className: 'side-actions' }, [
          actionBtn('like-action', 'fa-heart', likes, id, 'like'),
          actionBtn('comment-action', 'fa-comment', comments, id, 'comment'),
          actionBtn('share-action', 'fa-share', shares, id, 'share'),
          actionBtn('save-action', 'fa-bookmark', saves, id, 'save')
        ])
      ])
    ]);
  }
  function actionBtn(cls, icon, count, postId, kind) {
    return R().el('button', {
      type: 'button',
      className: 'action-btn ' + cls,
      dataset: { postId: postId, action: kind },
      onclick: function () {
        if (kind === 'like' && global.HshsData && global.HshsData.toggleLike) global.HshsData.toggleLike(postId);
        else if (kind === 'like' && global.reactionManager) global.reactionManager.toggleLike(postId);
        else if (kind === 'share' && global.reactionManager) global.reactionManager.sharePost(postId);
      }
    }, [
      R().el('i', { className: 'far ' + icon }),
      R().el('div', { className: 'action-count', text: String(count) })
    ]);
  }
  global.HshsUI = { skeleton: skeleton, emptyState: emptyState, btn: btn, sectionTitle: sectionTitle, hero: hero, pageHeader: pageHeader, mediaCard: mediaCard, postCard: postCard };
})(typeof window !== 'undefined' ? window : this);
