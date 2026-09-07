(function(g){
  'use strict';
  if(g.__hshsNotificationsPageModule) return;
  g.__hshsNotificationsPageModule = true;
  var PAGE='notifications';
  function isPage(){
    try{ if(g.HshsRegistry&&g.HshsRegistry.activeRoute) return g.HshsRegistry.activeRoute().name===PAGE; }catch(e){}
    return (location.pathname.split('/').pop()||'').toLowerCase()==='notifications.html';
  }
  function base(){ return location.pathname.indexOf('/index/')!==-1?'../':''; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);}); }
  function rel(ts){ var d=Date.now()-Number(ts||0); if(d<60000)return'Just now'; if(d<3600000)return Math.floor(d/60000)+'m'; if(d<86400000)return Math.floor(d/3600000)+'h'; return Math.floor(d/86400000)+'d'; }
  function icon(type){ return ({friend_request:'fa-user-plus',friend_accept:'fa-user-check',message:'fa-comment-dots',like:'fa-heart',mention:'fa-at',follow:'fa-user-plus',system:'fa-bell',featured:'fa-star',poll:'fa-square-poll-vertical'}[type]||'fa-bell'); }
  function seed(){
    var now=Date.now();
    return [
      {id:'hm1',type:'message',title:'Mercy',message:'See you at assembly tomorrow.',createdAt:now-480000,read:false,href:'chat.html'},
      {id:'hm2',type:'message',title:'Class 4A',message:'Ivan: Maths homework is in the group.',createdAt:now-1800000,read:false,href:'chat.html'},
      {id:'hn1',type:'system',title:'Sports Day photos',message:'New album from the main field is in Gallery.',createdAt:now-3600000,read:false,href:'gallery.html'},
      {id:'hn2',type:'featured',title:'Spotlight pick',message:'A campus moment was featured this week.',createdAt:now-7200000,read:false,href:'spotlight.html'},
      {id:'hn3',type:'mention',title:'Class 4A',message:'Ivan mentioned the maths homework in the group.',createdAt:now-900000,read:false,href:'chat.html'},
      {id:'hn4',type:'poll',title:'House spirit poll',message:'Vote for this term\'s leading house.',createdAt:now-86400000,read:true,href:'polls.html'}
    ];
  }
  function rows(){
    try{
      var s=g.HshsStore;
      var list=s&&s.listNotifications?s.listNotifications(40)||[]:[];
      if(list.length) return list.concat(seed().filter(function(n){ return n.type==='message'; }));
    }catch(e){}
    return seed();
  }
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
    if(isMsg(n)||String(n.type||'')==='mention') return 'chat.html';
    if(n.type==='poll') return 'polls.html';
    if(n.type==='featured') return 'spotlight.html';
    return 'notifications.html';
  }
  function render(tab){
    var list=document.getElementById('hshsNotifList');
    if(!list) return;
    var all=rows().filter(function(n){ return matches(n,tab); });
    var unreadMsgs=rows().filter(function(n){ return isMsg(n)&&!n.read; }).length;
    var badge=document.getElementById('hshsMsgTabCount');
    if(badge){ badge.textContent=String(unreadMsgs); badge.hidden=!unreadMsgs; }
    if(!all.length){
      var extra=tab==='messages'?'<a class="hshs-open-chats" href="'+base()+'index/chat.html">Open chats</a>':'';
      list.innerHTML='<div class="hshs-empty"><i class="fas fa-bell-slash"></i><h4>Nothing here yet</h4>'+extra+'</div>';
      return;
    }
    list.innerHTML=all.map(function(n){
      return '<button type="button" class="hshs-notif-card'+(n.read?'':' unread')+'" data-go="'+esc(dest(n))+'">'+ '<span class="hshs-notif-ico"><i class="fas '+esc(icon(n.type))+'"></i></span>'+ '<span class="hshs-notif-copy"><strong>'+esc(n.title||'Notification')+'</strong><p>'+esc(n.message||'')+'</p><time>'+esc(rel(n.createdAt||Date.now()))+(isMsg(n)?' · Chat':'')+'</time></span>'+ (isMsg(n)?'<span class="hshs-notif-go">Open</span>':'')+ '</button>';
    }).join('');
    if(tab==='messages') list.insertAdjacentHTML('beforeend','<a class="hshs-open-chats" href="'+base()+'index/chat.html">See all chats</a>');
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
      location.href=base()+'index/'+card.getAttribute('data-go').replace(/^.*\//,'');
    });
    render(tab);
  }
  function boot(){
    function go(){ if(!isPage()) return; if(!g.HshsRender){ setTimeout(go,40); return; } mount(); }
    if(g.HshsApp&&g.HshsApp.whenReady) g.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready',go,{once:true});
    document.addEventListener('hshs:page',function(){ if(isPage()) setTimeout(go,0); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(typeof window!=='undefined'?window:this);
