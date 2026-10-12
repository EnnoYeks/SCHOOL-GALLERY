(function (global) {
  'use strict';
  if (global.HshsRender) return;
  function fadeSkeleton(root) { var sk = root && root.querySelector('.hshs-load-skel'); if (!sk || !sk.parentNode) return; sk.classList.add('is-leaving'); setTimeout(function(){ if(sk && sk.parentNode) sk.parentNode.removeChild(sk); }, 150); }
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
    if (mountedReal(root)) revealPage();
    return root;
  }
  function revealPage() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (typeof window.__hshsRevealPage === 'function') {
          // paint.js holds the early reveal while the skeleton is the only content.
          // A real mount reaches this point, so release the guard before revealing.
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
        fadeSkeleton(document.getElementById('hshs-page'));
      });
    });
  }
  function mountedReal(root) {
    if (!root || root.id !== 'hshs-page') return false;
    var sk = root.querySelector('.hshs-load-skel');
    return root.childElementCount > (sk ? 1 : 0);
  }
  function mountHTML(target, html) {
    var page = document.documentElement.getAttribute('data-hshs-page');
    if (global.HshsSkeleton && page) global.HshsSkeleton.insert(typeof target === 'string' ? document.querySelector(target) : target, page);
    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) return null;
    var skel = root.querySelector('.hshs-load-skel');
    clear(root);
    var wrap = document.createElement('div');
    wrap.innerHTML = html || '';
    while (wrap.firstChild) root.appendChild(wrap.firstChild);
    if (skel) root.appendChild(skel);
    if (mountedReal(root)) revealPage();
    return root;
  }
  function icon(name, extra) {
    return el('i', { className: 'fas ' + name + (extra ? ' ' + extra : '') });
  }
  global.HshsRender = { el: el, clear: clear, mount: mount, mountHTML: mountHTML, icon: icon };
})(typeof window !== 'undefined' ? window : this);
