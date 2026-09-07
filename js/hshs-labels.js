(function () {
  if (window.__hshsLabels) return;
  window.__hshsLabels = true;

  function relabel() {
    document.querySelectorAll('a[href*="videos.html"]').forEach(function (a) {
      a.querySelectorAll('span, b, small').forEach(function (n) {
        if (n.textContent.trim() === 'Vibe') n.textContent = 'HSHS Studio';
        if (n.textContent.trim() === 'Campus videos') n.textContent = 'Official school videos';
      });
      if (a.textContent.trim() === 'Vibe') {
        var only = true;
        a.childNodes.forEach(function (n) { if (n.nodeType === 1 && n.matches('i,svg')) return; if (n.textContent && n.textContent.trim() && n.textContent.trim() !== 'Vibe') only = false; });
      }
    });
    document.querySelectorAll('a[href*="buzz.html"], a[data-tab="buzz"]').forEach(function (a) {
      a.querySelectorAll('span, b').forEach(function (n) {
        if (n.textContent.trim() === 'Buzz') n.textContent = 'Vibe';
      });
    });
    document.querySelectorAll('h1').forEach(function (h) {
      if (h.textContent.trim() === 'Buzz') h.textContent = 'Vibe';
      if (h.textContent.replace(/\s+/g, ' ').indexOf('School') !== -1 && h.textContent.indexOf('Vibe') !== -1) {
        h.innerHTML = 'HSHS <em>Studio</em>';
      }
    });
    if (/(buzz|clips|shorts)\.html/i.test(location.pathname)) document.title = 'Vibe \u00b7 HSHS World';
    if (/videos\.html/i.test(location.pathname)) document.title = 'HSHS Studio \u00b7 HSHS World';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', relabel, { once: true });
  else relabel();
  document.addEventListener('hshs:page', relabel);
  document.addEventListener('hshs:foundation-ready', relabel);
})();
