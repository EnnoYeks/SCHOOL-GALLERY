(function(global){'use strict';var PAGE='memories';if(global.__hshsMemoriesPageModule)return;global.__hshsMemoriesPageModule=true;
function isPage(){var f=(window.HshsPaths?HshsPaths.key():'');return f===PAGE||(global.HshsRoute&&global.HshsRoute.is(PAGE));}
function base(){return '/'}
function loadCss(){if(document.querySelector('link[data-hshs-css="css/memories.css"]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href=base()+'css/memories.css?v=261002fast1';l.dataset.hshsCss='css/memories.css';document.head.appendChild(l)}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return({'&':'&','<':'<','>':'>','\"':'"',"'":'&#39;'})[c]})}
function dateOf(p){var v=p&&(p.createdAt||p.timestamp||p.date);if(v&&typeof v.toDate==='function')v=v.toDate();var d=new Date(v);return isNaN(d)?null:d}
function titleOf(p){var t=String(p&&(p.title||p.description||p.caption)||'').trim();return /^(campus moment|hshs moment|campus photo|campus video|school moment)$/i.test(t)?'':t}
function mediaOf(p){return p&&(p.imageUrl||p.image||p.thumbnailUrl||p.poster||p.mediaURL||p.mediaUrl)||''}
function authorOf(p){return p&&(p.authorName||p.author||p.username||p.displayName)||'HSHS World'}
function typeOf(p){var t=String(p&&(p.type||p.mediaType||p.category)||'photo').toLowerCase();if(t.indexOf('event')>=0)return'event';if(t.indexOf('video')>=0)return'video';return'photo'}
function countOf(p,key){var v=Number(p&&p[key]);return Number.isFinite(v)&&v>0?v:0}
function fmtDate(d,opts){return d?d.toLocaleDateString(undefined,opts):'HSHS archive'}
function ageLabel(d,now){var y=now.getFullYear()-d.getFullYear();return y<=0?'This year':y+' year'+(y===1?'':'s')+' ago'}
function iconFor(t){return t==='video'?'fa-play':t==='event'?'fa-calendar-day':'fa-camera'}
function mediaBlock(p){var m=mediaOf(p),t=typeOf(p);return '<div class="memories-media is-'+t+'"><span class="memories-ph" aria-hidden="true"><i class="fas '+iconFor(t)+'"></i></span>'+(m?'<img loading="lazy" src="'+esc(m)+'" alt="'+esc(titleOf(p))+'" onerror="this.hidden=true">':'')+'</div>'}
function featureCard(p,now){var d=dateOf(p),likes=countOf(p,'likes'),comments=countOf(p,'comments'),actions=(likes?'<span><i class="far fa-heart"></i> '+likes+'</span>':'')+(comments?'<span><i class="far fa-comment"></i> '+comments+'</span>':'');return'<article class="memories-feature-card" data-memory-type="'+typeOf(p)+'">'+mediaBlock(p)+'<div class="memories-feature-copy"><span class="memories-age">'+esc(ageLabel(d,now))+' · '+esc(fmtDate(d,{month:'short',day:'numeric',year:'numeric'}))+'</span>'+(titleOf(p)?'<h3>'+esc(titleOf(p))+'</h3>':'')+'<p>'+esc(authorOf(p))+'</p>'+(actions?'<div class="memories-actions">'+actions+'</div>':'')+'</div></article>'}
function reelCard(p){var d=dateOf(p),t=typeOf(p);return'<article class="memories-reel-card" data-memory-type="'+t+'" data-memory-author="'+esc(authorOf(p))+'">'+mediaBlock(p)+'<span class="memories-play"><i class="fas '+iconFor(t)+'"></i></span><div class="memories-reel-copy"><strong>'+esc(titleOf(p))+'</strong><small>'+esc(fmtDate(d,{month:'short',day:'numeric',year:'numeric'}))+'</small></div></article>'}
function timelineItem(p){var d=dateOf(p),m=mediaOf(p);return'<article class="memories-timeline-item"><span class="memories-timeline-dot"></span><div><div class="memories-timeline-date">'+esc(fmtDate(d,{month:'short',day:'numeric'}))+'</div><div class="memories-timeline-title">'+esc(titleOf(p))+'</div><div class="memories-timeline-meta">'+esc(authorOf(p))+' · '+esc(fmtDate(d,{year:'numeric'}))+'</div></div>'+(m?'<div class="memories-timeline-thumb"><img loading="lazy" src="'+esc(m)+'" alt="" onerror="this.parentNode.hidden=true"></div>':'')+'</article>'}
function yearCard(y,count,i){return'<button type="button" class="memories-year'+(i===0?' active':'')+'" data-year="'+esc(y)+'"><strong>'+esc(y)+'</strong><small>'+count+' memor'+(count===1?'y':'ies')+'</small></button>'}
function memoryCard(p){var d=dateOf(p);return'<article class="memories-card" data-memory-type="'+typeOf(p)+'">'+mediaBlock(p)+'<div class="memories-card-copy"><div class="memories-card-title">'+esc(titleOf(p))+'</div><div class="memories-card-meta">'+esc(authorOf(p))+' · '+esc(fmtDate(d,{day:'numeric',month:'short',year:'numeric'}))+'</div></div></article>'}
function personCard(name,count){var clean=String(name||'HSHS World'),parts=clean.trim().split(/\s+/),initials=(parts[0]||'H').charAt(0)+(parts.length>1?parts[parts.length-1].charAt(0):'');return'<article class="memories-person"><div class="memories-avatar">'+esc(initials.toUpperCase())+'</div><strong title="'+esc(clean)+'">'+esc(clean)+'</strong><small>'+count+' memor'+(count===1?'y':'ies')+'</small></article>'}
async function getPosts(root){
  var posts=[];
  var reel=root&&root.querySelector('#memoryReel');
  try{
    var mediaSlots=await import('/js/media-slots.js');
    await mediaSlots.loadSlots(['memories_page'],{memories_page:reel},{
      renderers:{
        memories_page:function(slot,items){
          posts=(items||[]).filter(function(item){return !!item.src&&(!item.video||!!item.poster)}).map(function(item){
            var rawTitle=String(item.title||item.caption||'').trim();
            if(/^(campus moment|hshs moment|campus photo|campus video|school moment)$/i.test(rawTitle))rawTitle='';
            return {
              id:item.id,title:rawTitle,description:item.description||item.caption||'',
              caption:item.caption||'',author:item.author||'',authorName:item.author||'',
              type:item.video?'video':'photo',mediaType:item.video?'video':'photo',
              imageUrl:item.video?item.poster:item.src,image:item.video?item.poster:item.src,
              thumbnailUrl:item.poster||item.src,videoUrl:item.videoUrl||'',
              likes:Number(item.likes)>0?Number(item.likes):null,
              comments:Number(item.comments)>0?Number(item.comments):null,
              createdAt:item.createdAt,category:item.category||''
            };
          });
          render(root,posts);
          return posts.length;
        }
      }
    });
  }catch(error){console.error('[HSHS] Managed memories slot failed',error);posts=[];render(root,posts)}
  return posts;
}
function wireMediaFailures(root){
  root.querySelectorAll('.memories-media img,.memories-timeline-thumb img').forEach(function(img){
    if(img.dataset.failureWired==='1')return;
    img.dataset.failureWired='1';
    img.addEventListener('error',function(){
      var card=img.closest('article');
      if(card)card.hidden=true;
      var section=img.closest('.memories-section');
      if(section&&!section.querySelector('article:not([hidden])'))section.hidden=true;
    },{once:true});
  });
}
function wireTabs(){var tabs=document.querySelectorAll('.memories-tabs a');tabs.forEach(function(a){a.addEventListener('click',function(){tabs.forEach(function(x){x.classList.remove('is-active')});a.classList.add('is-active')})})}
function wireFilters(){document.querySelectorAll('[data-memory-filter]').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('[data-memory-filter]').forEach(function(x){x.classList.remove('is-active')});btn.classList.add('is-active');var f=btn.dataset.memoryFilter;document.querySelectorAll('.memories-reel-card').forEach(function(card){var ok=f==='all'||(f!=='mine'&&card.dataset.memoryType===f);card.hidden=!ok})})})}
function render(root,posts){posts=(posts||[]).filter(function(p){return dateOf(p)&&mediaOf(p)}).sort(function(a,b){return dateOf(b)-dateOf(a)});var now=new Date(),month=now.getMonth(),day=now.getDate();document.documentElement.setAttribute('data-hshs-page',PAGE);var mediaSections=['onThisDay','reel','timeline','years'];mediaSections.forEach(function(id){var section=root.querySelector('#'+id);if(section)section.hidden=!posts.length});
var today=root.querySelector('#memoryToday');if(today)today.textContent=now.toLocaleDateString(undefined,{month:'long',day:'numeric'});
var onDay=posts.filter(function(p){var d=dateOf(p);return d.getMonth()===month&&d.getDate()===day});var onDayEl=root.querySelector('#onThisDayGrid');if(onDayEl)onDayEl.innerHTML=onDay.length?onDay.slice(0,8).map(function(p){return featureCard(p,now)}).join(''):'<div class="memories-empty"><i class="far fa-calendar-xmark"></i><br>No earlier memories from this date yet.</div>';
var reel=root.querySelector('#memoryReel');if(reel)reel.innerHTML=posts.length?posts.slice(0,12).map(reelCard).join(''):'<div class="memories-empty">No memories are available yet.</div>';
var timeline=root.querySelector('#schoolTimeline');if(timeline)timeline.innerHTML=posts.length?posts.slice(0,8).map(timelineItem).join(''):'<div class="memories-empty">No memories are available yet.</div>';
var byYear={};posts.forEach(function(p){var y=dateOf(p).getFullYear();byYear[y]=(byYear[y]||0)+1});var years=Object.keys(byYear).sort(function(a,b){return b-a});var yearsEl=root.querySelector('#archiveYears');if(yearsEl)yearsEl.innerHTML=years.length?years.map(function(y,i){return yearCard(y,byYear[y],i)}).join(''):'<div class="memories-empty">No dated memories yet.</div>';
var archive=root.querySelector('#yearArchiveContent');function showYear(y){if(!archive)return;var chosen=posts.filter(function(p){return String(dateOf(p).getFullYear())===String(y)});archive.innerHTML=chosen.length?chosen.slice(0,6).map(memoryCard).join(''):'<div class="memories-empty">No memories found for '+esc(y)+'.</div>';if(yearsEl)yearsEl.querySelectorAll('.memories-year').forEach(function(b){b.classList.toggle('active',b.dataset.year===String(y))})}if(yearsEl)yearsEl.querySelectorAll('.memories-year').forEach(function(b){b.addEventListener('click',function(){showYear(b.dataset.year)})});if(years.length)showYear(years[0]);
var people={};posts.forEach(function(p){var a=authorOf(p);people[a]=(people[a]||0)+1});var peopleNames=Object.keys(people).sort(function(a,b){return people[b]-people[a]}),peopleEl=root.querySelector('#memoryPeople');if(peopleEl)peopleEl.innerHTML=peopleNames.length?peopleNames.slice(0,5).map(function(a){return personCard(a,people[a])}).join(''):'<div class="memories-empty">People will appear as the archive grows.</div>';
var birthdays=root.querySelector('#memoryBirthdays');if(birthdays)birthdays.innerHTML='<div class="memories-empty">Birthday highlights will appear when profile birthday dates are available.</div>';
wireTabs();wireFilters();wireMediaFailures(root);if(global.HshsRoute)global.HshsRoute.reveal();}
async function mount(){if(!isPage()||!global.HshsRender)return;loadCss();var root=document.getElementById('hshs-page');if(!root){root=document.createElement('div');root.id='hshs-page';document.body.appendChild(root)}var tpl=global.HshsTemplates&&global.HshsTemplates[PAGE];if(tpl&&!root.querySelector('#memoryReel')){if(global.HshsRender.mountHTML)global.HshsRender.mountHTML(root,tpl);else root.innerHTML=tpl}await getPosts(root)}
function boot(){function go(){if(isPage())mount()}if(global.HshsApp&&typeof global.HshsApp.whenReady==='function')global.HshsApp.whenReady(go);else document.addEventListener('hshs:foundation-ready',go,{once:true});document.addEventListener('hshs:page',function(e){if(e.detail&&e.detail.page===PAGE)mount()});go();setTimeout(go,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()})(typeof window!=='undefined'?window:this);
