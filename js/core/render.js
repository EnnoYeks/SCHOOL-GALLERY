(function (global) {
  'use strict';
  if (global.HshsRender) return;

  function dropPageSkeletons(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('.hshs-load-skel, .hshs-skel-bottom');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'className' || k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'dataset' && typeof v === 'object') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  }
  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function mount(target, content) {
    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) return null;
    clear(root);
    if (Array.isArray(content)) content.forEach(function (c) { if (c) root.appendChild(c); });
    else if (content) root.appendChild(content);
    dropPageSkeletons(root);
    if (mountedReal(root)) revealPage();
    return root;
  }
  function revealPage() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dropPageSkeletons(document.getElementById('hshs-page'));
        if (typeof window.__hshsRevealPage === 'function') {
          window.__hshsRevealQueued = false;
          window.__hshsRevealPage();
          return;
        }
        if (window.__hshsRevealQueued) return;
        window.__hshsRevealQueued = true;
        var r = document.documentElement;
        r.classList.remove('hshs-booting');
        r.classList.add('hshs-ready');
        window.__hshsBootDone = true;
        var boot = document.getElementById('hshs-boot');
        if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
      });
    });
  }
  function mountedReal(root) {
    if (!root || root.id !== 'hshs-page') return false;
    return root.childElementCount > 0;
  }
  function mountHTML(target, html) {
    var page = document.documentElement.getAttribute('data-hshs-page');
    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) return null;
    var markup = html || '';
    if (!markup.replace(/\s+/g, '')) {
      if (global.HshsSkeleton && page && !root.querySelector('.hshs-load-skel')) {
        global.HshsSkeleton.insert(root, page);
      }
      return root;
    }
    clear(root);
    var wrap = document.createElement('div');
    wrap.innerHTML = markup;
    while (wrap.firstChild) root.appendChild(wrap.firstChild);
    // Real content owns the page. Never park a skeleton under it.
    dropPageSkeletons(root);
    if (mountedReal(root)) revealPage();
    return root;
  }
  function icon(name, extra) {
    return el('i', { className: 'fas ' + name + (extra ? ' ' + extra : '') });
  }
  global.HshsRender = { el: el, clear: clear, mount: mount, mountHTML: mountHTML, icon: icon, dropPageSkeletons: dropPageSkeletons };
})(typeof window !== 'undefined' ? window : this);
