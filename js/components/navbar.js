export function init() {
  if (window.hshsNavigation && typeof window.hshsNavigation.init === 'function') {
    try { window.hshsNavigation.init(); } catch (e) { console.warn(e); }
  }
}
