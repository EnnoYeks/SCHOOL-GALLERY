(function () {
  if (window.HshsSchool) return;

  var KEY = 'hshsSchoolFeatures_v1';
  var CLASSES = ['S1','S2','S3','S4','S5','S6'];
  var defaultState = {
    housePoints: [
      { house: 'House A', points: 420 },
      { house: 'House B', points: 385 },
      { house: 'House C', points: 360 },
      { house: 'House D', points: 330 }
    ],
    events: [
      { date: '2026-09-04', title: 'Friday Assembly', type: 'Assembly', icon: 'fa-bullhorn' },
      { date: '2026-09-05', title: 'Inter-house Training', type: 'Sports', icon: 'fa-running' },
      { date: '2026-09-08', title: 'STEM Club Meetup', type: 'STEM', icon: 'fa-flask' },
      { date: '2026-09-10', title: 'Class Photo Day', type: 'Campus', icon: 'fa-camera' }
    ],
    nominations: []
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      return raw || clone(defaultState);
    } catch (e) { return clone(defaultState); }
  }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>\"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]); }); }
  function uid() { return 'nom-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function fmtDate(v) {
    var d = new Date(v + 'T12:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function usersFor(klass) {
    if (!window.HshsStore) return [];
    return HshsStore.usersByClass(klass) || [];
  }
  function currentUser() { return window.HshsStore && HshsStore.currentUser ? HshsStore.currentUser() : null; }

  function schoolHubMarkup() {
    return '<section class="hshs-school-hub" id="hshsSchoolHub">' +
      '<div class="hshs-school-head"><div><span class="hshs-eyebrow">HSHS CAMPUS</span><h2><i class="fas fa-school"></i> School Hub</h2><p>What is happening around HSHS this week.</p></div><a class="hshs-school-more" href="#hshsSchoolCalendar">View calendar <i class="fas fa-arrow-right"></i></a></div>' +
      '<div class="hshs-school-grid">' +
        '<article class="hshs-school-card hshs-week-card"><div class="hshs-card-title"><i class="fas fa-bolt"></i><span>This Week at HSHS</span></div><div id="hshsWeekList"></div></article>' +
        '<article class="hshs-school-card hshs-house-card"><div class="hshs-card-title"><i class="fas fa-trophy"></i><span>House Points</span></div><div id="hshsHouseList"></div></article>' +
      '</div>' +
      '<article class="hshs-school-card hshs-directory-card"><div class="hshs-card-title"><i class="fas fa-users"></i><span>Class Directory</span></div><div class="hshs-class-tabs" id="hshsClassTabs"></div><div id="hshsClassList" class="hshs-class-list"></div></article>' +
      '<article class="hshs-school-card hshs-calendar-card" id="hshsSchoolCalendar"><div class="hshs-card-title"><i class="far fa-calendar-alt"></i><span>School Calendar</span></div><div id="hshsCalendarList"></div></article>' +
    '</section>';
  }

  function renderWeek(s) {
    var el = document.getElementById('hshsWeekList'); if (!el) return;
    var events = s.events.slice().sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(0,4);
    el.innerHTML = events.map(function(e){ return '<div class="hshs-event-row"><div class="hshs-event-icon"><i class="fas '+esc(e.icon)+'"></i></div><div><strong>'+esc(e.title)+'</strong><small>'+esc(fmtDate(e.date))+' · '+esc(e.type)+'</small></div></div>'; }).join('');
  }
  function renderHouses(s) {
    var el = document.getElementById('hshsHouseList'); if (!el) return;
    var houses = s.housePoints.slice().sort(function(a,b){ return b.points-a.points; });
    el.innerHTML = houses.map(function(h,i){ var width = Math.max(8, Math.min(100, Math.round(h.points / houses[0].points * 100))); return '<div class="hshs-house-row"><div class="hshs-house-rank">'+(i+1)+'</div><div class="hshs-house-main"><div><strong>'+esc(h.house)+'</strong><span>'+h.points+' pts</span></div><div class="hshs-progress"><i style="width:'+width+'%"></i></div></div></div>'; }).join('');
  }
  function renderClasses(selected) {
    var tabs = document.getElementById('hshsClassTabs'); var list = document.getElementById('hshsClassList'); if (!tabs || !list) return;
    selected = selected || 'S1';
    tabs.innerHTML = CLASSES.map(function(k){ return '<button class="hshs-class-tab '+(k===selected?'active':'')+'" data-class="'+k+'">'+k+'</button>'; }).join('');
    tabs.querySelectorAll('button').forEach(function(btn){ btn.addEventListener('click', function(){ renderClasses(btn.dataset.class); }); });
    var users = usersFor(selected);
    list.innerHTML = users.length ? users.map(function(u){ return '<button class="hshs-student-row" data-user="'+esc(u.id)+'"><span class="hshs-avatar">'+esc((u.name||'?').charAt(0))+'</span><span><strong>'+esc(u.name)+'</strong><small>@'+esc(u.username||'')+' · '+esc(u.role||'Student')+'</small></span><i class="fas fa-chevron-right"></i></button>'; }).join('') : '<div class="hshs-empty">No '+selected+' directory profiles yet.</div>';
    list.querySelectorAll('[data-user]').forEach(function(btn){ btn.addEventListener('click', function(){ if (window.HshsSocial && HshsSocial.openProfile) HshsSocial.openProfile(btn.dataset.user); else location.href = 'index/profile.html?user=' + encodeURIComponent(btn.dataset.user); }); });
  }
  function renderCalendar(s) {
    var el = document.getElementById('hshsCalendarList'); if (!el) return;
    el.innerHTML = s.events.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).map(function(e){ return '<div class="hshs-calendar-row"><div class="hshs-date-chip"><b>'+new Date(e.date+'T12:00:00').getDate()+'</b><small>'+new Date(e.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'})+'</small></div><div><strong>'+esc(e.title)+'</strong><small>'+esc(e.type)+' · '+esc(fmtDate(e.date))+'</small></div></div>'; }).join('');
  }
  function injectHub() {
    if (document.getElementById('hshsSchoolHub')) return;
    var home = document.querySelector('.hero');
    if (!home) return;
    home.insertAdjacentHTML('afterend', schoolHubMarkup());
    var s = load(); renderWeek(s); renderHouses(s); renderClasses('S1'); renderCalendar(s);
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
    var people=window.HshsStore ? HshsStore.listUsers().filter(function(u){return !me || u.id!==me.id;}) : [];
    body.innerHTML='<div class="hshs-modal-kicker"><i class="fas fa-star"></i> SPOTLIGHT</div><h2>Nominate a student</h2><p>Recognise a school achievement, talent, leadership moment, or positive contribution.</p><form id="hshsNomForm"><label>Student<select id="hshsNomStudent">'+people.map(function(u){return '<option value="'+esc(u.id)+'">'+esc(u.name)+' · '+esc(u.classYear||'')+'</option>';}).join('')+'</select></label><label>Category<select id="hshsNomCategory"><option>Academic Excellence</option><option>Sports</option><option>Arts & Culture</option><option>Community Service</option><option>Leadership</option></select></label><label>Reason<textarea id="hshsNomReason" maxlength="280" placeholder="What did they achieve or contribute?"></textarea></label><button class="hshs-nom-submit" type="submit"><i class="fas fa-paper-plane"></i> Submit nomination</button></form><div class="hshs-nom-note"><i class="fas fa-shield-alt"></i> Nominations stay local on this device until cloud moderation is connected.</div>';
    document.getElementById('hshsNomForm').addEventListener('submit', function(e){
      e.preventDefault(); var target=document.getElementById('hshsNomStudent').value, reason=document.getElementById('hshsNomReason').value.trim(); if(!reason){alert('Add a short reason for the nomination.');return;}
      var t=window.HshsStore&&HshsStore.getUser?HshsStore.getUser(target):null; s.nominations.unshift({id:uid(),targetId:target,targetName:t?t.name:'Student',category:document.getElementById('hshsNomCategory').value,reason:reason,fromId:me?me.id:null,status:'pending',createdAt:Date.now()}); save(s); closeNomination(); renderNominationPanel(); alert('Nomination saved locally. ⭐');
    });
    document.getElementById('hshsNominationModal').classList.add('open');
  }
  function renderNominationPanel(){
    var btn=document.getElementById('nomineateBtn'); if(!btn)return;
    btn.onclick=openNomination;
    var cta=btn.closest('.spotlight-cta'); if(!cta || document.getElementById('hshsNominationStatus'))return;
    var panel=document.createElement('div'); panel.id='hshsNominationStatus'; panel.className='hshs-nomination-status'; cta.appendChild(panel);
    var s=load(), me=currentUser();
    var mine=s.nominations.filter(function(n){return me&&n.fromId===me.id;});
    var pending=s.nominations.filter(function(n){return n.status==='pending';});
    var html=mine.length?'<strong>Your nominations</strong>'+mine.slice(0,3).map(function(n){return '<div><span>'+esc(n.targetName)+'</span><small>'+esc(n.category)+' · '+esc(n.status)+'</small></div>';}).join(''):'';
    if(me&&me.role==='Prefect'&&pending.length){ html+='<strong>Prefect review · '+pending.length+' pending</strong>'+pending.slice(0,4).map(function(n){return '<div class="hshs-review-row"><span>'+esc(n.targetName)+'<small>'+esc(n.category)+'</small></span><button data-confirm-nom="'+esc(n.id)+'">Confirm</button></div>';}).join(''); }
    panel.innerHTML=html;
    panel.querySelectorAll('[data-confirm-nom]').forEach(function(b){b.onclick=function(){var id=b.dataset.confirmNom,s2=load(),n=s2.nominations.find(function(x){return x.id===id;});if(n){n.status='confirmed';save(s2);renderNominationPanel();}};});
  }

  function init(){
    if (!window.HshsStore) { setTimeout(init,120); return; }
    injectHub();
    renderNominationPanel();
    window.HshsSchool = { getState: load, nominate: openNomination };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();