(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates.memories=`
<main class="hshs-memories-page">
  <section class="memories-hero">
    <div class="memories-hero-media" aria-hidden="true"></div>
    <div class="memories-hero-glow" aria-hidden="true"></div>
    <div class="memories-hero-content">
      <span class="memories-eyebrow"><i class="fas fa-book-open"></i> HSHS WORLD · MEMORIES</span>
      <h1>Our <span>HSHS</span> Story</h1>
      <p>Moments. People. Events. A school you’ll always remember.</p>
    </div>
    <div class="memories-hero-note">Same halls. Different years.<br><strong>Forever HSHS.</strong> <span>♥</span></div>
  </section>

  <nav class="memories-tabs" aria-label="Memories sections">
    <a class="is-active" href="#overview"><i class="fas fa-border-all"></i><span>Overview</span></a>
    <a href="#onThisDay"><i class="far fa-calendar"></i><span>On This Day</span></a>
    <a href="#timeline"><i class="far fa-clock"></i><span>Timeline</span></a>
    <a href="#years"><i class="fas fa-chart-column"></i><span>By Year</span></a>
    <a href="#birthdays"><i class="fas fa-cake-candles"></i><span>Birthdays</span></a>
    <a href="#myMemories"><i class="far fa-bookmark"></i><span>My Memories</span></a>
  </nav>

  <div id="overview"></div>

  <section class="memories-section memories-on-day" id="onThisDay">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-calendar-day"></i> TODAY IN HSHS HISTORY</span><h2>On This Day</h2><p>Look back at what happened on this date in HSHS.</p></div>
      <button class="memories-date-pill" type="button"><i class="far fa-calendar"></i><span id="memoryToday">Today</span><i class="fas fa-chevron-down"></i></button>
    </div>
    <div id="onThisDayGrid" class="memories-feature-grid"><div class="memories-loading">Loading memories…</div></div>
  </section>

  <section class="memories-section" id="reel">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-circle-play"></i> MOMENTS FROM AROUND SCHOOL</span><h2>Memory Reel</h2><p>A quick look at recent moments from across the school.</p></div>
      <div class="memories-filter" role="group" aria-label="Memory reel filters">
        <button class="is-active" type="button" data-memory-filter="all">All</button><button type="button" data-memory-filter="photo">Photos</button><button type="button" data-memory-filter="video">Videos</button><button type="button" data-memory-filter="event">Events</button><button type="button" data-memory-filter="mine">My Posts</button>
      </div>
    </div>
    <div id="memoryReel" class="memories-reel"><div class="memories-loading">Loading the reel…</div><a class="memories-share-card" href="../index/upload.html"><span>+</span><strong>Share a memory</strong></a></div>
  </section>

  <section class="memories-section" id="timeline">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-route"></i> THE STORY OF HSHS</span><h2>HSHS Timeline</h2><p>The biggest moments from this year and beyond.</p></div>
      <button class="memories-outline-btn" type="button" data-timeline-more>View full timeline <i class="fas fa-arrow-right"></i></button>
    </div>
    <div id="schoolTimeline" class="memories-timeline"><div class="memories-loading">Loading timeline…</div></div>
  </section>

  <section class="memories-section" id="years">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-chart-column"></i> THE ARCHIVE</span><h2>Years at a Glance</h2><p>Explore memories from previous years.</p></div>
      <button class="memories-outline-btn" type="button" data-years-more>View all years <i class="fas fa-arrow-right"></i></button>
    </div>
    <div id="archiveYears" class="memories-years"></div>
    <div id="yearArchiveContent" class="memories-grid memories-archive-grid"><div class="memories-empty">Choose a year to explore its memories.</div></div>
  </section>

  <div class="memories-duo">
    <section class="memories-section memories-mini-section" id="people">
      <div class="memories-section-head">
        <div><span class="memories-kicker"><i class="fas fa-users"></i> COMMUNITY</span><h2>Faces We Remember</h2><p>Students who appear most in memories.</p></div>
        <button class="memories-text-btn" type="button">View all <i class="fas fa-arrow-right"></i></button>
      </div>
      <div id="memoryPeople" class="memories-people-grid"><div class="memories-empty">People will appear as the archive grows.</div></div>
    </section>

    <section class="memories-section memories-mini-section" id="birthdays">
      <div class="memories-section-head">
        <div><span class="memories-kicker"><i class="fas fa-cake-candles"></i> THIS WEEK</span><h2>Upcoming Birthdays</h2><p>Students to celebrate this week.</p></div>
        <button class="memories-text-btn" type="button">View all <i class="fas fa-arrow-right"></i></button>
      </div>
      <div id="memoryBirthdays" class="memories-birthdays"><div class="memories-empty">Birthday highlights will appear when profile birthday dates are available.</div></div>
    </section>
  </div>

  <section class="memories-section memories-my" id="myMemories">
    <div class="memories-my-copy"><span class="memories-kicker"><i class="far fa-bookmark"></i> YOUR ARCHIVE</span><h2>My Memories</h2><p>Keep the moments you want to come back to. Your saved memories will live here.</p></div>
    <a class="memories-outline-btn memories-my-btn" href="../index/saved.html">Open saved memories <i class="fas fa-arrow-right"></i></a>
  </section>
</main>
`;})(typeof window!=='undefined'?window:this);
