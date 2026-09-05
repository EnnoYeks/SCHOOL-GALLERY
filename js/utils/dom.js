(function (global) {
  'use strict';
  if (global.HshsDom) return;
  global.HshsDom = {
    qs: function (sel, root) { return (root || document).querySelector(sel); },
    qsa: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    on: function (el, event, fn, opts) { if (!el) return function () {}; el.addEventListener(event, fn, opts || false); return function () { el.removeEventListener(event, fn, opts || false); }; },
    create: function (tag, attrs, children) {
      var el = document.createElement(tag);
      if (attrs) Object.keys(attrs).forEach(function (k) {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'text') el.textContent = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
      if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
      return el;
    }
  };
})(typeof window !== 'undefined' ? window : this);
