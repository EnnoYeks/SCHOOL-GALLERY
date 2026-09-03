export async function render() {
  try {
    const resp = await fetch('index/gallery.html', { cache: 'no-store' });
    if (!resp.ok) return '';
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main') || doc.body;
    return main.innerHTML;
  } catch (e) {
    console.error('gallery.render error', e);
    return '';
  }
}

export function init({ root } = {}) {
  if (window.hshsNavigation && typeof window.hshsNavigation.init === 'function') {
    try { window.hshsNavigation.init(); } catch (e) { console.warn(e); }
  }
  if (typeof window.initGallery === 'function') {
    try { window.initGallery(root); } catch (e) { console.warn(e); }
  }
}
