(function (global) {
  'use strict';
  if (global.__hshsContactPageModule) return;
  global.__hshsContactPageModule = true;

  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'contat.html' || f === 'contact.html';
  }

  function loadCss() {
    if (document.getElementById('hshs-contact-css')) return;
    var link = document.createElement('link');
    link.id = 'hshs-contact-css';
    link.rel = 'stylesheet';
    link.href = (location.pathname.indexOf('/index/') !== -1 ? '../' : '') + 'css/hshs-contact.css?v=260906c2';
    document.head.appendChild(link);
  }

  function setStatus(text, ok) {
    var status = document.getElementById('contactStatus');
    if (!status) return;
    status.textContent = text || '';
    status.classList.toggle('is-success', !!ok);
    status.classList.toggle('is-error', !ok && !!text);
  }

  function wireForm() {
    var form = document.getElementById('contactForm');
    if (!form || form.__hshsBound) return;
    form.__hshsBound = true;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus('', false);
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var subject = String(data.get('subject') || '').trim();
      var category = String(data.get('category') || '').trim();
      var message = String(data.get('message') || '').trim();
      if (!name || !email || !subject || !message) return;

      var body = [
        'Name: ' + name,
        'Email: ' + email,
        'Category: ' + (category || 'General Inquiry'),
        '',
        message
      ].join('\n');

      var href = 'mailto:info@hshs.ac.ug?subject=' + encodeURIComponent('[HSHS World] ' + subject) + '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app…', true);
      window.location.href = href;
    });
  }

  function mount() {
    if (!isPage()) return;
    var root = document.getElementById('hshs-page');
    if (!root || !global.HshsTemplates || !global.HshsTemplates.contact || !global.HshsRender) return;

    loadCss();
    global.HshsRender.mountHTML(root, global.HshsTemplates.contact);
    document.documentElement.setAttribute('data-hshs-page', 'contact');
    wireForm();
    console.info('[HSHS] JS-first page active: contact');
  }

  function boot() {
    if (!isPage()) return;
    var run = function () {
      if (!isPage()) return;
      if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') {
        global.HshsApp.whenReady(mount);
      } else if (global.HshsRender && global.HshsTemplates && global.HshsTemplates.contact) {
        mount();
      } else {
        setTimeout(run, 40);
      }
    };
    run();
  }

  global.initHshsContact = boot;

  document.addEventListener('hshs:page', function (event) {
    var page = event && event.detail && event.detail.page;
    if (page === 'contact' || isPage()) boot();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
