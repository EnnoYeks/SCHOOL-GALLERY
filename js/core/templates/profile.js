(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="pf" aria-label="Profile">
      <section class="pf-cover" id="pfCover"></section>
      <section class="pf-band">
        <div class="pf-ava-wrap"><div class="pf-ava" id="pfAva"><span id="pfAvaFall">E</span><img id="pfAvaImg" alt=""></div></div>
        <div class="pf-names"><h1 id="pfUser">profile</h1><p class="pf-display" id="pfName"></p><p class="pf-role" id="pfRole"></p></div>
        <div class="pf-tools" id="pfTools"></div>
      </section>
      <p class="pf-bio" id="pfBio"></p>
      <div class="pf-tags" id="pfTags"></div>
      <div class="pf-stats">
        <button type="button"><b id="pfPosts">0</b><span>Posts</span></button>
        <button type="button"><b id="pfFollowers">0</b><span>Followers</span></button>
        <button type="button"><b id="pfFollowing">0</b><span>Following</span></button>
      </div>
      <section class="pf-highs" id="pfHighs"></section>
      <nav class="pf-tabs" role="tablist">
        <button class="on" data-tab="grid" type="button">Posts</button>
        <button data-tab="reels" type="button">Clips</button>
        <button data-tab="tagged" type="button">Tagged</button>
        <button data-tab="saved" type="button">Saved</button>
      </nav>
      <section class="pf-grid" id="pfGrid" aria-live="polite"><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i></section>
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
