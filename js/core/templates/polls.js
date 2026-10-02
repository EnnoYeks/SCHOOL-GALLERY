(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates['polls']=`
<main class="hshs-polls-page">
  <section class="polls-hero">
    <div class="polls-hero-glow"></div>
    <div class="polls-hero-content">
      <span class="polls-eyebrow"><i class="fas fa-chart-simple"></i> HSHS WORLD · COMMUNITY VOICE</span>
      <h1>What does <span>HSHS</span> think?</h1>
      <p>Vote on school life, events, houses, activities and the little things that make HSHS yours.</p>
      <div class="polls-hero-stats">
        <span><i class="fas fa-bolt"></i> Live community polls</span>
        <span><i class="fas fa-users"></i> Your voice counts</span>
      </div>
    </div>
    <div class="polls-hero-orb orb-one"></div><div class="polls-hero-orb orb-two"></div>
  </section>

  <nav class="polls-tabs" aria-label="Poll sections">
    <a class="is-active" href="#active"><i class="fas fa-fire"></i><span>Live now</span></a>
    <a href="#results"><i class="fas fa-chart-pie"></i><span>Results</span></a>
    <a href="#closed"><i class="fas fa-clock-rotate-left"></i><span>Past polls</span></a>
  </nav>

  <section class="polls-content" id="active">
    <div class="polls-heading">
      <div><span class="polls-kicker">YOUR SCHOOL. YOUR VOICE.</span><h2>Live right now</h2><p>Pick an option and see how the HSHS community is voting.</p></div>
      <button type="button" class="poll-create" id="createPollBtn"><i class="fas fa-plus"></i><span>Start a poll</span></button>
    </div>
    <div id="activePollsList" class="poll-grid" aria-live="polite"><div class="poll-loading">Loading live polls…</div></div>
  </section>

  <section class="polls-content polls-results-strip" id="results">
    <div class="polls-heading">
      <div><span class="polls-kicker">THE NUMBERS</span><h2>Poll snapshot</h2><p>A quick look at participation across the live polls.</p></div>
      <span class="poll-stat-pill" id="pollCount">0 live polls</span>
    </div>
    <div id="pollSnapshot" class="poll-snapshot"><div class="poll-empty">Vote data will appear here when polls are available.</div></div>
  </section>

  <section class="polls-content" id="closed">
    <div class="polls-heading">
      <div><span class="polls-kicker">THE ARCHIVE</span><h2>Past polls</h2><p>See what HSHS has asked and answered before.</p></div>
    </div>
    <div id="closedPollsList" class="poll-grid" aria-live="polite"><div class="poll-loading">Loading poll history…</div></div>
  </section>

  <section class="polls-cta">
    <div><span><i class="fas fa-comments"></i> COMMUNITY VOICE</span><h2>Got a question the school should answer?</h2><p>Turn a conversation into a poll and let HSHS have its say.</p></div>
    <button type="button" id="pollCtaButton">Suggest a poll <i class="fas fa-arrow-right"></i></button>
  </section>
</main>`;})(typeof window!=='undefined'?window:this);