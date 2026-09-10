(function () {
  if (window.__hshsLabels) return;
  window.__hshsLabels = true;

  function relabel() {
    // Long videos page (videos.html) → Buzz
    document.querySelectorAll('a[href*="videos.html"]').forEach(function (a) {
      a.querySelectorAll('span, b, small').forEach(function (n) {
        var t = n.textContent.trim();
        if (t === 'Vibe' || t === 'HSHS Studio') n.textContent = 'Buzz';
        if (t === 'Campus videos') n.textContent = 'Long school videos';
      });
    });

    // Short clips page (buzz.html) → Vibe
    document.querySelectorAll('a[href*="buzz.html"], a[data-tab="buzz"]').forEach(function (a) {
      a.querySelectorAll('span, b, small').forEach(function (n) {
        if (n.textContent.trim() === 'Buzz') n.textContent = 'Vibe';
      });
    });

    document.querySelectorAll('h1, h2').forEach(function (h) {
      var raw = h.textContent.replace(/\s+/g, ' ').trim();
      if (raw === 'Buzz' && /buzz|clips|shorts/i.test(location.pathname)) {
        h.textContent = 'Vibe';
      }
      if (raw === 'Vibe' && /videos\.html/i.test(location.pathname)) {
        h.textContent = 'Buzz';
      }
      if (/videos\.html/i.test(location.pathname) && /HSHS/.test(raw) && /Studio|Vibe/.test(raw)) {
        h.textContent = 'Buzz';
      }
    });

    if (/(buzz|clips|shorts)\.html/i.test(location.pathname)) document.title = 'Vibe \u00b7 HSHS World';
    if (/videos\.html/i.test(location.pathname)) document.title = 'Buzz \u00b7 HSHS World';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', relabel, { once: true });
  else relabel();
  document.addEventListener('hshs:page', relabel);
  document.addEventListener('hshs:foundation-ready', relabel);
})();
