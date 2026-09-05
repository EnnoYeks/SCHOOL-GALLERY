(function (global) {
  'use strict';
  if (global.HshsRender) return;
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
    return root;
  }
  function icon(name, extra) {
    return el('i', { className: 'fas ' + name + (extra ? ' ' + extra : '') });
  }
  global.HshsRender = { el: el, clear: clear, mount: mount, icon: icon };
})(typeof window !== 'undefined' ? window : this);
