(function(g){
  'use strict';
  if(g.__hshsNotificationsPageModule) return;
  g.__hshsNotificationsPageModule = true;
  var PAGE='notifications';
  function isPage(){
    try{ if(g.HshsRegistry&&g.HshsRegistry.activeRoute) return g.HshsRegistry.activeRoute().name===PAGE; }catch(e){}
    return (window.HshsPaths?HshsPaths.key():'')==='notifications';
  }
  function base(){ return '/'; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);}); }
  function rel(ts){ var d=Date.now()-Number(ts||0); if(d<60000)return'Just now'; if(d<3600000)return Math.floor(d/60000)+'m'; if(d<86400000)return Math.floor(d/3600000)+'h'; return Math.floor(d/86400000)+'d'; }
  function icon(type){ return ({friend_request:'fa-user-plus',friend_accept:'fa-user-check',message:'fa-comment-dots',like:'fa-heart',mention:'fa-at',follow:'fa-user-plus',system:'fa-bell',featured:'fa-star',poll:'fa-square-poll-vertical'}[type]||'fa-bell'); }

  var cache=null, failed=false;
  async function loadRows(){
    failed=false;
    if(!(g.db&&typeof g.db.getNotifications==='function')){ failed=true; cache=[]; return cache; }
    try{
      var uid='';
      try{ if(g.auth&&g.auth.currentUser) uid=g.auth.currentUser.uid; }catch(e){}
      if(!uid&&g.HshsStore&&typeof g.HshsStore.currentUser==='function'){ var me=g.HshsStore.currentUser(); uid=me&&(me.uid||me.id)||''; }
      cache=await g.db.getNotifications(uid||'')||[];
      if(!Array.isArray(cache)) cache=[];
    }catch(e){ failed=true; cache=[]; }
    return cache;
  }
  function rows(){ return cache||[]; }
  function isMsg(n){ var t=String(n.type||'').toLowerCase(); return t==='message'||t==='chat'; }
  function matches(n,tab){
    var t=String(n.type||'').toLowerCase();
    if(tab==='all') return true;
    if(tab==='mentions') return t==='mention';
    if(tab==='messages') return isMsg(n);
    return t==='system'||t==='featured'||t==='poll';
  }
  function dest(n){
    if(n.href) return n.href;
    if(isMsg(n)||String(n.type||'')==='mention') return window.HshsPaths?HshsPaths.href('chat'):'/chat/';
    if(n.type==='poll') return window.HshsPaths?HshsPaths.href('polls'):'/polls/';
    if(n.type==='featured') return window.HshsPaths?HshsPaths.href('spotlight'):'/spotlight/';
    return window.HshsPaths?HshsPaths.href('notifications'):'/notifications/';
  }
  function render(tab){
    var list=document.getElementById('hshsNotifList');
    if(!list) return;
    var all=rows().filter(function(n){ return matches(n,tab); });
    var unreadMsgs=rows().filter(function(n){ return isMsg(n)&&!n.read; }).length;
    var badge=document.getElementById('hshsMsgTabCount');
    if(badge){ badge.textContent=String(unreadMsgs); badge.hidden=!unreadMsgs; }
    if(!all.length){
      var extra=tab==='messages'?'<a class="hshs-open-chats" href="'+base()+'/chat/">Open chats</a>':'';
      if(g.HshsPaint) g.HshsPaint.section(list,'empty',{empty:'<div class="hshs-empty"><i class="fas fa-bell-slash"></i><h4>Nothing here yet</h4>'+extra+'</div>'});
      else list.innerHTML='<div class="hshs-empty"><i class="fas fa-bell-slash"></i><h4>Nothing here yet</h4>'+extra+'</div>';
      return;
    }
    if(g.HshsPaint) g.HshsPaint.section(list,'success');
    list.querySelectorAll('.hshs-notif-card').forEach(function(n){n.remove()});list.insertAdjacentHTML('beforeend',all.map(function(n){
      return '<button type="button" class="hshs-notif-card'+(n.read?'':' unread')+'" data-go="'+esc(dest(n))+'">'+ '<span class="hshs-notif-ico"><i class="fas '+esc(icon(n.type))+'"></i></span>'+ '<span class="hshs-notif-copy"><strong>'+esc(n.title||'Notification')+'</strong><p>'+esc(n.message||'')+'</p><time>'+esc(rel(n.createdAt||Date.now()))+(isMsg(n)?' · Chat':'')+'</time></span>'+ (isMsg(n)?'<span class="hshs-notif-go">Open</span>':'')+ '</button>';
    }).join(''));
    if(tab==='messages') list.insertAdjacentHTML('beforeend','<a class="hshs-open-chats" href="'+base()+'/chat/">See all chats</a>');
  }
  function mount(){
    if(!isPage()||!g.HshsRender||!g.HshsTemplates||!g.HshsTemplates.notifications) return;
    var root=document.getElementById('hshs-page');
    if(!root){ root=document.createElement('div'); root.id='hshs-page'; document.body.appendChild(root); }
    g.HshsRender.mountHTML(root,g.HshsTemplates.notifications);
    document.documentElement.setAttribute('data-hshs-page',PAGE);
    if(!document.getElementById('hshsNotificationsCss')){
      var l=document.createElement('link'); l.id='hshsNotificationsCss'; l.rel='stylesheet'; l.href=base()+'css/hshs-account.css?v=260907n2';
      var h=document.createElement('link'); h.rel='stylesheet'; h.href=base()+'css/hshs-hub.css?v=260907n2';
      document.head.appendChild(h); document.head.appendChild(l);
    }
    var tab='all';
    document.querySelectorAll('[data-notif-tab]').forEach(function(b){
      b.onclick=function(){ tab=b.getAttribute('data-notif-tab'); document.querySelectorAll('[data-notif-tab]').forEach(function(x){ x.classList.toggle('on',x===b); }); render(tab); };
    });
    var mark=document.getElementById('hshsMarkRead');
    if(mark) mark.onclick=function(){ document.querySelectorAll('.hshs-notif-card').forEach(function(c){ c.classList.remove('unread'); }); var badge=document.getElementById('hshsMsgTabCount'); if(badge) badge.hidden=true; };
    document.addEventListener('click',function(e){
      if(!isPage()) return;
      var card=e.target.closest('[data-go]');
      if(!card) return;
      location.href=window.HshsPaths?HshsPaths.href(card.getAttribute('data-go')):('/'+String(card.getAttribute('data-go')||'').replace(/^.*\//,'').replace(/\.html$/,'')+'/');
    });
    var list=document.getElementById('hshsNotifList');
    if(list&&g.HshsPaint) g.HshsPaint.section(list,'loading');
    loadRows().then(function(){
      if(failed){
        if(list&&g.HshsPaint) g.HshsPaint.section(list,'error',{onRetry:function(){mount()},error:'<div class="hshs-empty"><i class="fas fa-triangle-exclamation"></i><h4>Could not load notifications</h4><button type="button" data-hshs-retry>Retry</button></div>'});
      } else {
        render(tab);
      }
      if(g.HshsPaint&&g.HshsPaint.ready) g.HshsPaint.ready('notifications');
    });
  }
  function boot(){
    function go(){ if(!isPage()) return; if(!g.HshsRender){ setTimeout(go,40); return; } mount(); }
    if(g.HshsApp&&g.HshsApp.whenReady) g.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready',go,{once:true});
    document.addEventListener('hshs:page',function(){ if(isPage()) setTimeout(go,0); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(typeof window!=='undefined'?window:this);
