(function () {
  if (window.HshsSchool) return;

  var KEY = 'hshsSchoolFeatures_v1';
  var HOUSES = ['House A', 'House B', 'House C', 'House D'];
  var defaultState = {
    housePoints: [
      { house: 'House A', points: 120 },
      { house: 'House B', points: 98 },
      { house: 'House C', points: 110 },
      { house: 'House D', points: 86 }
    ],
    week: {
      title: 'Spirit Week',
      note: 'Wear house colors on Friday',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    ranks: [
      { name: 'Amina K.', role: 'Top Contributor', score: 42 },
      { name: 'Joseph M.', role: 'Sports Lead', score: 38 },
      { name: 'Grace N.', role: 'Arts Lead', score: 35 }
    ],
    calendar: [
      { day: 'Mon', event: 'Assembly' },
      { day: 'Wed', event: 'Club fair' },
      { day: 'Fri', event: 'House games' }
    ],
    nominations: []
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultState));
      var parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function schoolHubMarkup() {
    return '<section class="hshs-school-hub" id="hshsSchoolHub">' +
      '<div class="hshs-school-head"><h2>School Hub</h2><p>Houses, week highlights and student ranks</p></div>' +
      '<div class="hshs-school-grid">' +
      '<article class="hshs-school-card" id="hshsSchoolWeek"></article>' +
      '<article class="hshs-school-card" id="hshsSchoolHouses"></article>' +
      '<article class="hshs-school-card" id="hshsSchoolRanks"></article>' +
      '<article class="hshs-school-card" id="hshsSchoolCalendar"></article>' +
      '</div>' +
      '<div class="hshs-school-actions"><button type="button" id="hshsNominateBtn" class="hshs-school-btn">Nominate a student</button></div>' +
      '</section>';
  }

  function injectHub() {
    if (document.getElementById('hshsSchoolHub')) return;
    var home = document.querySelector('.hero');
    if (!home) return;
    try { home.insertAdjacentHTML('afterend', schoolHubMarkup()); } catch (e) { return; }
    var s = load(); renderWeek(s); renderHouses(s); renderRanks(s); renderCalendar(s);
  }

  function renderWeek(s) {
    var el = document.getElementById('hshsSchoolWeek');
    if (!el) return;
    el.innerHTML = '<h3>This Week</h3><strong>' + (s.week && s.week.title || 'School Week') + '</strong><p>' + (s.week && s.week.note || '') + '</p>';
  }

  function renderHouses(s) {
    var el = document.getElementById('hshsSchoolHouses');
    if (!el) return;
    var rows = (s.housePoints || []).map(function (h) {
      return '<li><span>' + h.house + '</span><b>' + h.points + '</b></li>';
    }).join('');
    el.innerHTML = '<h3>House Points</h3><ul class="hshs-school-list">' + rows + '</ul>';
  }

  function renderRanks(s) {
    var el = document.getElementById('hshsSchoolRanks');
    if (!el) return;
    var rows = (s.ranks || []).map(function (r, i) {
      return '<li><span>#' + (i + 1) + ' ' + r.name + '</span><small>' + r.role + ' · ' + r.score + '</small></li>';
    }).join('');
    el.innerHTML = '<h3>Student Ranks</h3><ul class="hshs-school-list">' + rows + '</ul>';
  }

  function renderCalendar(s) {
    var el = document.getElementById('hshsSchoolCalendar');
    if (!el) return;
    var rows = (s.calendar || []).map(function (c) {
      return '<li><span>' + c.day + '</span><b>' + c.event + '</b></li>';
    }).join('');
    el.innerHTML = '<h3>Calendar</h3><ul class="hshs-school-list">' + rows + '</ul>';
  }

  function openNomination() {
    nominationModal();
    var modal = document.getElementById('hshsNominationModal');
    if (modal) modal.classList.add('open');
  }

  function nominationModal() {
    if (document.getElementById('hshsNominationModal')) return;
    var html = '<div class="hshs-school-modal" id="hshsNominationModal">' +
      '<div class="hshs-school-backdrop" data-close-nom></div>' +
      '<div class="hshs-school-dialog">' +
      '<h3>Nominate a student</h3>' +
      '<label>Name<input id="hshsNomName" type="text" placeholder="Student name"></label>' +
      '<label>Reason<textarea id="hshsNomReason" rows="3" placeholder="Why?"></textarea></label>' +
      '<div class="hshs-school-dialog-actions">' +
      '<button type="button" data-close-nom>Cancel</button>' +
      '<button type="button" data-confirm-nom>Submit</button>' +
      '</div></div></div>';
    try { document.body.insertAdjacentHTML('beforeend', html); } catch (e) { return; }
    try {
      document.getElementById('hshsNominationModal').addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-close-nom')) {
          document.getElementById('hshsNominationModal').classList.remove('open');
        }
        if (e.target.hasAttribute('data-confirm-nom')) {
          var name = (document.getElementById('hshsNomName') || {}).value || '';
          var reason = (document.getElementById('hshsNomReason') || {}).value || '';
          if (!name.trim()) return;
          var s = load();
          s.nominations = s.nominations || [];
          s.nominations.push({ name: name.trim(), reason: reason.trim(), at: Date.now() });
          save(s);
          document.getElementById('hshsNominationModal').classList.remove('open');
        }
      });
    } catch (e) { /* ignore */ }
  }

  function renderNominationPanel() {
    try {
      var btn = document.getElementById('hshsNominateBtn');
      if (!btn || btn.__hshsBound) return;
      btn.__hshsBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openNomination();
      });
    } catch (e) { /* ignore */ }
  }

  function init(){
    if (!window.HshsStore) { setTimeout(init,120); return; }
    injectHub();
    renderNominationPanel();
    window.HshsSchool = { getState: load, nominate: openNomination, refresh: function(){var s=load();renderWeek(s);renderHouses(s);renderRanks(s);renderCalendar(s);renderNominationPanel();} };
  }
  function onHshsPage(){
    // After SPA swap back to Home, re-inject School Hub if the live DOM was replaced
    if (!document.querySelector('.hero')) return;
    if (!window.HshsStore) { setTimeout(onHshsPage, 120); return; }
    injectHub();
    renderNominationPanel();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  document.addEventListener('hshs:page', onHshsPage);
})();
