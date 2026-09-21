(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.search = `
<main class="hs-search hshs-account-page" id="hshsSearchPage" aria-label="Search HSHS World">
  <div class="hshs-page-head">
    <a class="hshs-back" href="more.html" aria-label="Back to More"><i class="fas fa-chevron-left"></i></a>
    <h1>Search</h1>
  </div>
  <form class="hs-bar" id="hsSearchForm" autocomplete="off">
    <i class="fas fa-magnifying-glass lead" aria-hidden="true"></i>
    <input id="hsSearchInput" type="search" name="q" placeholder="Search people, photos, videos..." enterkeyhint="search" aria-label="Search campus">
    <button class="hs-clear" id="hsSearchClear" type="button" hidden aria-label="Clear search"><i class="fas fa-xmark"></i></button>
  </form>
  <div class="hs-tabs" role="tablist" aria-label="Search filters">
    <button type="button" class="hs-tab on" data-hs-tab="all" role="tab" aria-selected="true">All</button>
    <button type="button" class="hs-tab" data-hs-tab="people" role="tab">People</button>
    <button type="button" class="hs-tab" data-hs-tab="photos" role="tab">Photos</button>
    <button type="button" class="hs-tab" data-hs-tab="videos" role="tab">Videos</button>
  </div>
  <div id="hsSearchHome">
    <p class="hs-kicker">Recent</p>
    <div class="hs-chip-row" id="hsRecent"></div>
    <p class="hs-kicker">Suggested people</p>
    <div class="hs-people" id="hsSuggest"></div>
    <p class="hs-kicker">Jump in</p>
    <div class="hs-shortcuts">
      <a class="hs-short" href="gallery.html"><i class="fas fa-image"></i><span><b>Gallery</b><small>All campus posts</small></span></a>
      <a class="hs-short" href="photos.html"><i class="fas fa-camera"></i><span><b>Photos</b><small>Albums and stills</small></span></a>
      <a class="hs-short" href="videos.html"><i class="fas fa-play"></i><span><b>Studio</b><small>School videos</small></span></a>
      <a class="hs-short" href="trending.html"><i class="fas fa-fire"></i><span><b>Trending</b><small>What is buzzing</small></span></a>
    </div>
  </div>
  <div id="hsSearchResults" hidden>
    <p class="hs-count" id="hsCount"></p>
    <section id="hsPeopleOut"></section>
    <section class="hs-grid" id="hsMediaOut"></section>
    <div id="hsEmpty" hidden></div>
  </div>
</main>`;
})(typeof window !== 'undefined' ? window : this);
