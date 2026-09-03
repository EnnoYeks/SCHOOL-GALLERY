/* More hub - same rows and profile card as the static page. */
(function (rootExport) {
  function html() {
    return `
<main class="hshs-account-page">
  <a class="hshs-me-card" href="profile.html" id="morePageMe">
    <img class="hshs-me-pic" id="morePagePic" alt="Your profile">
    <span class="hshs-me-copy">
      <strong id="morePageName">Guest student</strong>
      <small id="morePageEmail">student@hshs.ac.ug</small>
      <em id="morePageRole">HSHS Student</em>
    </span>
    <span class="hshs-me-go"><i class="fas fa-user"></i> View Profile</span>
  </a>
  <div class="hshs-menu-list" id="hshsMoreMenu">
    <p class="hshs-menu-kicker">You</p>
    <a class="hshs-menu-item" href="profile.html"><i class="fas fa-user"></i><span><b>Profile</b><small>View and edit your profile</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="chat.html"><i class="fas fa-envelope"></i><span><b>Messages</b><small>Chats with friends and clubs</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="notifications.html"><i class="fas fa-bell"></i><span><b>Notifications</b><small>Alerts, mentions and school updates</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="saved.html"><i class="fas fa-star"></i><span><b>Saved</b><small>Saved and interacted posts</small></span><i class="fas fa-chevron-right"></i></a>
    <p class="hshs-menu-kicker">Campus</p>
    <a class="hshs-menu-item" href="gallery.html"><i class="fas fa-image"></i><span><b>Gallery</b><small>All photos and videos</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="photos.html"><i class="fas fa-camera"></i><span><b>Photos</b><small>School photo albums</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="videos.html"><i class="fas fa-play"></i><span><b>Vibe</b><small>Campus videos</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="buzz.html"><i class="fas fa-bolt"></i><span><b>Buzz</b><small>Short clips from around school</small></span><i class="fas fa-chevron-right"></i></a>
    <p class="hshs-menu-kicker">Discover</p>
    <a class="hshs-menu-item" href="trending.html"><i class="fas fa-fire"></i><span><b>Trending</b><small>What the school is talking about</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="spotlight.html"><i class="fas fa-trophy"></i><span><b>Spotlight</b><small>Featured students and moments</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="polls.html"><i class="fas fa-square-poll-vertical"></i><span><b>Polls</b><small>Vote on school questions</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="memories.html"><i class="fas fa-clock-rotate-left"></i><span><b>Memories</b><small>Past events and school history</small></span><i class="fas fa-chevron-right"></i></a>
    <p class="hshs-menu-kicker">Account</p>
    <a class="hshs-menu-item" href="settings.html"><i class="fas fa-gear"></i><span><b>Settings</b><small>Theme, account and preferences</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="settings.html#privacy"><i class="fas fa-shield-halved"></i><span><b>Privacy</b><small>Privacy settings and controls</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="about.html"><i class="fas fa-graduation-cap"></i><span><b>About</b><small>About HSHS World</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="contat.html"><i class="fas fa-circle-question"></i><span><b>Help &amp; Support</b><small>Get help and contact support</small></span><i class="fas fa-chevron-right"></i></a>
  </div>
</main>`;
  }
  function mount() {
    const root = document.getElementById('hshsMoreRoot');
    if (!root || root.dataset.mounted === '1') return;
    root.innerHTML = html();
    root.dataset.mounted = '1';
  }
  rootExport.renderMore = html;
  rootExport.initMore = mount;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})(typeof window !== 'undefined' ? (window.HshsPages = window.HshsPages || {}) : {});
export function render() { return window.HshsPages.renderMore(); }
export function init() { if (window.HshsPages.initMore) window.HshsPages.initMore(); }
