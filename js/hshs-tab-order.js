(function () {
  if (window.__hshsTabOrder) return;
  window.__hshsTabOrder = true;

  function file() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }
  function inSub() {
    return location.pathname.indexOf('/index/') !== -1;
  }
  function path(name) {
    if (name === 'index.html') return inSub() ? '../index.html' : 'index.html';
    return inSub() ? name : 'index/' + name;
  }

  function wireBar() {
    var bar = document.querySelector('.mobile-tabbar');
    if (!bar) return;
    var home = bar.querySelector('[data-tab="home"]');
    var gallery = bar.querySelector('[data-tab="gallery"]');
    var buzz = bar.querySelector('[data-tab="buzz"]');
    var plus = bar.querySelector('[data-tab="upload"]');
    var more = bar.querySelector('[data-tab="more"]');
    if (!(home && gallery && buzz && plus && more)) return;

    if (home.tagName === 'A') home.setAttribute('href', path('index.html'));
    if (buzz.tagName === 'A') buzz.setAttribute('href', path('buzz.html'));
    if (gallery.tagName === 'A') gallery.setAttribute('href', path('gallery.html'));

    var moreLink = more;
    if (more.tagName !== 'A' || (more.getAttribute('href') || '').indexOf('more.html') === -1) {
      moreLink = document.createElement('a');
      moreLink.setAttribute('data-tab', 'more');
      moreLink.innerHTML = '<i class="fas fa-ellipsis"></i><span>More</span>';
      more.replaceWith(moreLink);
    }
    moreLink.setAttribute('href', path('more.html'));
    moreLink.className = more.className || '';

    bar.appendChild(home);
    bar.appendChild(buzz);
    bar.appendChild(plus);
    bar.appendChild(gallery);
    bar.appendChild(moreLink);

    var f = file();
    bar.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
    if (f === 'index.html' || f === '') home.classList.add('active');
    else if (f === 'buzz.html' || f === 'clips.html') buzz.classList.add('active');
    else if (f === 'gallery.html') gallery.classList.add('active');
    else moreLink.classList.add('active');
  }

  function boot() { wireBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('app:page:loaded', boot);
  setTimeout(boot, 200);
  setTimeout(boot, 800);
})();
