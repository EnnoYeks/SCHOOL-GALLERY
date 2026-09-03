// Card helper returns a simple card HTML string — used by pages when rendering lists
export function renderCard({ title = '', image = '', meta = '' } = {}) {
  return `
    <article class="hshs-card">
      ${image ? `<div class="hshs-card-media"><img src="${image}" alt="${title}"></div>` : ''}
      <div class="hshs-card-body">
        <h3 class="hshs-card-title">${title}</h3>
        <div class="hshs-card-meta">${meta}</div>
      </div>
    </article>
  `;
}
