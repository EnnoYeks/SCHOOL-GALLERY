(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="pf" aria-label="Profile">
      <header class="pf-appbar">
        <div class="pf-brand"><span class="pf-crown">♚</span><strong>HSHS</strong><small>SCHOOL GALLERY</small></div>
        <label class="pf-search"><i class="fas fa-magnifying-glass"></i><input id="pfSearch" type="search" placeholder="Search students, posts,..."></label>
        <button class="pf-bell" type="button" data-pf="alerts" aria-label="Notifications"><i class="fas fa-bell"></i><em id="pfBellCount">3</em></button>
        <button class="pf-icon" type="button" data-pf="menu" aria-label="More"><i class="fas fa-ellipsis-vertical"></i></button>
      </header>
      <section class="pf-cover" id="pfCover">
        <p class="pf-cover-script">More Than A School</p>
        <p class="pf-cover-line">PEOPLE • MOMENTS • STORIES • FOREVER</p>
        <p class="pf-cover-pride">HSHS Pride</p>
      </section>
      <section class="pf-band">
        <div class="pf-ava-wrap">
          <div class="pf-ava" id="pfAva"><span id="pfAvaFall">E</span><img id="pfAvaImg" alt=""></div>
          <i class="pf-online" id="pfOnline"></i>
        </div>
        <div class="pf-names">
          <h1><span id="pfUser">ennoyeks</span> <i class="fas fa-circle-check"></i></h1>
          <p class="pf-display" id="pfName">Enno Yeks</p>
          <p class="pf-role" id="pfRole">Student | HSHS</p>
        </div>
        <div class="pf-tools" id="pfTools"></div>
      </section>
      <p class="pf-bio" id="pfBio"></p>
      <p class="pf-motto" id="pfMotto"></p>
      <a class="pf-link" id="pfLink" href="https://hshsgallery.vercel.app">hshsgallery.vercel.app</a>
      <div class="pf-stats">
        <button type="button"><b id="pfPosts">0</b><span>Posts</span></button>
        <button type="button"><b id="pfFollowers">0</b><span>Followers</span></button>
        <button type="button"><b id="pfFollowing">0</b><span>Following</span></button>
      </div>
      <section class="pf-highs" id="pfHighs"></section>
      <nav class="pf-tabs" role="tablist">
        <button class="on" data-tab="grid" type="button"><i class="fas fa-border-all"></i> Posts</button>
        <button data-tab="reels" type="button"><i class="fas fa-play"></i> Reels</button>
        <button data-tab="tagged" type="button"><i class="fas fa-user-tag"></i> Tagged</button>
        <button data-tab="saved" type="button"><i class="fas fa-bookmark"></i> Saved</button>
      </nav>
      <section class="pf-grid" id="pfGrid" aria-live="polite"><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i></section>
    </main>
    <div class="pf-pop" id="pfPop" hidden>
      <button type="button" data-pf="refresh">Refresh</button>
      <button type="button" data-pf="switch">Switch account</button>
      <button type="button" data-pf="settings">Settings</button>
    </div>
    <div class="pf-modal" id="pfModal" hidden>
      <button class="pf-modal-x" type="button" data-pf="close-modal" aria-label="Close"><i class="fas fa-xmark"></i></button>
      <div class="pf-modal-stage" id="pfModalStage"></div>
      <p class="pf-modal-cap" id="pfModalCap"></p>
    </div>
    <div class="pf-sheet" id="pfEdit" hidden>
      <div class="pf-sheet-card">
        <div class="pf-sheet-h"><strong>Edit profile</strong><button type="button" data-pf="close-edit">Done</button></div>
        <label>Name<input id="pfEditName" maxlength="40"></label>
        <label>Username<input id="pfEditUser" maxlength="24"></label>
        <label>Bio<textarea id="pfEditBio" maxlength="180" rows="4"></textarea></label>
        <button type="button" class="pf-save" data-pf="save-edit">Save</button>
      </div>
    </div>`;
})(typeof window !== 'undefined' ? window : this);
