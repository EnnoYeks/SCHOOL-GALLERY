(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates.memories=`
<main class="hshs-memories-page">
  <section class="memories-hero">
    <div class="memories-hero-media" aria-hidden="true"></div>
    <div class="memories-hero-glow" aria-hidden="true"></div>
    <div class="memories-hero-content">
      <span class="memories-eyebrow"><i class="fas fa-book-open"></i> HSHS WORLD · MEMORIES</span>
      <h1>Our <span>HSHS</span> Story</h1>
      <p>Moments. People. Events. A school you’ll always remember.</p>
      <div class="memories-hero-actions">
        <a class="memories-hero-btn" href="#onThisDay"><i class="fas fa-sparkles"></i> View highlights</a>
        <a class="memories-hero-btn memories-hero-btn-ghost" href="../index/upload.html"><i class="fas fa-plus"></i> Share a memory</a>
      </div>
    </div>
    <div class="memories-hero-note">Same halls. Different years.<br><strong>Forever HSHS.</strong> <span>♥</span></div>
  </section>

  <nav class="memories-tabs" aria-label="Memories sections">
    <a class="is-active" href="#overview"><i class="fas fa-grid-2"></i><span>Overview</span></a>
    <a href="#onThisDay"><i class="far fa-calendar"></i><span>On This Day</span></a>
    <a href="#timeline"><i class="far fa-clock"></i><span>Timeline</span></a>
    <a href="#years"><i class="fas fa-chart-column"></i><span>By Year</span></a>
    <a href="#people"><i class="fas fa-users"></i><span>People</span></a>
  </nav>

  <div id="overview"></div>

  <section class="memories-section memories-on-day" id="onThisDay">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-calendar-day"></i> TODAY IN HSHS HISTORY</span><h2>On This Day</h2><p>Look back at what happened on this date in earlier school years.</p></div>
      <div class="memories-date-pill"><i class="far fa-calendar"></i><span id="memoryToday">Today</span></div>
    </div>
    <div id="onThisDayGrid" class="memories-feature-grid"><div class="memories-loading">Loading memories…</div></div>
  </section>

  <section class="memories-section" id="reel">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-play-circle"></i> MOMENTS FROM AROUND SCHOOL</span><h2>Memory Reel</h2><p>A quick look at recent moments from the HSHS archive.</p></div>
      <div class="memories-filter" role="group" aria-label="Memory reel filters"><button class="is-active" type="button" data-memory-filter="all">All</button><button type="button" data-memory-filter="photo">Photos</button><button type="button" data-memory-filter="event">Events</button></div>
    </div>
    <div id="memoryReel" class="memories-reel"><div class="memories-loading">Loading the reel…</div></div>
  </section>

  <section class="memories-section" id="timeline">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-route"></i> THE STORY OF HSHS</span><h2>HSHS Timeline</h2><p>The biggest moments represented in the current school archive.</p></div>
      <span class="memories-count-pill" id="timelineCount">0 moments</span>
    </div>
    <div id="schoolTimeline" class="memories-timeline"><div class="memories-loading">Loading timeline…</div></div>
  </section>

  <section class="memories-section" id="years">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-chart-column"></i> THE ARCHIVE</span><h2>Years at a Glance</h2><p>Explore memories from the years represented in HSHS World.</p></div>
      <span class="memories-count-pill" id="yearCount">0 years</span>
    </div>
    <div id="archiveYears" class="memories-years"></div>
    <div id="yearArchiveContent" class="memories-grid memories-archive-grid"><div class="memories-empty">Choose a year to explore its memories.</div></div>
  </section>

  <section class="memories-section memories-people" id="people">
    <div class="memories-section-head">
      <div><span class="memories-kicker"><i class="fas fa-users"></i> COMMUNITY</span><h2>People We Remember</h2><p>Students and school accounts appearing across the archive.</p></div>
      <span class="memories-count-pill" id="peopleCount">0 people</span>
    </div>
    <div id="memoryPeople" class="memories-people-grid"><div class="memories-empty">People will appear as the archive grows.</div></div>
  </section>

  <section class="memories-closing">
    <span><i class="fas fa-heart"></i> HSHS WORLD</span>
    <h2>Same halls. Different years. Forever HSHS.</h2>
    <p>Every photo, post and event adds another page to the story.</p>
    <a href="../index/upload.html">Add a memory <i class="fas fa-arrow-right"></i></a>
  </section>
</main>`;})(typeof window!=='undefined'?window:this);