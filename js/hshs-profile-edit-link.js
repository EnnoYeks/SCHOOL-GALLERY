/** Redirect Edit profile on profile page to full edit-profile experience */
(function () {
  if (window.__hshsProfileEditLink) return;
  window.__hshsProfileEditLink = true;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pf="edit"], .pf-btn[data-pf="edit"]');
    if (!btn) return;
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (file !== 'profile.html' && !document.getElementById('pfTools')) return;
    e.preventDefault();
    e.stopPropagation();
    var dest = location.pathname.indexOf('/index/') !== -1 ? 'edit-profile.html' : 'index/edit-profile.html';
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(dest);
    else location.href = dest;
  }, true);
})();
