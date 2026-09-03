export function init() {
  if (window.hshsNavigation && typeof window.hshsNavigation.init === 'function') {
    try { window.hshsNavigation.init(); } catch (e) { console.warn(e); }
  }
}

export function show() { document.documentElement.classList.add('hshs-loading'); }
export function hide() { document.documentElement.classList.remove('hshs-loading'); }
