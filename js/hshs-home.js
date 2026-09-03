(function () {
  if (window.__hshsHomeLive) return;
  window.__hshsHomeLive = true;

  var SLIDES = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=60',
    'https://images.unsplash.com/photo-1577896850726-33fa89c64723?auto=format&fit=crop&w=1200&q=60',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=60',
    'https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png'
  ];
  var FEATURED = [
    { title: 'Assembly highlights', tag: 'Campus', href: 'index/gallery.html', img: SLIDES[0] },
    { title: 'Inter-house training', tag: 'Sports', href: 'index/videos.html', img: SLIDES[1] },
    { title: 'Class photo day', tag: 'Photos', href: 'index/photos.html', img: SLIDES[2] },
    { title: 'STEM club meetup', tag: 'Clubs', href: 'index/spotlight.html', img: SLIDES[0] }
  ];
  var EVENTS = [
    { title: 'Friday Assembly', meta: 'Fri · Main hall', href: 'index/memories.html', icon: 'fa-bullhorn' },
    { title: 'Inter-house Training', meta: 'Sat · Field', href: 'index/videos.html', icon: 'fa-running' },
    { title: 'STEM Club Meetup', meta: 'Mon · Lab 2', href: 'index/gallery.html', icon: 'fa-flask' },
    { title: 'Class Photo Day', meta: 'Wed · Quad', href: 'index/photos.html', icon: 'fa-camera' }
  ];
  var TRENDING = [
    { title: 'House A takes the lead', meta: '420 house points', href: 'index/trending.html', icon: 'fa-fire' },
    { title: 'New Buzz clips this week', meta: 'Campus shorts', href: 'index/buzz.html', icon: 'fa-bolt' },
    { title: 'Vote the spirit poll', meta: 'Polls close Friday', href: 'index/polls.html', icon: 'fa-square-poll-vertical' }
  ];

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  function fillFeatured() {
    var box = document.getElementById('featuredGrid');
    if (!box) return;
    box.innerHTML = FEATURED.map(function (item) {
      return '<a class="featured-card" href="' + item.href + '">' +
        '<span class="tag">' + item.tag + '</span>' +
        '<img src="' + item.img + '" alt="">' +
        '<span>' + item.title + '</span></a>';
    }).join('');
  }
  function fillList(id, rows) {
    var box = document.getElementById(id);
    if (!box) return;
    box.innerHTML = rows.map(function (row) {
      return '<a class="home-row" href="' + row.href + '">' +
        '<i class="fas ' + row.icon + '"></i>' +
        '<span><strong>' + row.title + '</strong><small>' + row.meta + '</small></span></a>';
    }).join('');
  }
  function fillWelcomeSlides() {
    var box = document.getElementById('welcomeSlides');
    if (!box) return;
    box.innerHTML = SLIDES.map(function (src, i) {
      return '<img src="' + src + '" alt="" class="' + (i === 0 ? 'on' : '') + '">';
    }).join('');
    var n = 0;
    setInterval(function () {
      var imgs = box.querySelectorAll('img');
      if (!imgs.length) return;
      imgs[n].classList.remove('on');
      n = (n + 1) % imgs.length;
      imgs[n].classList.add('on');
    }, 3500);
  }
  function fillStats() {
    setText('totalPhotos', '128');
    setText('totalVideos', '46');
    setText('totalStudents', '860');
    setText('totalLikes', '3.2k');
  }
  function fillQuote() {
    setText('dailyQuote', 'Your school. One world. Share the moment.');
    setText('quoteAuthor', 'HSHS World');
  }
  function boot() {
    if (!document.getElementById('featuredGrid') && !document.getElementById('welcomeSlides')) return;
    fillWelcomeSlides();
    fillFeatured();
    fillStats();
    fillList('upcomingEvents', EVENTS);
    fillList('trendingToday', TRENDING);
    fillList('hshsCalendarList', EVENTS);
    fillQuote();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
