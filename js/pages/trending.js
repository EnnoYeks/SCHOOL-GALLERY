export const pageId = "trending";
export const styles = ["css/trending.css", "css/mobile-shell.css"];
export const scripts = ["js/trending.js", "js/trending-ui.js"];
export const rootIds = ["trendingGrid", "topTrendingHero"];
export const bodyClass = "dark-mode trending-body";
export function render() {
  return `<main class="trending-page"><div class="container">
    <header class="trending-header"><div class="trending-title-row"><div><span class="trending-kicker">HSHS NOW</span><h1>Trending</h1><p>What's hot in our school right now</p></div><label class="period-picker"><select id="periodSelect"><option value="today">Today</option><option value="week" selected>This Week</option><option value="month">This Month</option></select></label></div></header>
    <div class="trending-filters" data-content-filter>
      <button class="content-filter active" data-filter="all" type="button">All</button>
      <button class="content-filter" data-filter="video" type="button">Videos</button>
      <button class="content-filter" data-filter="image" type="button">Photos</button>
      <button class="content-filter" data-filter="events" type="button">Events</button>
      <button class="content-filter" data-filter="buzz" type="button">Buzz</button>
    </div>
    <section class="top-trending"><div id="topTrendingHero"></div><div id="topTrendingSide"></div></section>
    <section class="trending-section"><div class="section-heading"><h2>Trending Now</h2><button class="view-all-btn" id="viewAllTrending" type="button">View all</button></div><div class="trending-grid" id="trendingGrid"></div></section>
    <section class="hot-topics-section"><h2>Hot Topics</h2><div class="hot-topics" id="hotTopics"></div></section>
    <section class="desktop-insights">
      <div class="insight-card"><h3>Top Categories</h3><div id="topCategoriesGrid"></div></div>
      <div class="insight-card"><h3>Top Liked</h3><ol class="leaderboard-list" id="topLikedList"></ol></div>
      <div class="insight-card"><h3>Most Viewed</h3><ol class="leaderboard-list" id="topViewedList"></ol></div>
      <div class="insight-card"><h3>Most Discussed</h3><ol class="leaderboard-list" id="topCommentedList"></ol></div>
    </section>
  </div></main>`;
}
export async function init() {}
