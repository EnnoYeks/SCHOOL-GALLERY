(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.profile = `
    <main class="pf" aria-label="Profile">
      <section class="pf-cover" id="pfCover">
        <div class="pf-cover-shade"></div>
        <button class="pf-cover-edit" type="button" data-pf="cover"><i class="fas fa-camera"></i><span>Edit Cover</span></button>
      </section>

      <section class="pf-profile-head">
        <div class="pf-identity">
          <div class="pf-ava-wrap">
            <div class="pf-ava" id="pfAva">
              <span id="pfAvaFall">?</span>
              <img id="pfAvaImg" alt="">
            </div>
            <button class="pf-ava-cam" type="button" data-pf="avatar" aria-label="Edit profile photo"><i class="fas fa-camera"></i></button>
          </div>

          <div class="pf-names">
            <div class="pf-session" id="pfSession"></div>
            <h1 id="pfName">Profile</h1>
            <p class="pf-handle" id="pfUser"></p>
            <p class="pf-role" id="pfRole"></p>
            <p class="pf-bio" id="pfBio"></p>
            <div class="pf-tags" id="pfTags"></div>
          </div>

          <div class="pf-tools" id="pfTools"></div>
        </div>

        <div class="pf-stats" aria-label="Profile statistics">
          <button type="button" data-pf="moments"><b id="pfPosts">0</b><span>Posts</span></button>
          <button type="button" data-pf="followers"><b id="pfFollowers">0</b><span>Followers</span></button>
          <button type="button" data-pf="following"><b id="pfFollowing">0</b><span>Following</span></button>
          <button type="button" data-tab="saved"><b id="pfSaved">0</b><span>Saved</span></button>
        </div>
      </section>

      <nav class="pf-tabs" role="tablist" aria-label="Profile content">
        <button class="on" data-tab="posts" type="button"><i class="fas fa-grid-2"></i><span>Posts</span></button>
        <button data-tab="photos" type="button"><i class="fas fa-image"></i><span>Photos</span></button>
        <button data-tab="videos" type="button"><i class="fas fa-play"></i><span>Videos</span></button>
        <button data-tab="likes" type="button"><i class="far fa-heart"></i><span>Likes</span></button>
        <button data-tab="saved" type="button"><i class="far fa-bookmark"></i><span>Saved</span></button>
        <button data-pf="followers" type="button"><i class="fas fa-user-group"></i><span>Friends</span></button>
      </nav>

      <section class="pf-grid" id="pfGrid" aria-live="polite">
        <i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i><i class="pf-skel"></i>
      </section>
    </main>

    <div class="pf-pop" id="pfPop" hidden>
      <button type="button" data-pf="refresh">Refresh</button>
      <button type="button" data-pf="settings">Settings</button>
    </div>

    <div class="pf-modal" id="pfModal" hidden>
      <button class="pf-modal-x" type="button" data-pf="close-modal" aria-label="Close"><i class="fas fa-xmark"></i></button>
      <div class="pf-modal-stage" id="pfModalStage"></div>
      <p class="pf-modal-cap" id="pfModalCap"></p>
    </div>

    <div class="pf-sheet" id="pfTagSheet" hidden>
      <div class="pf-sheet-card">
        <div class="pf-sheet-h"><strong id="pfTagTitle">Update</strong><button type="button" data-pf="close-tag">Done</button></div>
        <div class="pf-tag-options" id="pfTagOptions"></div>
      </div>
    </div>

    <div class="pf-sheet" id="pfEdit" hidden>
      <div class="pf-sheet-card">
        <div class="pf-sheet-h"><strong>Edit profile</strong><button type="button" data-pf="close-edit">Done</button></div>
        <label>Name<input id="pfEditName" maxlength="40"></label>
        <label>Username<input id="pfEditUser" maxlength="24"></label>
        <label>Class<input id="pfEditClass" maxlength="12" placeholder="S.4"></label>
        <label>Bio<textarea id="pfEditBio" maxlength="180" rows="4"></textarea></label>
        <label>House<select id="pfEditHouse"><option value="">No house yet</option><option>House A</option><option>House B</option><option>House C</option><option>House D</option></select></label>
        <button type="button" class="pf-save" data-pf="save-edit">Save</button>
      </div>
    </div>

    <div class="pf-sheet" id="pfPeople" hidden>
      <div class="pf-sheet-card">
        <div class="pf-sheet-h"><strong id="pfPeopleTitle">People</strong><button type="button" data-pf="close-people">Done</button></div>
        <div class="pf-people-list" id="pfPeopleList"></div>
      </div>
    </div>`;
})(typeof window !== 'undefined' ? window : this);
