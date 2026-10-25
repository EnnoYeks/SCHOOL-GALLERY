(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates['admin']=`
<div class="admin-container container" id="adminDesk" style="margin-top:70px;padding:1.5rem;position:relative;z-index:10;max-width:1200px;margin-left:auto;margin-right:auto">
  <div id="adminPanels">
    <header class="admin-welcome">
      <div>
        <p class="admin-eyebrow">HSHS WORLD · CONTROL ROOM</p>
        <h1>Good to see you, admin.</h1>
        <p class="admin-muted">Pin Featured Today and manage Upcoming Events.</p>
      </div>
      <button class="admin-btn admin-btn-quiet" id="adminRefresh" type="button"><i class="fa-solid fa-rotate"></i> Refresh</button>
    </header>
    <section class="admin-stat-grid">
      <article class="admin-stat"><p>Posts</p><strong id="adminPostCount">0</strong><small>Latest content</small></article>
      <article class="admin-stat"><p>Photos</p><strong id="adminPhotoCount">0</strong><small>Gallery uploads</small></article>
      <article class="admin-stat"><p>Videos</p><strong id="adminVideoCount">0</strong><small>Video uploads</small></article>
      <article class="admin-stat"><p>Upcoming events</p><strong id="adminEventCount">0</strong><small>School calendar</small></article>
    </section>
    <div class="admin-work-grid">
      <section class="admin-panel">
        <div class="admin-panel-head">
          <div>
            <p class="admin-eyebrow">HOMEPAGE</p>
            <h2>Featured Today</h2>
            <p class="admin-muted">Pin a post, photo or video to the homepage.</p>
          </div>
        </div>
        <div id="recentItems" class="admin-item-list"><div class="admin-empty">Loading…</div></div>
        <details class="admin-manual-pin">
          <summary>Pin by item ID</summary>
          <div class="admin-inline-form">
            <input id="pinId" placeholder="Item ID">
            <select id="pinCol"><option value="posts">posts</option><option value="photos">photos</option><option value="videos">videos</option></select>
            <button id="pinBtn" class="admin-btn admin-btn-primary" type="button">Pin</button>
            <button id="unpinBtn" class="admin-btn admin-btn-quiet" type="button">Unpin</button>
          </div>
        </details>
      </section>
      <section class="admin-panel">
        <div class="admin-panel-head">
          <div>
            <p class="admin-eyebrow">SCHOOL CALENDAR</p>
            <h2>Upcoming Events</h2>
            <p class="admin-muted">Keep everyone in the loop.</p>
          </div>
        </div>
        <form class="admin-event-form" id="adminEventForm">
          <label>Event name<input id="evTitle" placeholder="Event title" required></label>
          <div class="admin-form-row">
            <label>Date<input id="evDate" type="date" required></label>
            <label>Location<input id="evPlace" placeholder="Campus"></label>
          </div>
          <button id="addEventBtn" class="admin-btn admin-btn-primary" type="submit">Add event</button>
          <p id="adminFeedback" class="admin-feedback"></p>
        </form>
        <div id="eventsList" class="admin-event-list"><div class="admin-empty">Loading…</div></div>
      </section>
    </div>
  </div>
</div>
<div class="admin-lock" id="adminLock" style="display:none"></div>
`;})(typeof window!=='undefined'?window:this);
