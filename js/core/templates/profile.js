(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="pf" aria-label="Profile">
      <header class="pf-top">
        <strong id="pfHandle">profile</strong>
        <button type="button" class="pf-icon" data-pf="menu" aria-label="More"><i class="fas fa-ellipsis"></i></button>
      </header>
      <section class="pf-band">
        <div class="pf-ident">
          <div class="pf-ava" id="pfAva">
            <span id="pfAvaFall">?</span>
            <img id="pfAvaImg" alt="">
          </div>
          <div class="pf-names">
            <h1 id="pfName">Profile</h1>
            <p id="pfRole"></p>
            <p id="pfUser"></p>
          </div>
        </div>
        <div class="pf-tools" id="pfTools"></div>
      </section>
      <p class="pf-bio" id="pfBio"></p>
      <div class="pf-tags" id="pfTags"></div>
      <div class="pf-stats" id="pfStats">
        <button type="button"><b id="pfPosts">0</b><span>posts</span></button>
        <button type="button"><b id="pfFollowers">0</b><span>followers</span></button>
        <button type="button"><b id="pfFollowing">0</b><span>following</span></button>
      </div>
      <section class="pf-highs" id="pfHighs" hidden></section>
      <nav class="pf-tabs" role="tablist">
        <button class="on" data-tab="grid" type="button">Grid</button>
        <button data-tab="tagged" type="button">Tagged</button>
        <button data-tab="saved" type="button">Saved</button>
      </nav>
      <section class="pf-grid" id="pfGrid" aria-live="polite">
        <i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i>
        <i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i>
      </section>
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
