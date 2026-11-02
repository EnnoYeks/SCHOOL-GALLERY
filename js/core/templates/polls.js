(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates['polls']=`
<main class="hshs-polls-page">
  <section class="polls-hero">
    <div class="polls-hero-glow"></div>
    <div class="polls-hero-content">
      <span class="polls-eyebrow"><i class="fas fa-chart-simple"></i> HSHS WORLD · COMMUNITY VOICE</span>
      <h1>What does <span>HSHS</span> think?</h1>
      <p>Polls appear here only when they are stored in the school database. Voting is not available yet.</p>
      <div class="polls-hero-stats">
        <span><i class="fas fa-bolt"></i> Database records</span>
        <span><i class="fas fa-users"></i> Voting unavailable</span>
      </div>
    </div>
    <div class="polls-hero-orb orb-one"></div><div class="polls-hero-orb orb-two"></div>
  </section>

  <nav class="polls-tabs" aria-label="Poll sections">
    <a class="is-active" href="#active"><i class="fas fa-fire"></i><span>Open</span></a>
    <a href="#results"><i class="fas fa-chart-pie"></i><span>Results</span></a>
    <a href="#closed"><i class="fas fa-clock-rotate-left"></i><span>Past polls</span></a>
  </nav>

  <section class="polls-content" id="active">
    <div class="polls-heading">
      <div><span class="polls-kicker">DATABASE RECORDS</span><h2>Open polls</h2><p>These are polls stored in the school database. Voting is not available yet.</p></div>
      <button type="button" class="poll-create" id="createPollBtn" aria-disabled="true"><i class="fas fa-plus"></i><span>Create unavailable</span></button>
    </div>
    <div id="activePollsList" class="poll-grid" aria-live="polite"><article class="hshs-sk-poll" aria-hidden="true"><span class="hshs-sk-line sm"></span><span class="hshs-sk-line"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar short"></span></article></div>
  </section>

  <section class="polls-content polls-results-strip" id="results">
    <div class="polls-heading">
      <div><span class="polls-kicker">THE NUMBERS</span><h2>Poll snapshot</h2><p>Recorded counts only. These are not live community results.</p></div>
      <span class="poll-stat-pill" id="pollCount">0 polls</span>
    </div>
    <div id="pollSnapshot" class="poll-snapshot"><div class="poll-empty">Loading real poll data…</div></div>
  </section>

  <section class="polls-content" id="closed">
    <div class="polls-heading">
      <div><span class="polls-kicker">THE ARCHIVE</span><h2>Past polls</h2><p>See what HSHS has asked and answered before.</p></div>
    </div>
    <div id="closedPollsList" class="poll-grid" aria-live="polite"><article class="hshs-sk-poll" aria-hidden="true"><span class="hshs-sk-line sm"></span><span class="hshs-sk-line"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar short"></span></article></div>
  </section>

  <section class="polls-cta">
    <div><span><i class="fas fa-comments"></i> NOT AVAILABLE</span><h2>Poll creation is unavailable</h2><p>Suggesting a poll needs an approved database schema. Nothing is saved or shared yet.</p></div>
    <button type="button" id="pollCtaButton">Unavailable <i class="fas fa-arrow-right"></i></button>
  </section>
</main>`;})(typeof window!=='undefined'?window:this);