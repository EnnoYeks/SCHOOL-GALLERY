(function () {
  if (window.HshsSchool) return;

  var KEY = 'hshsSchoolFeatures_v1';
  var HOUSES = ['House A', 'House B', 'House C', 'House D'];
  var defaultState = {
    housePoints: [
      { house: 'House A', points: 420 },
      { house: 'House B', points: 385 },
      { house: 'House C', points: 360 },
      { house: 'House D', points: 330 }
    ],
    houseMembers: {
      'u-demo': 'House A',
      'u-prefect': 'House B',
      'u-maya': 'House C',
      'u-brian': 'House D'
    },
    events: [
      { date: '2026-09-04', title: 'Friday Assembly', type: 'Assembly', icon: 'fa-bullhorn', link: 'index/contact.html' },
      { date: '2026-09-05', title: 'Inter-house Training', type: 'Sports', icon: 'fa-running', link: 'index/videos.html' },
      { date: '2026-09-08', title: 'STEM Club Meetup', type: 'STEM', icon: 'fa-flask', link: 'index/gallery.html' },
      { date: '2026-09-10', title: 'Class Photo Day', type: 'Campus', icon: 'fa-camera', link: 'index/photos.html' }
    ],
    nominations: []
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function readKey() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      return raw || null;
    } catch (e) { return null; }
  }
  function load() {
    try {
      var raw = readKey();
      var s = raw || clone(defaultState);
      s.housePoints = s.housePoints || clone(defaultState.housePoints);
      s.houseMembers = Object.assign({}, defaultState.houseMembers, s.houseMembers || {});
      s.events = s.events || clone(defaultState.events);
      s.nominations = s.nominations || [];
      return s;
    } catch (e) { return clone(defaultState); }
  }
  function save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
    return s;
  }

  // central escape for user-provided values
  function esc(v) { return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'); }
  function uid() { return 'nom-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function fmtDate(v) { try { var d = new Date(v + 'T12:00:00'); return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return esc(v); } }
  function currentUser() { try { return window.HshsStore && HshsStore.currentUser ? HshsStore.currentUser() : null; } catch (e) { return null; } }
  function users() { try { return window.HshsStore && HshsStore.listUsers ? HshsStore.listUsers() : []; } catch (e) { return []; } }
  function profileLink(id) { return 'index/profile.html?user=' + encodeURIComponent(id); }
  function schoolLink(path) { return path || '#'; }

  function schoolHubMarkup() {
    return '<section class="hshs-school-hub" id="hshsSchoolHub">' +
      '<div class="hshs-school-head"><div><span class="hshs-eyebrow">HSHS CAMPUS</span><h2><i class="fas fa-school"></i> School Hub</h2><p>What is happening around HSHS this week.</p></div><a class="hshs-btn ghost" id="nomineateBtn">Nominate</a></div>' +
      '<div class="hshs-school-grid">' +
        '<article class="hshs-school-card hshs-week-card"><div class="hshs-card-title"><i class="fas fa-bolt"></i><span>This Week at HSHS</span></div><div id="hshsWeekList"></div></article>' +
        '<article class="hshs-school-card hshs-house-card"><div class="hshs-card-title"><i class="fas fa-trophy"></i><span>House Points</span></div><div id="hshsHouseList"></div></article>' +
      '</div>' +
      '<article class="hshs-school-card hshs-ranks-card"><div class="hshs-card-title"><i class="fas fa-ranking-star"></i><span>HSHS Ranks</span><small>campus activity</small></div><div id="hshsRankList"></div></article>' +
      '<article class="hshs-school-card hshs-calendar-card" id="hshsSchoolCalendar"><div class="hshs-card-title"><i class="far fa-calendar-alt"></i><span>School Calendar</span></div><div id="hshsCalendarList"></div></article>' +
    '</section>';
  }

  function renderWeek(s) {
    var el = document.getElementById('hshsWeekList'); if (!el) return;
    var events = (s.events || []).slice().sort(function(a,b){ return String(a.date).localeCompare(b.date); }).slice(0,4);
    el.innerHTML = events.map(function(e){
      return '<a class="hshs-event-row" href="'+esc(schoolLink(e.link))+'"><div class="hshs-event-icon"><i class="fas '+esc(e.icon)+'"></i></div><div><strong>'+esc(e.title)+'</strong><small>'+esc(e.type)+' · '+esc(fmtDate(e.date))+'</small></div></a>';
    }).join('');
  }
  function renderHouses(s) {
    var el = document.getElementById('hshsHouseList'); if (!el) return;
    var houses = (s.housePoints || []).slice().sort(function(a,b){ return b.points-a.points; });
    var max = houses[0] ? houses[0].points : 1;
    el.innerHTML = houses.map(function(h,i){ var width = Math.max(8, Math.min(100, Math.round((h.points || 0) / max * 100))); return '<div class="hshs-house-row"><div class="hshs-house-rank">'+(i+1)+'</div><div class="hshs-house-name">'+esc(h.house)+'</div><div class="hshs-house-bar"><div style="width:'+width+'%"></div></div><div class="hshs-house-points">'+esc(String(h.points))+'</div></div>'; }).join('');
  }
  function rankScore(u, s) {
    try {
      var posts = (window.HshsStore && HshsStore.postsByUser) ? (HshsStore.postsByUser(u.id) || []) : [];
      var likes = posts.reduce(function(n,p){ return n + Number(p.likes || 0); }, 0);
      var comments = posts.reduce(function(n,p){ return n + Number(p.comments || 0); }, 0);
      var confirmed = (s.nominations || []).filter(function(nom){ return nom.targetId === u.id && nom.status === 'confirmed'; }).length;
      var followers = 0;
      try { followers = window.HshsStore && HshsStore.getState ? (HshsStore.getState().follows || []).filter(function(f){ return f.followingId === u.id; }).length : 0; } catch (e) { followers = 0; }
      return likes + comments * 2 + followers * 3 + confirmed * 25;
    } catch (e) { return 0; }
  }
  function renderRanks(s) {
    var el = document.getElementById('hshsRankList'); if (!el) return;
    try {
      var ranked = users().filter(function(u){ return (u.role === 'Student' || u.role === 'Prefect'); }).map(function(u){ return {u:u, score:rankScore(u,s)}; }).sort(function(a,b){ return b.score-a.score; });
      el.innerHTML = ranked.length ? ranked.map(function(item,i){ var u=item.u, house=s.houseMembers && s.houseMembers[u.id] || ''; return '<a class="hshs-rank-row" href="'+profileLink(u.id)+'"><div class="hshs-rank-pos">'+(i+1)+'</div><div class="hshs-rank-av">'+(u.avatar?'<img src="'+esc(u.avatar)+'" alt="">':esc((u.name||'').slice(0,1)))+'</div><div class="hshs-rank-meta"><strong>'+esc(u.name)+'</strong><small>'+esc(house)+'</small></div><div class="hshs-rank-score">'+esc(String(item.score))+'</div></a>'; }).join('') : '<p class="hshs-profile-empty">No activity yet.</p>';
    } catch (e) { el.innerHTML = '<p class="hshs-profile-empty">No activity yet.</p>'; }
  }
  function renderCalendar(s) {
    var el = document.getElementById('hshsCalendarList'); if (!el) return;
    el.innerHTML = (s.events || []).slice().sort(function(a,b){return String(a.date).localeCompare(b.date);}).map(function(e){ return '<a class="hshs-calendar-row" href="'+esc(schoolLink(e.link))+'"><div class="hshs-calendar-date">'+esc(fmtDate(e.date))+'</div><div><strong>'+esc(e.title)+'</strong><small>'+esc(e.type)+'</small></div></a>'; }).join('');
  }
  function injectHub() {
    if (document.getElementById('hshsSchoolHub')) return;
    var home = document.querySelector('.hero');
    if (!home) return;
    try { home.insertAdjacentHTML('afterend', schoolHubMarkup()); } catch (e) { return; }
    var s = load(); renderWeek(s); renderHouses(s); renderRanks(s); renderCalendar(s);
  }

  function nominationModal() {
    if (document.getElementById('hshsNominationModal')) return;
    var html = '<div class="hshs-school-modal" id="hshsNominationModal">' +
      '<div class="hshs-school-backdrop"></div>' +
      '<div class="hshs-school-dialog">' +
      '<button class="hshs-school-close" id="hshsNomClose">×</button>' +
      '<div class="hshs-school-body" id="hshsNomBody"></div>' +
      '<form id="hshsNomForm" class="hshs-nom-form" style="display:none">' +
      '<label>Select student<select id="hshsNomStudent"></select></label>' +
      '<label>Reason<textarea id="hshsNomReason" rows="3" required></textarea></label>' +
      '<button type="submit" class="hshs-btn">Nominate</button>' +
      '</form></div></div>';
    try { document.body.insertAdjacentHTML('beforeend', html); } catch (e) { return; }
    var close = document.getElementById('hshsNomClose'); if (close) close.addEventListener('click', closeNomination);
    var backdrop = document.querySelector('#hshsNominationModal .hshs-school-backdrop'); if (backdrop) backdrop.addEventListener('click', closeNomination);
  }
  function closeNomination(){ var m=document.getElementById('hshsNominationModal'); if(m)m.classList.remove('open'); }
  function openNomination(){
    nominationModal();
    var s = load(), me = currentUser(), body = document.getElementById('hshsNomBody');
    var select = document.getElementById('hshsNomStudent');
    if (!body) return;
    // build modal content
    body.innerHTML = '<div class="hshs-modal-kicker"><i class="fas fa-star"></i> SPOTLIGHT</div><h2>Nominate a student</h2><p>Recognise a school achievement, talent, leadership moment, or positive contribution.</p>';
    // populate student select
    if (select) {
      select.innerHTML = '';
      var ppl = users().filter(function(u){ return !me || u.id !== me.id; });
      ppl.forEach(function(u){ var opt = document.createElement('option'); opt.value = u.id; opt.textContent = u.name || u.username || u.id; select.appendChild(opt); });
      document.getElementById('hshsNomForm').style.display = 'block';
    }
    var form = document.getElementById('hshsNomForm');
    if (form) form.addEventListener('submit', function(e){
      e.preventDefault();
      var target = (document.getElementById('hshsNomStudent') && document.getElementById('hshsNomStudent').value) || null;
      var reason = (document.getElementById('hshsNomReason') && document.getElementById('hshsNomReason').value || '').trim();
      if (!reason) { alert('Add a short reason for the nomination'); return; }
      var t = (window.HshsStore && HshsStore.getUser) ? HshsStore.getUser(target) : null;
      s.nominations = s.nominations || [];
      s.nominations.unshift({ id: uid(), fromId: me && me.id || 'guest', targetId: target, targetName: t && t.name || 'Student', reason: reason, status: 'pending', createdAt: Date.now() });
      save(s);
      document.getElementById('hshsNominationModal').classList.add('open');
      renderNominationPanel();
    });
  }
  function notifySpotlight(n, target) {
    try {
      var state = null;
      if (window.HshsStore && HshsStore.getState) {
        try { state = HshsStore.getState(); } catch (e) { state = null; }
      }
      if (!state && window.HshsStoreBridge && typeof window.HshsStoreBridge.read === 'function') {
        try { state = window.HshsStoreBridge.read(); } catch (e) { state = state || {}; }
      }
      state = state || {};
      state.notifications = state.notifications || [];
      state.notifications.unshift({ id: 'n-spot-' + Date.now().toString(36), userId: n.targetId, type: 'spotlight', title: 'Spotlight confirmed ⭐', message: 'Your Spotlight nomination was confirmed by the school', createdAt: Date.now(), read: false });
      state.notifications = state.notifications.slice(0,80);
      // persist through bridge if available
      if (window.HshsStoreBridge && typeof window.HshsStoreBridge.write === 'function') {
        try { window.HshsStoreBridge.write(state); } catch (e) { try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(state)); } catch (er) {} }
      } else {
        try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(state)); } catch (e) {}
      }
      try { window.__hshsState = state; document.dispatchEvent(new Event('hshs:notify')); } catch (e) {}
    } catch (e) { /* ignore notify errors */ }
  }
  function confirmNomination(id) {
    try {
      var s = load(), n = (s.nominations || []).find(function(x){return x.id===id;});
      if (!n || n.status === 'confirmed') return;
      n.status = 'confirmed'; n.confirmedAt = Date.now();
      var house = s.houseMembers && s.houseMembers[n.targetId];
      if (house) { var hp = (s.housePoints || []).find(function(h){ return h.house === house; }); if (hp) hp.points = (hp.points || 0) + 25; }
      save(s);
      var target = (window.HshsStore && HshsStore.getUser) ? HshsStore.getUser(n.targetId) : null;
      notifySpotlight(n, target);
      renderNominationPanel();
      var hub = load(); renderHouses(hub); renderRanks(hub);
    } catch (e) { /* ignore confirmation errors */ }
  }
  function renderNominationPanel(){
    try {
      var btn = document.getElementById('nomineateBtn'); if(!btn) return; btn.onclick = openNomination;
      var cta = btn.closest && btn.closest('.spotlight-cta'); if(!cta) return;
      if (document.getElementById('hshsNominationStatus')) return;
      var panel = document.createElement('div'); panel.id = 'hshsNominationStatus'; panel.className = 'hshs-nomination-status'; cta.appendChild(panel);
      var s = load(), me = currentUser();
      var mine = (s.nominations || []).filter(function(n){ return me && n.fromId === me.id; });
      var pending = (s.nominations || []).filter(function(n){ return n.status === 'pending'; });
      var html = '';
      if (mine.length) {
        html += '<strong>Your nominations</strong>' + mine.slice(0,3).map(function(n){ return '<div><a class="hshs-nom-person" href="'+profileLink(n.targetId)+'"><span>'+esc(n.targetName)+'</span></a> <small>'+esc(n.status)+'</small></div>'; }).join('');
      }
      if (me && me.role === 'Prefect' && pending.length) {
        html += '<strong>Prefect review · '+esc(String(pending.length))+' pending</strong>' + pending.slice(0,4).map(function(n){ return '<div class="hshs-review-row"><a class="hshs-nom-person" href="'+profileLink(n.targetId)+'">'+esc(n.targetName)+'</a> <button data-confirm-nom="'+esc(n.id)+'" class="hshs-btn">Confirm</button></div>'; }).join('');
      }
      panel.innerHTML = html || '<p class="hshs-profile-empty">No nominations yet.</p>';
      panel.querySelectorAll('[data-confirm-nom]').forEach(function(b){ b.onclick = function(){ confirmNomination(b.getAttribute('data-confirm-nom')); }; });
    } catch (e) { /* ignore */ }
  }

  function init(){
    if (!window.HshsStore) { setTimeout(init,120); return; }
    injectHub();
    renderNominationPanel();
    window.HshsSchool = { getState: load, nominate: openNomination, refresh: function(){var s=load();renderWeek(s);renderHouses(s);renderRanks(s);renderCalendar(s);renderNominationPanel();} };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
