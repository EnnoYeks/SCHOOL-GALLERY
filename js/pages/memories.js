(function (global) {
  'use strict';
  var PAGE = 'memories';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'memories.html';
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global['__hshs' + PAGE + 'Mounted']) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) {
      if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
      else root.innerHTML = tpl;
    }
    global['__hshs' + PAGE + 'Mounted'] = true;
    console.info('[HSHS] JS-first full page active:', PAGE);
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
