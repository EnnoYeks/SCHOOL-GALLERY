export async function render() {
  try {
    const resp = await fetch('index/polls.html', { cache: 'no-store' });
    if (!resp.ok) return '';
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main') || doc.body;
    return main.innerHTML;
  } catch (e) {
    console.error('polls.render error', e);
    return '';
  }
}

export function init({ root } = {}) {
  if (window.hshsNavigation && typeof window.hshsNavigation.init === 'function') {
    try { window.hshsNavigation.init(); } catch (e) { console.warn(e); }
  }
  if (typeof window.initPolls === 'function') {
    try { window.initPolls(root); } catch (e) { console.warn(e); }
  }
}
