import { renderPage } from '../components/page-templates.js';

export function render() {
  return renderPage('trending', `
    <section class="trending-hero">
      <div><span class="eyebrow">HSHS WORLD</span><h1>What's Trending 🔥</h1><p>See the moments getting the most attention across school.</p></div>
    </section>
    <div class="trending-search-wrap"><input id="searchInput" type="search" placeholder="Search trending posts..." aria-label="Search trending posts"><div id="searchResults" class="search-results"></div></div>
    <div class="trending-tabs" data-trending-tabs role="tablist" aria-label="Trending period">
      <button class="active" type="button" data-period="today">Today</button>
      <button type="button" data-period="week">This Week</button>
      <button type="button" data-period="month">This Month</button>
    </div>
    <div class="trending-layout">
      <main><div class="trending-list" id="trendingGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div></main>
      <aside class="trending-sidebar">
        <section><h2>Top Categories</h2><div id="topCategoriesGrid" class="top-categories-grid"></div></section>
        <section><h2>Most Liked</h2><ol id="topLikedList" class="leaderboard-list"></ol></section>
        <section><h2>Most Viewed</h2><ol id="topViewedList" class="leaderboard-list"></ol></section>
        <section><h2>Most Commented</h2><ol id="topCommentedList" class="leaderboard-list"></ol></section>
      </aside>
    </div>`);
}

export async function init() {
  if (window.hshsNavigation?.init) window.hshsNavigation.init();
  try { await import('../trending.js'); } catch (error) { console.error('Trending module failed to load:', error); }
}
