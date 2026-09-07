(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="ig-profile" aria-label="Profile">
      <header class="ig-top">
        <button type="button" class="ig-ico" data-ig="create" aria-label="Create"><i class="fas fa-plus"></i></button>
        <button type="button" class="ig-userpick" data-ig="accounts">
          <strong id="igUsername">hshs_world</strong>
          <i class="fas fa-chevron-down"></i>
          <span class="ig-live" id="igLiveDot"></span>
        </button>
        <div class="ig-top-right">
          <button type="button" class="ig-ico" data-ig="threads" aria-label="Messages"><i class="fas fa-comment-dots"></i></button>
          <button type="button" class="ig-ico" data-ig="menu" aria-label="Menu"><i class="fas fa-bars"></i></button>
        </div>
      </header>
      <section class="ig-header">
        <div class="ig-row">
          <div class="ig-avatar-col">
            <div class="ig-avatar-wrap has-story" id="igStoryRing">
              <span class="ig-avatar-fallback" id="igAvatarFall">H</span>
              <img id="igAvatar" alt="">
              <button type="button" class="ig-add" data-ig="create" aria-label="Add photo">+</button>
            </div>
          </div>
          <div class="ig-stats">
            <button type="button"><strong id="igPosts">—</strong><span>posts</span></button>
            <button type="button"><strong id="igFollowers">—</strong><span>followers</span></button>
            <button type="button"><strong id="igFollowing">—</strong><span>following</span></button>
          </div>
        </div>
        <h1 id="igName">HSHS World</h1>
        <p class="ig-role" id="igRole">Hawthorne Scribner High School</p>
        <p class="ig-bio" id="igBio">Your school. One world. Photos, Vibe, and memories from Bududa Kikholo.</p>
        <a class="ig-linkchip" href="../index.html"><i class="fas fa-link"></i> <span>hshsgallery.vercel.app</span></a>
      </section>
      <section class="ig-actions" id="igActions">
        <button class="ig-btn" type="button" data-ig="edit">Edit profile</button>
        <button class="ig-btn" type="button" data-ig="share">Share profile</button>
        <button class="ig-btn-sq" type="button" data-ig="refresh" aria-label="Refresh"><i class="fas fa-rotate"></i></button>
      </section>
      <section class="ig-highlights" id="igHighlights" aria-label="Highlights"></section>
      <nav class="ig-tabs" role="tablist">
        <button class="on" data-tab="grid" aria-label="Posts"><i class="fas fa-border-all"></i></button>
        <button data-tab="reels" aria-label="Reels"><i class="fas fa-play"></i></button>
        <button data-tab="tagged" aria-label="Reposts"><i class="fas fa-retweet"></i></button>
        <button data-tab="saved" aria-label="Saved"><i class="fas fa-user-tag"></i></button>
      </nav>
      <section class="ig-grid" id="igGrid" aria-live="polite">
        <i class="ig-skel"></i><i class="ig-skel"></i><i class="ig-skel"></i>
        <i class="ig-skel"></i><i class="ig-skel"></i><i class="ig-skel"></i>
      </section>
    </main>
    <div class="ig-modal" id="igModal" hidden>
      <button class="ig-modal-x" type="button" data-ig="close-modal" aria-label="Close"><i class="fas fa-xmark"></i></button>
      <div class="ig-modal-stage" id="igModalStage"></div>
      <div class="ig-modal-cap" id="igModalCap"></div>
    </div>
    <div class="ig-sheet" id="igEditSheet" hidden>
      <div class="ig-sheet-card">
        <div class="ig-sheet-h"><strong>Edit profile</strong><button type="button" data-ig="close-edit">Done</button></div>
        <label>Name<input id="igEditName" maxlength="40"></label>
        <label>Username<input id="igEditUser" maxlength="24"></label>
        <label>Bio<textarea id="igEditBio" maxlength="180" rows="4"></textarea></label>
        <button type="button" class="ig-save" data-ig="save-edit">Save</button>
      </div>
    </div>`;
})(typeof window !== 'undefined' ? window : this);
