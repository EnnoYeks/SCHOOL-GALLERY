export async function render() {
  try {
    const resp = await fetch('index/contat.html', { cache: 'no-store' });
    if (!resp.ok) return '';
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main') || doc.body;
    return main.innerHTML;
  } catch (e) {
    console.error('contat.render error', e);
    return '';
  }
}

export function init({ root } = {}) {}
