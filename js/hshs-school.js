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
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      var s = raw || clone(defaultState);
      s.housePoints = s.housePoints || clone(defaultState.housePoints);
      s.houseMembers = Object.assign({}, defaultState.houseMembers, s.houseMembers || {});
      s.events = s.events || clone(defaultState.events);
      s.nominations = s.nominations || [];
      return s;
    } catch (e) { return clone(defaultState); }
  }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>\"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]); }); }
  function uid() { return 'nom-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function fmtDate(v) {
    var d = new Date(v + 'T12:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function currentUser() { return window.HshsStore && HshsStore.currentUser ? HshsStore.currentUser() : null; }
  function users() { return window.HshsStore && HshsStore.listUsers ? HshsStore.listUsers() : []; }
  function profileLink(id) { return 'index/profile.html?user=' + encodeURIComponent(id); }
  function schoolLink(path) { return path || '#'; }

  function schoolHubMarkup() {
    return '<section class="hshs-school-hub" id="hshsSchoolHub">' +
      '<div class="hshs-school-head"><div><span class="hshs-eyebrow">HSHS CAMPUS</span><h2><i class="fas fa-school"></i> School Hub</h2><p>What is happening around HSHS this week.</p></div><a class="hshs-school-more" href="#hshsSchoolCalendar">View calendar <i class="fas fa-arrow-right"></i></a></div>' +
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
    var events = s.events.slice().sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(0,4);
    el.innerHTML = events.map(function(e){ return '<a class="hshs-event-row" href="'+esc(schoolLink(e.link))+'"><div class="hshs-event-icon"><i class="fas '+esc(e.icon)+'"></i></div><div><strong>'+esc(e.title)+'</strong><small>'+esc(fmtDate(e.date))+' · '+esc(e.type)+'</small></div><i class="fas fa-chevron-right hshs-row-arrow"></i></a>'; }).join('');
  }
  function renderHouses(s) {
    var el = document.getElementById('hshsHouseList'); if (!el) return;
    var houses = s.housePoints.slice().sort(function(a,b){ return b.points-a.points; });
    var max = houses[0] ? houses[0].points : 1;
    el.innerHTML = houses.map(function(h,i){ var width = Math.max(8, Math.min(100, Math.round(h.points / max * 100))); return '<div class="hshs-house-row"><div class="hshs-house-rank">'+(i+1)+'</div><div class="hshs-house-main"><div><strong>'+esc(h.house)+'</strong><span>'+h.points+' pts</span></div><div class="hshs-progress"><i style="width:'+width+'%"></i></div></div></div>'; }).join('');
  }
  function rankScore(u, s) {
    var posts = window.HshsStore && HshsStore.postsByUser ? (HshsStore.postsByUser(u.id) || []) : [];
    var likes = posts.reduce(function(n,p){ return n + Number(p.likes || 0); }, 0);
    var comments = posts.reduce(function(n,p){ return n + Number(p.comments || 0); }, 0);
    var confirmed = s.nominations.filter(function(n){ return n.targetId === u.id && n.status === 'confirmed'; }).length;
    var followers = window.HshsStore && HshsStore.getState ? (HshsStore.getState().follows || []).filter(function(f){ return f.followingId === u.id; }).length : 0;
    return likes + comments * 2 + followers * 3 + confirmed * 25;
  }
  function renderRanks(s) {
    var el = document.getElementById('hshsRankList'); if (!el) return;
    var ranked = users().filter(function(u){ return u.role === 'Student' || u.role === 'Prefect'; }).map(function(u){ return {u:u, score:rankScore(u,s)}; }).sort(function(a,b){ return b.score-a.score; }).slice(0,5);
    el.innerHTML = ranked.length ? ranked.map(function(item,i){ var u=item.u, house=s.houseMembers[u.id] || ''; return '<a class="hshs-rank-row" href="'+profileLink(u.id)+'"><div class="hshs-rank-badge">'+(i+1)+'</div><div class="hshs-rank-avatar">'+esc((u.name||'?').charAt(0))+'</div><div class="hshs-rank-main"><strong>'+esc(u.name)+'</strong><small>@'+esc(u.username||'')+(house?' · '+esc(house):'')+'</small></div><div class="hshs-rank-score">'+item.score+'<small>pts</small></div></a>'; }).join('') : '<div class="hshs-empty">Ranks will appear as campus activity grows.</div>';
  }
  function renderCalendar(s) {
    var el = document.getElementById('hshsCalendarList'); if (!el) return;
    el.innerHTML = s.events.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).map(function(e){ return '<a class="hshs-calendar-row" href="'+esc(schoolLink(e.link))+'"><div class="hshs-date-chip"><b>'+new Date(e.date+'T12:00:00').getDate()+'</b><small>'+new Date(e.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'})+'</small></div><div><strong>'+esc(e.title)+'</strong><small>'+esc(e.type)+' · '+esc(fmtDate(e.date))+'</small></div><i class="fas fa-chevron-right hshs-row-arrow"></i></a>'; }).join('');
  }
  function injectHub() {
    if (document.getElementById('hshsSchoolHub')) return;
    var home = document.querySelector('.hero');
    if (!home) return;
    home.insertAdjacentHTML('afterend', schoolHubMarkup());
    var s = load(); renderWeek(s); renderHouses(s); renderRanks(s); renderCalendar(s);
  }

  function nominationModal() {
    if (document.getElementById('hshsNominationModal')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="hshs-school-modal" id="hshsNominationModal"><div class="hshs-school-backdrop"></div><div class="hshs-school-dialog"><button class="hshs-school-close" id="hshsNomClose"><i class="fas fa-times"></i></button><div id="hshsNomBody"></div></div></div>');
    document.getElementById('hshsNomClose').addEventListener('click', closeNomination);
    document.querySelector('#hshsNominationModal .hshs-school-backdrop').addEventListener('click', closeNomination);
  }
  function closeNomination(){ var m=document.getElementById('hshsNominationModal'); if(m)m.classList.remove('open'); }
  function openNomination(){
    nominationModal();
    var s=load(), me=currentUser(), body=document.getElementById('hshsNomBody');
    var people=users().filter(function(u){return !me || u.id!==me.id;});
    body.innerHTML='<div class="hshs-modal-kicker"><i class="fas fa-star"></i> SPOTLIGHT</div><h2>Nominate a student</h2><p>Recognise a school achievement, talent, leadership moment, or positive contribution.</p><form id="hshsNomForm"><label>Student<select id="hshsNomStudent">'+people.map(function(u){return '<option value="'+esc(u.id)+'">'+esc(u.name)+' · '+esc(u.classYear||'')+'</option>';}).join('')+'</select></label><label>Category<select id="hshsNomCategory"><option>Academic Excellence</option><option>Sports</option><option>Arts & Culture</option><option>Community Service</option><option>Leadership</option></select></label><label>Reason<textarea id="hshsNomReason" maxlength="280" placeholder="What did they achieve or contribute?"></textarea></label><button class="hshs-nom-submit" type="submit"><i class="fas fa-paper-plane"></i> Submit nomination</button></form><div class="hshs-nom-note"><i class="fas fa-shield-alt"></i> Nominations stay local on this device until cloud moderation is connected.</div>';
    document.getElementById('hshsNomForm').addEventListener('submit', function(e){
      e.preventDefault(); var target=document.getElementById('hshsNomStudent').value, reason=document.getElementById('hshsNomReason').value.trim(); if(!reason){alert('Add a short reason for the nomination.');return;}
      var t=window.HshsStore&&HshsStore.getUser?HshsStore.getUser(target):null; s.nominations.unshift({id:uid(),targetId:target,targetName:t?t.name:'Student',category:document.getElementById('hshsNomCategory').value,reason:reason,fromId:me?me.id:null,status:'pending',createdAt:Date.now()}); save(s); closeNomination(); renderNominationPanel(); alert('Nomination saved locally. ⭐');
    });
    document.getElementById('hshsNominationModal').classList.add('open');
  }
  function notifySpotlight(n, target) {
    if (!window.HshsStore || !HshsStore.getState) return;
    var s = HshsStore.getState();
    s.notifications = s.notifications || [];
    s.notifications.unshift({id:'n-spot-'+Date.now().toString(36), userId:n.targetId, type:'spotlight', title:'Spotlight confirmed ⭐', message:'Your Spotlight nomination was confirmed by the school team.', data:{nominationId:n.id, category:n.category}, read:false, createdAt:Date.now()});
    s.notifications = s.notifications.slice(0,80);
    try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s)); window.__hshsState=s; document.dispatchEvent(new Event('hshs:notify')); } catch(e) {}
  }
  function confirmNomination(id) {
    var s=load(), n=s.nominations.find(function(x){return x.id===id;});
    if(!n || n.status==='confirmed') return;
    n.status='confirmed'; n.confirmedAt=Date.now();
    var house=s.houseMembers[n.targetId];
    if(house){ var hp=s.housePoints.find(function(h){return h.house===house;}); if(hp) hp.points += 25; }
    save(s);
    var target=window.HshsStore&&HshsStore.getUser?HshsStore.getUser(n.targetId):null;
    notifySpotlight(n,target);
    renderNominationPanel();
    var hub=load(); renderHouses(hub); renderRanks(hub);
  }
  function renderNominationPanel(){
    var btn=document.getElementById('nomineateBtn'); if(!btn)return;
    btn.onclick=openNomination;
    var cta=btn.closest('.spotlight-cta'); if(!cta || document.getElementById('hshsNominationStatus'))return;
    var panel=document.createElement('div'); panel.id='hshsNominationStatus'; panel.className='hshs-nomination-status'; cta.appendChild(panel);
    var s=load(), me=currentUser();
    var mine=s.nominations.filter(function(n){return me&&n.fromId===me.id;});
    var pending=s.nominations.filter(function(n){return n.status==='pending';});
    var html=mine.length?'<strong>Your nominations</strong>'+mine.slice(0,3).map(function(n){return '<div><a class="hshs-nom-person" href="'+profileLink(n.targetId)+'"><span>'+esc(n.targetName)+'</span></a><small>'+esc(n.category)+' · '+esc(n.status)+'</small></div>';}).join(''):'';
    if(me&&me.role==='Prefect'&&pending.length){ html+='<strong>Prefect review · '+pending.length+' pending</strong>'+pending.slice(0,4).map(function(n){return '<div class="hshs-review-row"><a class="hshs-nom-person" href="'+profileLink(n.targetId)+'"><span>'+esc(n.targetName)+'</span><small>'+esc(n.category)+'</small></a><button data-confirm-nom="'+esc(n.id)+'">Confirm +25 house pts</button></div>';}).join(''); }
    panel.innerHTML=html;
    panel.querySelectorAll('[data-confirm-nom]').forEach(function(b){b.onclick=function(){confirmNomination(b.dataset.confirmNom);};});
  }

  function init(){
    if (!window.HshsStore) { setTimeout(init,120); return; }
    injectHub();
    renderNominationPanel();
    window.HshsSchool = { getState: load, nominate: openNomination, refresh: function(){var s=load();renderWeek(s);renderHouses(s);renderRanks(s);renderCalendar(s);renderNominationPanel();} };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();