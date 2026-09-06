(function (global) {
  'use strict';
  var PAGE = 'buzz';
  if (global.__hshsBuzzPageModule) return;
  global.__hshsBuzzPageModule = true;

  var state = { mounted:false, items:[], active:-1, muted:true, liked:new Set(), saved:new Set(), observer:null, progressTimer:null };

  function isPage(){
    var path = location.pathname.toLowerCase();
    return path.endsWith('/buzz.html') || path.endsWith('/clips.html') || path === '/buzz' || path === '/clips';
  }
  function base(){ return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function mediaUrl(item){ return item.video_url || item.videoUrl || item.url || item.media_url || item.mediaUrl || item.src || ''; }
  function posterUrl(item){ return item.thumbnail || item.thumbnail_url || item.thumbnailUrl || item.cover || item.image_url || item.imageUrl || ''; }
  function title(item){ return item.title || item.caption || item.description || 'HSHS moment'; }
  function author(item){ return item.author || item.username || item.userName || item.creator || item.user || 'HSHS Student'; }
  function category(item){ return item.category || item.type || 'Buzz'; }
  function count(item,key){ return Number(item[key] ?? item[key+'Count'] ?? 0) || 0; }
  function dateText(value){
    if (!value) return '';
    var d = value.toDate ? value.toDate() : new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  }
  function loadCss(){
    if (document.querySelector('link[data-hshs-css="css/buzz.css"]')) return;
    var link=document.createElement('link'); link.rel='stylesheet'; link.href=base()+'css/buzz.css?v=260906b1'; link.dataset.hshsCss='css/buzz.css'; document.head.appendChild(link);
  }
  function toast(message){
    var el=document.getElementById('buzzToast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(function(){el.classList.remove('show');},1800);
  }
  function setState(html){ var feed=document.getElementById('buzzFeed'); if(feed)feed.innerHTML=html; }

  function render(){
    var feed=document.getElementById('buzzFeed'); if(!feed)return;
    if(!state.items.length){
      setState('<div class="buzz-state buzz-empty"><i class="fas fa-film"></i><strong>No Buzz yet</strong><small>When HSHS videos are published, they will appear here.</small></div>');
      return;
    }
    feed.innerHTML=state.items.map(function(item,index){
      var id=String(item.id || index);
      var src=mediaUrl(item), poster=posterUrl(item);
      var likes=count(item,'likes'), views=count(item,'views'), comments=count(item,'comments');
      var saved=state.saved.has(id), liked=state.liked.has(id);
      return '<article class="buzz-card" data-buzz-id="'+esc(id)+'" data-index="'+index+'">'+
        '<div class="buzz-media">'+(src?'<video playsinline webkit-playsinline preload="metadata" '+(poster?'poster="'+esc(poster)+'" ':'')+'src="'+esc(src)+'"></video>':'<div class="buzz-placeholder"><i class="fas fa-video-slash"></i></div>')+'</div>'+
        '<div class="buzz-shade"></div><div class="buzz-vignette"></div><span class="buzz-loader"></span>'+
        '<button class="buzz-sound" type="button" data-buzz-action="sound" aria-label="Toggle sound"><i class="fas fa-volume-xmark"></i></button>'+
        '<div class="buzz-play"><i class="fas fa-play"></i></div>'+
        '<div class="buzz-rail">'+
          '<div class="buzz-avatar"><i class="fas fa-user"></i></div>'+
          '<button class="buzz-action '+(liked?'liked':'')+'" type="button" data-buzz-action="like"><i class="fas fa-heart"></i><span>'+likes+'</span></button>'+
          '<button class="buzz-action" type="button" data-buzz-action="comments"><i class="fas fa-comment-dots"></i><span>'+comments+'</span></button>'+
          '<button class="buzz-action '+(saved?'saved':'')+'" type="button" data-buzz-action="save"><i class="fas fa-bookmark"></i><span>Save</span></button>'+
          '<button class="buzz-action" type="button" data-buzz-action="share"><i class="fas fa-share"></i><span>Share</span></button>'+
        '</div>'+
        '<div class="buzz-info"><div class="buzz-author">@'+esc(author(item))+' <i class="fas fa-circle-check"></i></div><div class="buzz-title">'+esc(title(item))+'</div><div class="buzz-caption">'+esc(item.description && item.description!==title(item)?item.description:'')+'</div><div class="buzz-meta"><span>'+esc(category(item))+'</span><span class="dot"></span><span>'+views+' views</span><span class="dot"></span><span>'+esc(dateText(item.createdAt || item.date))+'</span></div></div>'+
      '</article>';
    }).join('');
    bindVideos();
    setupObserver();
    updateProgress();
  }

  function bindVideos(){
    document.querySelectorAll('.buzz-card video').forEach(function(video){
      video.muted=state.muted;
      video.addEventListener('playing',function(){video.closest('.buzz-card').classList.add('is-playing','is-loaded');video.closest('.buzz-card').classList.remove('is-paused');});
      video.addEventListener('loadeddata',function(){video.closest('.buzz-card').classList.add('is-loaded');});
      video.addEventListener('pause',function(){video.closest('.buzz-card').classList.remove('is-playing');});
      video.addEventListener('timeupdate',updateProgress);
    });
  }
  function setupObserver(){
    if(state.observer)state.observer.disconnect();
    var feed=document.getElementById('buzzFeed'); if(!feed)return;
    state.observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var card=entry.target, video=card.querySelector('video');
        if(entry.isIntersecting && entry.intersectionRatio>=.7){
          state.active=Number(card.dataset.index);
          document.querySelectorAll('.buzz-card video').forEach(function(v){if(v!==video){v.pause();v.currentTime=0;}});
          if(video){video.muted=state.muted; var p=video.play(); if(p&&p.catch)p.catch(function(){card.classList.add('is-paused');});}
        }else if(video){video.pause();}
      });
    },{root:feed,threshold:[.3,.7,1]});
    document.querySelectorAll('.buzz-card').forEach(function(card){state.observer.observe(card);});
  }
  function updateProgress(){
    var card=document.querySelector('.buzz-card[data-index="'+state.active+'"]'), video=card&&card.querySelector('video'), bar=document.getElementById('buzzProgress');
    if(!bar)return; bar.style.width=(video&&video.duration?Math.min(100,(video.currentTime/video.duration)*100):0)+'%';
  }
  function activeItem(){return state.items[state.active] || null;}

  async function loadVideos(){
    var videos=[];
    try{
      if(global.db && typeof global.db.getVideos==='function') videos=await global.db.getVideos(24,0);
    }catch(error){console.error('[HSHS Buzz] video query failed',error);}
    state.items=(videos||[]).filter(function(item){return !!mediaUrl(item);});
    render();
  }

  async function likeActive(button){
    var item=activeItem(); if(!item)return;
    var id=String(item.id), liked=state.liked.has(id);
    if(liked){state.liked.delete(id); button.classList.remove('liked'); toast('Like removed'); return;}
    state.liked.add(id); button.classList.add('liked');
    var span=button.querySelector('span'); if(span)span.textContent=count(item,'likes')+1;
    if(global.db&&typeof global.db.addLike==='function') await global.db.addLike(item.id,'video');
  }
  function saveActive(button){
    var item=activeItem(); if(!item)return; var id=String(item.id);
    if(global.HshsStore&&typeof global.HshsStore.toggleSave==='function'){
      try{global.HshsStore.toggleSave(item.id);state.saved.has(id)?state.saved.delete(id):state.saved.add(id);}catch(e){state.saved.has(id)?state.saved.delete(id):state.saved.add(id);}
    }else state.saved.has(id)?state.saved.delete(id):state.saved.add(id);
    button.classList.toggle('saved',state.saved.has(id)); toast(state.saved.has(id)?'Saved to your collection':'Removed from saves');
  }
  async function shareActive(){
    var item=activeItem(); if(!item)return; var url=location.origin+'/index/buzz.html#'+encodeURIComponent(item.id);
    try{if(navigator.share)await navigator.share({title:title(item),text:'HSHS Buzz · '+title(item),url:url});else{await navigator.clipboard.writeText(url);toast('Buzz link copied');}}catch(e){}
  }
  async function comments(){
    var item=activeItem(), box=document.getElementById('buzzComments'), list=document.getElementById('buzzCommentList'); if(!item||!box||!list)return;
    box.hidden=false; list.innerHTML='<div class="buzz-state" style="height:auto;padding:30px"><span class="buzz-spinner"></span><small>Loading comments…</small></div>';
    var comments=[]; try{if(global.db&&typeof global.db.getComments==='function')comments=await global.db.getComments(item.id);}catch(e){}
    list.innerHTML=comments.length?comments.map(function(c){return '<div class="buzz-comment"><strong>'+esc(c.author||c.username||'Student')+'</strong><div>'+esc(c.text||c.comment||'')+'</div></div>';}).join(''):'<div class="buzz-state" style="height:auto;padding:30px"><small>No comments yet.</small></div>';
  }

  function bind(){
    if(global.__hshsBuzzEvents)return; global.__hshsBuzzEvents=true;
    document.addEventListener('click',function(e){
      var action=e.target.closest('[data-buzz-action]'); if(action){
        var name=action.dataset.buzzAction;
        if(name==='sound'){state.muted=!state.muted;document.querySelectorAll('.buzz-card video').forEach(function(v){v.muted=state.muted;});action.innerHTML='<i class="fas '+(state.muted?'fa-volume-xmark':'fa-volume-high')+'"></i>';return;}
        if(name==='like'){likeActive(action);return;} if(name==='save'){saveActive(action);return;} if(name==='share'){shareActive();return;} if(name==='comments'){comments();return;}
        if(name==='close-comments'){var box=document.getElementById('buzzComments');if(box)box.hidden=true;return;} if(name==='refresh'){loadVideos();return;} if(name==='upload'){location.href=base()+'upload.html';return;}
      }
      var card=e.target.closest('.buzz-card'); if(card && !e.target.closest('button')){var video=card.querySelector('video');if(video){if(video.paused){video.muted=state.muted;video.play().catch(function(){});card.classList.remove('is-paused');}else{video.pause();card.classList.add('is-paused');}}}
    });
    document.addEventListener('dblclick',function(e){var card=e.target.closest('.buzz-card');if(!card)return;var like=card.querySelector('[data-buzz-action="like"]');if(like&&!like.classList.contains('liked'))likeActive(like);});
    document.addEventListener('keydown',function(e){if(!isPage())return;var feed=document.getElementById('buzzFeed');if(!feed)return;if(e.key==='ArrowDown'){e.preventDefault();feed.scrollBy({top:feed.clientHeight,behavior:'smooth'});}if(e.key==='ArrowUp'){e.preventDefault();feed.scrollBy({top:-feed.clientHeight,behavior:'smooth'});}});
  }

  async function mount(){
    if(!isPage()||state.mounted||!global.HshsRender)return;
    var root=document.getElementById('hshs-page'); if(!root)return;
    loadCss();
    var tpl=global.HshsTemplates&&global.HshsTemplates.buzz;
    if(!tpl){console.error('[HSHS Buzz] template missing');return;}
    global.HshsRender.mountHTML?global.HshsRender.mountHTML(root,tpl):root.innerHTML=tpl;
    document.documentElement.dataset.hshsPage=PAGE;
    state.mounted=true; bind(); await loadVideos();
  }
  function boot(){
    var go=function(){if(!isPage())return;if(!global.HshsRender){setTimeout(go,40);return;}mount();};
    if(global.HshsApp&&typeof global.HshsApp.whenReady==='function')global.HshsApp.whenReady(go);else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  global.HshsBuzz={mount:mount,refresh:loadVideos};
})(typeof window!=='undefined'?window:this);
