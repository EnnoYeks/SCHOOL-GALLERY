(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};

  global.HshsTemplates.buzz = `
    <main class="buzz-page vibe-feed" aria-label="HSHS Vibe">
      <div class="buzz-progress" id="buzzProgress" aria-hidden="true"></div>

      <header class="buzz-topbar" id="vibeChromeTop">
        <div class="vibe-tabs" role="tablist" aria-label="Vibe feeds">
          <button class="vibe-switch" type="button" data-buzz-action="feed" data-feed="following" role="tab">Following</button>
          <button class="vibe-switch is-on" type="button" data-buzz-action="feed" data-feed="discover" role="tab" aria-selected="true">Discover</button>
        </div>
        <a class="buzz-studio" href="videos.html" title="HSHS Studio" aria-label="Open HSHS Studio">
          <i class="fas fa-clapperboard"></i>
        </a>
      </header>

      <section class="buzz-feed" id="buzzFeed" aria-live="polite">
        <div class="buzz-state" id="buzzLoading">
          <div class="hshs-wave" aria-hidden="true"><i></i><i></i><i></i></div>
          <strong>Loading Vibe</strong>
          <small>Finding the latest HSHS moments…</small>
        </div>
      </section>

      <div class="buzz-toast" id="buzzToast" role="status"></div>

      <div class="buzz-comments" id="buzzComments" hidden>
        <div class="buzz-sheet-handle" data-buzz-action="close-comments" aria-hidden="true"></div>
        <div class="buzz-comments-head">
          <strong>Comments</strong>
          <button type="button" data-buzz-action="close-comments" aria-label="Close comments"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="buzz-comment-list" id="buzzCommentList"></div>
        <form class="buzz-composer" id="buzzCommentForm" autocomplete="off">
          <input id="buzzCommentInput" type="text" maxlength="240" placeholder="Add a comment…" aria-label="Add a comment">
          <button type="submit" aria-label="Post comment"><i class="fas fa-paper-plane"></i></button>
        </form>
      </div>
    </main>`;
})(typeof window !== 'undefined' ? window : this);
