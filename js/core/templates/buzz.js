(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};

  global.HshsTemplates.buzz = `
    <main class="buzz-page" aria-label="HSHS Buzz">
      <header class="buzz-topbar">
        <div>
          <span class="buzz-kicker">HSHS WORLD</span>
          <h1>Buzz</h1>
        </div>
        <div class="buzz-top-actions">
          <button class="buzz-top-btn" type="button" data-buzz-action="refresh" aria-label="Refresh Buzz"><i class="fas fa-arrows-rotate"></i></button>
          <button class="buzz-top-btn" type="button" data-buzz-action="upload" aria-label="Share a Buzz"><i class="fas fa-plus"></i></button>
        </div>
      </header>

      <section class="buzz-feed" id="buzzFeed" aria-live="polite">
        <div class="buzz-state" id="buzzLoading"><span class="buzz-spinner"></span><strong>Loading Buzz</strong><small>Finding the latest HSHS moments…</small></div>
      </section>

      <div class="buzz-progress" id="buzzProgress" aria-hidden="true"></div>
      <div class="buzz-toast" id="buzzToast" role="status"></div>

      <div class="buzz-comments" id="buzzComments" hidden>
        <div class="buzz-comments-head"><strong>Comments</strong><button type="button" data-buzz-action="close-comments" aria-label="Close comments"><i class="fas fa-xmark"></i></button></div>
        <div class="buzz-comment-list" id="buzzCommentList"></div>
      </div>
    </main>`;
})(typeof window !== 'undefined' ? window : this);
