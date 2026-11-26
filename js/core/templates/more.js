(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.more = `
<main class="hshs-account-page" id="hshsMorePage" aria-label="More HSHS World pages">
  <header class="hshs-page-head">
    <h1>More</h1>
    <a class="hshs-menu-item hshs-more-search" href="/search/" aria-label="Search HSHS World"><i class="fas fa-search"></i><span><b>Search</b></span></a>
  </header>

  <section class="hshs-me-card" id="morePageMe" aria-label="Your account">
    <a class="hshs-me-main" href="/profile/">
      <div class="hshs-me-pic" id="morePagePic" aria-hidden="true"><b>H</b></div>
      <div class="hshs-me-copy">
        <strong id="morePageName">Loading account…</strong>
        <small id="morePageEmail"> </small>
        <em id="morePageRole">Student</em>
      </div>
    </a>
    <div class="hshs-me-actions">
      <span id="morePageStatus" class="hshs-session-badge is-guest"><i class="fas fa-user"></i> Guest</span>
      <a class="hshs-signin-cta" id="moreSignIn" href="/login/"><i class="fas fa-right-to-bracket"></i> Sign in</a>
      <a class="hshs-me-go" href="/profile/">Profile <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>

  <p class="hshs-menu-kicker">Community</p>
  <section class="hshs-more-menu" aria-label="Community pages">
    <a class="hshs-menu-item" href="/gallery/"><i class="fas fa-images"></i><span><b>Gallery</b><small>Campus posts and moments</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/photos/"><i class="fas fa-camera"></i><span><b>Photos</b><small>Photo collections</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/videos/"><i class="fas fa-play"></i><span><b>Studio</b><small>School videos</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/buzz/"><i class="fas fa-bolt"></i><span><b>Buzz</b><small>What's happening around campus</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/trending/"><i class="fas fa-fire"></i><span><b>Trending</b><small>Popular campus posts</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/polls/"><i class="fas fa-square-poll-vertical"></i><span><b>Polls</b><small>Vote and share your opinion</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/memories/"><i class="fas fa-clock-rotate-left"></i><span><b>Memories</b><small>School moments through time</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/chat/"><i class="fas fa-comments"></i><span><b>Chat</b><small>Talk with your school community</small></span><i class="fas fa-chevron-right"></i></a>
  </section>

  <p class="hshs-menu-kicker">Your account</p>
  <section class="hshs-more-menu" aria-label="Account pages">
    <a class="hshs-menu-item" href="/profile/"><i class="fas fa-user"></i><span><b>Profile</b><small>Your posts and campus profile</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/saved/"><i class="fas fa-bookmark"></i><span><b>Saved</b><small>Posts you've saved</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/notifications/"><i class="fas fa-bell"></i><span><b>Notifications</b><small>Your activity updates</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/settings/"><i class="fas fa-gear"></i><span><b>Settings</b><small>Account and preferences</small></span><i class="fas fa-chevron-right"></i></a>
  </section>

  <p class="hshs-menu-kicker">HSHS World</p>
  <section class="hshs-more-menu" aria-label="Information">
    <a class="hshs-menu-item" href="/about/"><i class="fas fa-graduation-cap"></i><span><b>About</b><small>About our school platform</small></span><i class="fas fa-chevron-right"></i></a>
    <a class="hshs-menu-item" href="/contact/"><i class="fas fa-envelope"></i><span><b>Contact</b><small>Reach the HSHS World team</small></span><i class="fas fa-chevron-right"></i></a>
  </section>
</main>`;
})(typeof window !== 'undefined' ? window : this);
