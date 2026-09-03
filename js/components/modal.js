// Simple modal helper (minimal, dependency-free)
const MODAL_ID = 'hshs-global-modal';
function ensureModal() {
  let m = document.getElementById(MODAL_ID);
  if (m) return m;
  m = document.createElement('div');
  m.id = MODAL_ID;
  m.className = 'hshs-modal';
  m.innerHTML = `<div class="hshs-modal-backdrop"></div><div class="hshs-modal-content" role="dialog" aria-modal="true"></div>`;
  document.body.appendChild(m);
  m.querySelector('.hshs-modal-backdrop').addEventListener('click', hide);
  return m;
}

export function show(html) {
  const m = ensureModal();
  const content = m.querySelector('.hshs-modal-content');
  content.innerHTML = html || '';
  m.classList.add('active');
  content.focus && content.focus();
}

export function hide() {
  const m = document.getElementById(MODAL_ID);
  if (!m) return;
  m.classList.remove('active');
}

export function init() { ensureModal(); }
