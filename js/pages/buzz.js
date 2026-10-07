(function (global) {
  'use strict';
  var PAGE = 'buzz';
  if (global.__hshsBuzzPageModule) return;
  global.__hshsBuzzPageModule = true;
  var state = { mounted:false, items:[], all:[], feed:'discover', active:-1, muted:readMute(), liked:new Set(), saved:new Set(), follows:readFollows(), observer:null };
  function readMute(){ try { return sessionStorage.getItem('hshsVibeMuted')==='1'; } catch(e){ return false; } }
  function writeMute(on){ state.muted=!!on; try{ sessionStorage.setItem('hshsVibeMuted', on?'1':'0'); }catch(e){} }
  function readFollows(){ try { return new Set(JSON.parse(localStorage.getItem('hshsVibeFollows')||'[]')); } catch(e){ return new Set(); } }
  function writeFollows(){ try { localStorage.setItem('hshsVibeFollows', JSON.stringify(Array.from(state.follows))); } catch(e){} }
  function isPage(){
    var f=(location.pathname.split('/').pop()||'').toLowerCase().replace(/\.html$/,'');
    return f==='buzz'||f==='vibe'||f==='clips'||f==='shorts'||(global.HshsRoute&&global.HshsRoute.is(PAGE));
  }
  function base(){ return location.pathname.indexOf('/index/')!==-1 ? '../' : ''; }
  function esc(value){ return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c];}); }
  function mediaUrl(item){ return item.video_url||item.videoUrl||item.url||item.media_url||item.mediaUrl||item.src||''; }
  function posterUrl(item){ return item.thumbnail||item.thumbnail_url||item.thumbnailUrl||item.cover||item.image_url||item.imageUrl||''; }
  function title(item){ return item.title||item.caption||item.description||'HSHS moment'; }
  function author(item){ return String(item.author||item.username||item.userName||item.creator||item.user||'HSHS Student'); }
  function count(item,key){ return Number(item[key]||item[key+'Count']||0)||0; }
  function loadCss(){ [['css/hshs-wave.css','wave'],['css/buzz.css','buzz']].forEach(function(pair){ if(document.querySelector('link[data-hshs-css="'+pair[0]+'"]')) return; var link=document.createElement('link'); link.rel='stylesheet'; link.href=base()+pair[0]+'?v=261002route2'; link.dataset.hshsCss=pair[0]; document.head.appendChild(link); }); }
  function toast(message){ var el=document.getElementById('buzzToast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(function(){el.classList.remove('show');},1700); }
  function visibleItems(){ if(state.feed!=='following') return state.all; return state.all.filter(function(item){ return state.follows.has(author(item).toLowerCase()); }); }
  function render(){ var feed=document.getElementById('buzzFeed'); if(!feed)return; state.items=visibleItems(); if(!state.items.length){ feed.innerHTML='<div class="buzz-state buzz-empty"><i class="far fa-circle-play"></i><strong>'+(state.feed==='following'?'No followed creators yet':'No Vibe clips yet')+'</strong><small>'+(state.feed==='following'?'Follow a campus clip to see it here.':'Sports day and assembly clips will land here.')+'</small></div>'; return; }
    feed.innerHTML=state.items.map(function(item,index){ var id=String(item.id||index); var src=mediaUrl(item), poster=posterUrl(item), who=author(item); var cap=String(item.description&&item.description!==title(item)?item.description:title(item));
      return '<article class="buzz-card" data-buzz-id="'+esc(id)+'" data-index="'+index+'" data-author="'+esc(who)+'"><div class="buzz-media">'+(src?'<video playsinline webkit-playsinline loop preload="metadata" '+(poster?'poster="'+esc(poster)+'" ':'')+'src="'+esc(src)+'"></video>':'<div class="buzz-placeholder" style="background:#123b82 center/cover url('+esc(poster)+')"><i class="fas fa-play"></i></div>')+'</div><div class="buzz-shade"></div><button class="buzz-sound" type="button" data-buzz-action="sound" aria-label="Toggle sound"><i class="fas '+(state.muted?'fa-volume-xmark':'fa-volume-high')+'"></i></button><div class="buzz-rail"><button class="buzz-action'+(state.liked.has(id)?' liked':'')+'" type="button" data-buzz-action="like"><i class="fas fa-heart"></i><span>'+count(item,'likes')+'</span></button><button class="buzz-action" type="button" data-buzz-action="share"><i class="fas fa-share"></i><span>Share</span></button></div><div class="buzz-info"><div class="buzz-author">@'+esc(who.replace(/^@/,''))+'</div><div class="buzz-caption">'+esc(cap)+'</div></div></article>'; }).join('');
    document.querySelectorAll('.buzz-card video').forEach(function(video){ video.muted=state.muted; video.loop=true; });
  }
  async function loadVideos(){ var feed=document.getElementById('buzzFeed'); var videos=[]; try{ if(global.db && typeof global.db.getVideos==='function') videos=await global.db.getVideos(24,0); }catch(error){ console.error('[HSHS Vibe] video query failed', error); if(feed){ feed.innerHTML='<div class="buzz-state buzz-empty"><i class="fas fa-triangle-exclamation"></i><strong>Could not load Vibe</strong><small>Check back and try again.</small><button type="button" data-buzz-action="retry">Retry</button></div>'; } if(global.HshsRoute) global.HshsRoute.reveal(); return; } state.all=(videos||[]).filter(function(item){ return !!mediaUrl(item); }); render(); if(global.HshsRoute) global.HshsRoute.reveal(); }
  function bind(){ if(global.__hshsBuzzEvents)return; global.__hshsBuzzEvents=true;
    document.addEventListener('click',function(e){ if(!isPage())return; var action=e.target.closest('[data-buzz-action]'); if(!action)return; var name=action.dataset.buzzAction;
      if(name==='sound'){ writeMute(!state.muted); document.querySelectorAll('.buzz-card video').forEach(function(v){ v.muted=state.muted; }); document.querySelectorAll('.buzz-sound').forEach(function(btn){ btn.innerHTML='<i class="fas '+(state.muted?'fa-volume-xmark':'fa-volume-high')+'"></i>'; }); }
      if(name==='like'){ var card=action.closest('.buzz-card'); var id=card&&card.dataset.buzzId; if(id){ state.liked.add(id); action.classList.add('liked'); } }
      if(name==='share'){ var link=location.href; if(navigator.clipboard) navigator.clipboard.writeText(link).then(function(){ toast('Link copied'); }); else toast('Share this page with the school'); }
      if(name==='feed'){ state.feed=action.dataset.feed||'discover'; render(); }
      if(name==='retry'){ loadVideos(); }
    });
  }
  async function mount(){ if(!isPage()||!global.HshsRender)return; var root=document.getElementById('hshs-page'); if(!root)return; loadCss(); var tpl=global.HshsTemplates&&global.HshsTemplates.buzz; if(tpl && !document.getElementById('buzzFeed')){ global.HshsRender.mountHTML?global.HshsRender.mountHTML(root,tpl):root.innerHTML=tpl; } document.documentElement.dataset.hshsPage=PAGE; document.body.classList.add('vibe-watching'); state.mounted=true; bind(); await loadVideos(); }
  function boot(){ var go=function(){ if(!isPage()){ document.body.classList.remove('vibe-watching'); return; } if(!global.HshsRender){ setTimeout(go,40); return; } mount(); }; if(global.HshsApp&&typeof global.HshsApp.whenReady==='function') global.HshsApp.whenReady(go); else document.addEventListener('hshs:foundation-ready',go,{once:true}); go(); setTimeout(go,500); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  document.addEventListener('hshs:page', function(){ if(isPage()) mount(); });
  global.HshsBuzz={ mount:mount, refresh:loadVideos };
})(typeof window!=='undefined'?window:this);
