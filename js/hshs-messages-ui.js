(function (g) {
  'use strict';
  if (g.__hshsMessagesUi) return;
  g.__hshsMessagesUi = true;
  var NOTES=[{add:true,label:'Your note'},{label:'Mercy',img:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=70',on:true},{label:'Class 4A',img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=200&q=70'},{label:'Prefects',img:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=70'},{label:'Teachers',img:'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=70'}];
  var COVER='https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=70';
  var PHOTO='https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=70';
  var INBOX=[
    {name:'Mercy',preview:'You: Can\'t wait to see you tomorrow!',time:'16:12',unread:1,group:false},
    {name:'Class 4A',preview:'Ivan: Maths homework is in the group...',time:'15:48',unread:5,group:true},
    {name:'HSHS Updates',preview:'New photos from Sports Day are now ...',time:'14:30',unread:2,group:true},
    {name:'Besties Forever',preview:'Aisha: That was lit!',time:'13:15',unread:0,group:true},
    {name:'Prefects 2026',preview:'Discipline · Service · Leadership',time:'12:03',unread:0,group:true},
    {name:'Mr. Kato (ICT)',preview:'Remember to submit your project tom...',time:'10:21',unread:0,group:false},
    {name:'Science Group',preview:'You: Here\'s the experiment diagram',time:'09:14',unread:0,group:true},
    {name:'School Gallery Team',preview:'Your photo was featured!',time:'Yesterday',unread:0,group:true},
    {name:'Announcements',preview:'Term One exams begin next month. St...',time:'Yesterday',unread:0,group:true}
  ];
  var SAMPLE=[{mine:false,text:'Heyy',time:'14:02'},{mine:true,text:'Hey! How is the gallery project going?',time:'14:03'},{mine:false,text:'Classes were fine. I am wrapping photos tonight.',time:'14:05'},{mine:true,text:'Same here. Finishing the Sports Day album.',time:'14:07'},{mine:false,text:'Nice. See you at assembly tomorrow.',time:'14:08'},{mine:true,text:'Can\'t wait to share the new shots!',time:'14:10'},{mine:false,image:PHOTO,time:'14:12'},{mine:false,text:'This campus shot is beautiful. HSHS forever!',time:'14:13'},{mine:true,text:'Always!',time:'14:14'}];
  function paintNotes(){ var box=document.getElementById('hshsChatNotes'); if(!box) return; box.innerHTML=NOTES.map(function(n){ if(n.add) return '<button class="msg-note add" type="button"><b>+</b><span>Your note</span></button>'; return '<button class="msg-note" type="button"><b style="background-image:url(\''+n.img+'\')">'+(n.on?'<em></em>':'')+'</b><span>'+n.label+'</span></button>'; }).join(''); }
  function paintCover(){ var el=document.getElementById('hshsThreadCover'); if(el) el.style.backgroundImage='url("'+COVER+'")'; }
  function paintSample(){ var box=document.getElementById('hshsThreadMsgs'); if(!box) return; box.innerHTML='<div class="hshs-date-chip">Today</div>'+SAMPLE.map(function(m){ var media=m.image?'<img class="hshs-bubble-img" src="'+m.image+'" alt="Campus photo">':''; var text=m.text?'<div class="hshs-bubble-text">'+m.text+'</div>':''; return '<div class="hshs-bubble '+(m.mine?'mine':'theirs')+'">'+media+text+'<time>'+m.time+'</time></div>'; }).join(''); box.scrollTop=box.scrollHeight; }
  function openDemo(name){ var page=document.getElementById('hshsChatPage'); if(page) page.classList.add('is-open'); var empty=document.getElementById('hshsChatEmptyMain'); if(empty) empty.hidden=true; var thread=document.getElementById('hshsThread'); if(thread) thread.hidden=false; var nm=document.getElementById('hshsThreadName'); if(nm) nm.textContent=name; var meta=document.getElementById('hshsThreadMeta'); if(meta) meta.textContent='Active now'; paintCover(); paintSample(); }
  function fillInbox(){ var box=document.getElementById('hshsChatList'); if(!box) return; if(box.querySelectorAll('.hshs-contact').length>=6) return; box.innerHTML=INBOX.map(function(c,i){ var initials=c.name.split(/\s+/).map(function(p){return p[0];}).join('').slice(0,2).toUpperCase(); return '<button type="button" class="hshs-contact" data-demo="'+i+'" data-group="'+c.group+'">'+ '<span class="hshs-contact-avatar">'+initials+'</span>'+ '<span class="hshs-contact-body"><strong>'+c.name+'</strong><small>'+c.preview+'</small></span>'+ '<span class="hshs-contact-meta"><span class="time">'+c.time+'</span>'+(c.unread?'<span class="hshs-badge">'+c.unread+'</span>':'')+'</span></button>'; }).join(''); }
  function filterList(kind){ document.querySelectorAll('#hshsChatList .hshs-contact').forEach(function(row){ var unread=!!row.querySelector('.hshs-badge'); var group=row.getAttribute('data-group')==='true'||/class|group|prefect|update|team|announce|science|teacher/i.test(row.textContent||''); var show=kind==='all'||(kind==='unread'&&unread)||(kind==='groups'&&group)||(kind==='requests'&&false); row.style.display=show?'flex':'none'; }); }
  function wire(){ paintNotes(); paintCover(); fillInbox(); var chips=document.getElementById('hshsChatChips'); if(chips&&!chips.dataset.bound){ chips.dataset.bound='1'; chips.addEventListener('click',function(e){ var b=e.target.closest('[data-chip]'); if(!b) return; chips.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on',x===b); }); filterList(b.getAttribute('data-chip')); }); } var list=document.getElementById('hshsChatList'); if(list&&!list.dataset.bound){ list.dataset.bound='1'; list.addEventListener('click',function(e){ var row=e.target.closest('[data-demo]'); if(!row) return; e.preventDefault(); e.stopPropagation(); openDemo(INBOX[Number(row.getAttribute('data-demo'))].name); }); } }
  function boot(){ if(!document.getElementById('hshsChatPage')) return; wire(); setTimeout(wire,300); setTimeout(fillInbox,700); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  document.addEventListener('hshs:page',boot);
  g.HshsMessagesUi={ boot:boot };
})(typeof window!=='undefined'?window:this);
