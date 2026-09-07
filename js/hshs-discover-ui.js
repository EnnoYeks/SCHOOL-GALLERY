(function (g) {
  'use strict';
  if (g.__hshsDiscoverUi) return;
  g.__hshsDiscoverUi = true;
  var IMG=['https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=70','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70','https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=70','https://images.unsplash.com/photo-14565130808-0ec1eeada4d3?auto=format&fit=crop&w=900&q=70','https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=70'];
  var ITEMS=[{title:'Sports Day on the main field',tag:'Sports',who:'HSHS Studio'},{title:'Assembly week highlights',tag:'Campus',who:'Prefects 2026'},{title:'Science lab practicals',tag:'STEM',who:'Science Group'},{title:'Class 4A project board',tag:'Class',who:'Class 4A'},{title:'House spirit afternoon',tag:'Events',who:'Games Dept'},{title:'Library quiet hour',tag:'Campus',who:'School Gallery'}];
  function item(i){return ITEMS[i%ITEMS.length];}
  function img(i){return IMG[i%IMG.length];}
  function card(i,kind){var it=item(i);return '<article class="hub-card" data-kind="'+(kind||'post')+'"><img src="'+img(i)+'" alt="'+it.title+'" loading="lazy"><div><b>'+it.title+'</b><small>'+it.who+' · '+it.tag+'</small></div></article>';}
  function emptyish(el){if(!el)return false;if(!el.children.length)return true;return /loading|nothing|no |choose a year|empty|skel/i.test(el.textContent||'')||!!el.querySelector('.vibe-skel-feat,.vibe-skel-row,.hshs-empty,.memories-loading,.memories-empty');}
  function fill(id,html){var el=document.getElementById(id);if(!el||!emptyish(el))return;el.innerHTML=html;el.hidden=false;}
  function studio(){fill('featuredVideo',card(0,'video')+card(2,'video'));fill('videosContainer',[1,3,4,5].map(function(i){return card(i,'video');}).join(''));}
  function saved(){fill('hshsSavedList',[0,1,3,4].map(function(i){return card(i,'saved');}).join(''));}
  function memories(){fill('onThisDayGrid',[0,1,2].map(function(i){return card(i,'memory');}).join(''));fill('schoolTimeline',[0,2,3,5].map(function(i){var it=item(i);return '<div class="memories-timeline-item hub-line"><strong>'+it.title+'</strong><small>'+it.who+'</small></div>';}).join(''));var years=document.getElementById('archiveYears');if(years&&emptyish(years))years.innerHTML='<button class="memories-year active" type="button">2026</button><button class="memories-year" type="button">2025</button><button class="memories-year" type="button">2024</button>';fill('yearArchiveContent',[1,4,5].map(function(i){return card(i,'memory');}).join(''));}
  function trending(){fill('topTrendingHero',card(0,'trend'));fill('topTrendingSide',card(2,'trend')+card(3,'trend'));fill('trendingGrid',[1,4,5,2].map(function(i){return card(i,'trend');}).join(''));fill('hotTopics','<button type="button">#SportsDay</button><button type="button">#HouseSpirit</button><button type="button">#Class4A</button><button type="button">#HSHSStudio</button>');}
  function spotlight(){fill('featuredStudent',card(1,'spot'));fill('spotlightGrid',[0,2,3,4].map(function(i){return card(i,'spot');}).join(''));fill('hallOfFameList','<p>Prefects 2026 · Discipline · Service · Leadership</p>');}
  function css(){if(document.querySelector('link[data-hshs-hub]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href=(location.pathname.indexOf('/index/')!==-1?'../':'')+'css/hshs-hub.css?v=260907d1';l.setAttribute('data-hshs-hub','1');document.head.appendChild(l);}
  function boot(){css();studio();saved();memories();trending();spotlight();}
  g.HshsDiscoverUi={boot:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,400);});else setTimeout(boot,400);
  document.addEventListener('hshs:page',function(){setTimeout(boot,400);});
})(typeof window!=='undefined'?window:this);
