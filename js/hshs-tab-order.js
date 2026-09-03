(function () {
  if (window.__hshsTabOrder) return;
  window.__hshsTabOrder = true;

  function file() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function injectCampusCss() {
    if (document.getElementById('hshs-campus-wire-css')) return;
    var link = document.createElement('link');
    link.id = 'hshs-campus-wire-css';
    link.rel = 'stylesheet';
    link.href = '/css/hshs-campus-wire.css?v=260903h';
    document.head.appendChild(link);
  }

  function wireMoreLink() {
    var bar = document.querySelector('.mobile-tabbar');
    if (!bar) return;
    var old = bar.querySelector('[data-tab="more"]');
    if (!old) return;
    var a = document.createElement('a');
    a.href = '/index/more.html';
    a.className = old.className || '';
    a.setAttribute('data-tab', 'more');
    a.innerHTML = '<i class="fas fa-ellipsis"></i><span>More</span>';
    if (file() === 'more.html') a.classList.add('active');
    old.replaceWith(a);
  }

  function fixTabHrefs() {
    var bar = document.querySelector('.mobile-tabbar');
    if (!bar) return;
    var home = bar.querySelector('[data-tab="home"]');
    var gallery = bar.querySelector('[data-tab="gallery"]');
    var buzz = bar.querySelector('[data-tab="buzz"]');
    if (home) home.setAttribute('href', '/index.html');
    if (gallery) gallery.setAttribute('href', '/index/gallery.html');
    if (buzz) buzz.setAttribute('href', '/index/buzz.html');
  }

  function reorderTabs() {
    var bar = document.querySelector('.mobile-tabbar');
    if (!bar) return;
    wireMoreLink();
    fixTabHrefs();
    var home = bar.querySelector('[data-tab="home"]');
    var gallery = bar.querySelector('[data-tab="gallery"]');
    var buzz = bar.querySelector('[data-tab="buzz"]');
    var plus = bar.querySelector('[data-tab="upload"]');
    var more = bar.querySelector('[data-tab="more"]');
    if (!(home && gallery && buzz && plus && more)) return;
    bar.appendChild(home);
    bar.appendChild(gallery);
    bar.appendChild(plus);
    bar.appendChild(buzz);
    bar.appendChild(more);
    var f = file();
    bar.querySelectorAll('a').forEach(function (el) { el.classList.remove('active'); });
    if (f === 'index.html' || f === '') home.classList.add('active');
    else if (f === 'gallery.html') gallery.classList.add('active');
    else if (f === 'buzz.html' || f === 'clips.html') buzz.classList.add('active');
    else more.classList.add('active');
  }

  function fillMorePage() {
    var name = document.getElementById('morePageName');
    var email = document.getElementById('morePageEmail');
    var role = document.getElementById('morePageRole');
    var pic = document.getElementById('morePagePic');
    var p = {};
    try { p = JSON.parse(localStorage.getItem('userProfile') || '{}') || {}; } catch (e) {}
    if (name) {
      name.textContent = p.fullName || 'John Doe';
      if (!name.querySelector('.fa-circle-check')) {
        name.insertAdjacentHTML('beforeend', ' <i class="fas fa-circle-check brand-tick" aria-hidden="true"></i>');
      }
    }
    if (email) email.textContent = p.email || 'john.doe@hshs.ac.ug';
    if (role) role.textContent = p.role ? String(p.role) : 'HSHS Student';
    if (pic && (!pic.getAttribute('src') || /placeholder/i.test(pic.getAttribute('src')))) {
      pic.src = 'https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png';
    }
    document.body.setAttribute('data-hshs-page', (file() || 'home').replace('.html', ''));
    document.body.classList.add('dark-mode', 'has-mobile-shell');
    document.body.classList.remove('light-mode');
  }

  function boot() {
    injectCampusCss();
    fillMorePage();
    reorderTabs();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('app:page:loaded', boot);
  setTimeout(boot, 250);
  setTimeout(boot, 900);
})();
