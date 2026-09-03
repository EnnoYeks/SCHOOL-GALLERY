// Simple footer component — keeps footer dynamic pieces updated and re-attach handlers
export function init() {
  const footer = document.querySelector('footer.footer');
  if (!footer) return;
  // Update copyright year if present
  const bottom = footer.querySelector('.footer-bottom p');
  if (bottom) {
    const year = new Date().getFullYear();
    bottom.textContent = `© ${year} HSHS World. All rights reserved.`;
  }
}
