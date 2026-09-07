(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="ig-profile" aria-label="Profile">
      <header class="ig-top">
        <button type="button" class="ig-ico" data-ig="create" aria-label="Create"><i class="fas fa-plus"></i></button>
        <button type="button" class="ig-userpick" data-ig="accounts">
          <strong id="igUsername">username</strong>
          <i class="fas fa-chevron-down"></i>
          <span class="ig-live" id="igLiveDot" hidden></span>
        </button>
        <div class="ig-top-right">
          <button type="button" class="ig-ico" data-ig="threads" aria-label="Messages"><i class="fas fa-comment-dots"></i></button>
          <button type="button" class="ig-ico" data-ig="menu" aria-label="Menu"><i class="fas fa-bars"></i></button>
        </div>
      </header>
      <section class="ig-header">
        <div class="ig-row">
          <div class="ig-avatar-col">
            <button type="button" class="ig-chip" id="igNote" hidden></button>
            <div class="ig-avatar-wrap" id="igStoryRing">
              <img id="igAvatar" alt="Profile photo" width="90" height="90">
              <button type="button" class="ig-add" data-ig="create" aria-label="Add photo">+</button>
            </div>
          </div>
          <div class="ig-stats">
            <button type="button" data-ig="stat-posts"><strong id="igPosts">0</strong><span>posts</span></button>
            <button type="button" data-ig="stat-followers"><strong id="igFollowers">0</strong><span>followers</span></button>
            <button type="button" data-ig="stat-following"><strong id="igFollowing">0</strong><span>following</span></button>
          </div>
        </div>
        <h1 id="igName">Display name</h1>
        <p class="ig-bio" id="igBio"></p>
        <button type="button" class="ig-more" id="igBioMore" hidden>more</button>
        <a class="ig-linkchip" id="igLinkChip" hidden><i class="fas fa-link"></i> <span></span></a>
      </section>
      <section class="ig-actions" id="igActions"></section>
      <nav class="ig-tabs" role="tablist">
        <button class="on" data-tab="grid" aria-label="Posts"><i class="fas fa-border-all"></i></button>
        <button data-tab="reels" aria-label="Reels"><i class="fas fa-play"></i></button>
        <button data-tab="tagged" aria-label="Reposts"><i class="fas fa-retweet"></i></button>
        <button data-tab="saved" aria-label="Saved"><i class="fas fa-user-tag"></i></button>
      </nav>
      <section class="ig-grid" id="igGrid" aria-live="polite"></section>
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
