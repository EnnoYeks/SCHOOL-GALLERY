(function (g) {
  'use strict';
  if (g.__hshsProfilePageModule) return;
  g.__hshsProfilePageModule = true;
  var PAGE='profile', tab='grid';
  var LOOK={
    cover:'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=70',
    avatar:'https://images.unsplash.com/photo-1531384441138-2736e62e0340?auto=format&fit=crop&w=400&q=70',
    pack:[
      {title:'Together',image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=70',likes:1200,type:'photo'},
      {title:'Campus',image:'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=70',likes:856,type:'photo'},
      {title:'Field',image:'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=700&q=70',likes:1500,type:'video'},
      {title:'Class',image:'https://images.unsplash.com/photo-14565130808-0ec1eeada4d3?auto=format&fit=crop&w=700&q=70',likes:412,type:'photo'},
      {title:'Studio',image:'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=70',likes:980,type:'photo'},
      {title:'Lab',image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=70',likes:610,type:'photo'}
    ]
  };
  function isPage(){ try{ if(g.HshsRegistry&&HshsRegistry.activeRoute) return HshsRegistry.activeRoute().name===PAGE; }catch(e){} return (location.pathname.split('/').pop()||'').toLowerCase()==='profile.html'; }
  function base(){ return location.pathname.indexOf('/index/')!==-1?'../':''; }
  function store(){ return g.HshsStore||null; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c];}); }
  function abbr(n){ n=Number(n)||0; if(n>=1000) return (n/1000).toFixed(n%1000===0?0:1).replace('.0','')+'K'; return String(n); }
  function mediaOf(p){ return p.imageUrl||p.thumbnailUrl||p.image||p.cover||''; }
  function videoOf(p){ return p.videoUrl||p.video_url||''; }
  function isVideo(p){ return String(p.type||'').toLowerCase().indexOf('video')!==-1||!!videoOf(p); }
  function loadCss(){ if(document.querySelector('link[data-hshs-profile-css]')) return; var l=document.createElement('link'); l.rel='stylesheet'; l.href=base()+'css/hshs-profile.css?v=260907own1'; l.setAttribute('data-hshs-profile-css','1'); document.head.appendChild(l); }
  function me(){ try{ return store()&&store().currentUser?store().currentUser():null; }catch(e){ return null; } }
  function viewedUser(){ var q=new URLSearchParams(location.search).get('u'); if(q&&store()&&store().getUserByUsername){ var found=store().getUserByUsername(q); if(found) return found; } return me()||{ id:'showcase', name:'Enno Yeks', username:'ennoyeks', role:'Student', classYear:'HSHS', bio:'Capturing moments, creating memories', avatar:LOOK.avatar }; }
  function isOwn(u){ var self=me(); if(u&&u.id==='showcase'&&!self) return true; return !!(self&&u&&self.id===u.id); }
  function userPosts(u){ var list=[]; if(u&&u.id&&u.id!=='showcase'){ try{ if(store()&&store().postsByUser) list=store().postsByUser(u.id)||[]; }catch(e){} } list=list.filter(function(p){ return mediaOf(p)||videoOf(p); }); if(!list.length) list=LOOK.pack.map(function(p,i){ return { id:'look-'+i, title:p.title, image:p.image, imageUrl:p.image, likes:p.likes, type:p.type }; }); return list; }
  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v==null?'':v; }
  function paintTools(u,own){ var box=document.getElementById('pfTools'); if(!box) return; if(own){ box.innerHTML='<button class="pf-btn" type="button" data-pf="edit">Edit profile</button>'; return; } box.innerHTML='<button class="pf-btn" type="button" data-pf="follow">Follow</button><button class="pf-btn" type="button" data-pf="message">Message</button>'; }
  function paintTags(u){ var box=document.getElementById('pfTags'); if(!box) return; var bits=[]; if(u&&u.role) bits.push(u.role); if(u&&u.classYear) bits.push(u.classYear); box.innerHTML=bits.map(function(x){ return '<span>'+esc(x)+'</span>'; }).join(''); }
  function paintHighs(){ var box=document.getElementById('pfHighs'); if(!box) return; var items=[{add:true,label:'New'},{label:'Sports'},{label:'Events'},{label:'Class'},{label:'Studio'}]; box.innerHTML=items.map(function(h){ return '<button class="pf-hl" type="button"'+(h.add?' data-pf="create"':'')+'><b>'+(h.add?'+':h.label.charAt(0))+'</b><span>'+h.label+'</span></button>'; }).join(''); }
  function paintGrid(posts){ var grid=document.getElementById('pfGrid'); if(!grid) return; var list=posts.slice(); if(tab==='reels') list=list.filter(isVideo); if(tab==='tagged'||tab==='saved') list=[]; if(!list.length){ grid.innerHTML='<div class="pf-empty">Nothing here yet</div>'; grid._posts=[]; return; } grid.innerHTML=list.map(function(p,i){ return '<button class="pf-cell" type="button" data-open="'+i+'"><img src="'+esc(mediaOf(p))+'" alt="'+esc(p.title||'Post')+'" loading="lazy">'+(isVideo(p)?'<i class="fas fa-play mark"></i>':'')+'<span class="likes">'+abbr(p.likes||0)+'</span></button>'; }).join(''); grid._posts=list; }
  function openModal(post){ var box=document.getElementById('pfModal'), stage=document.getElementById('pfModalStage'), cap=document.getElementById('pfModalCap'); if(!box||!post) return; box.hidden=false; stage.innerHTML='<img src="'+esc(mediaOf(post))+'" alt="">'; cap.textContent=post.title||''; }
  function paint(){ var u=viewedUser(); var own=isOwn(u); var posts=userPosts(u); var counts={followers:0,following:0}; try{ if(u&&store()&&store().followCounts) counts=store().followCounts(u.id)||counts; }catch(e){} var cover=document.getElementById('pfCover'); if(cover) cover.style.backgroundImage='url("'+LOOK.cover+'")'; setTxt('pfUser', u.username||'profile'); setTxt('pfName', u.name||''); setTxt('pfRole', (u.role||'Student')+(u.classYear?(' | '+u.classYear):'')); setTxt('pfBio', u.bio||''); setTxt('pfPosts', abbr(posts.length)); setTxt('pfFollowers', abbr(counts.followers||0)); setTxt('pfFollowing', abbr(counts.following||0)); var img=document.getElementById('pfAvaImg'); if(img){ img.onerror=function(){ img.style.display='none'; }; var photo=u.avatar||u.photoURL||LOOK.avatar; if(photo) img.src=photo; else img.removeAttribute('src'); } var fall=document.getElementById('pfAvaFall'); if(fall) fall.textContent=String(u.name||u.username||'?').charAt(0).toUpperCase(); paintTools(u,own); paintTags(u); paintHighs(); document.querySelectorAll('.pf-tabs button').forEach(function(b){ b.classList.toggle('on', b.dataset.tab===tab); }); paintGrid(posts); }
  function bind(){ if(g.__hshsProfileEvents) return; g.__hshsProfileEvents=true;
    document.addEventListener('click',function(e){ if(!isPage()) return; var pop=document.getElementById('pfPop'); var t=e.target.closest('[data-pf],[data-tab],[data-open]'); if(!t){ if(pop) pop.hidden=true; return; } if(t.dataset.open!=null){ openModal((document.getElementById('pfGrid')._posts||[])[Number(t.dataset.open)]); return; } if(t.dataset.tab){ tab=t.dataset.tab; paint(); return; } var act=t.dataset.pf; var u=viewedUser();
      if(act==='create'&&g.__hshsOpenUpload) g.__hshsOpenUpload();
      if(act==='settings') location.href=base()+'index/settings.html';
      if(act==='message') location.href=base()+'index/chat.html';
      if(act==='edit'){ document.getElementById('pfEditName').value=u.name||''; document.getElementById('pfEditUser').value=u.username||''; document.getElementById('pfEditBio').value=u.bio||''; document.getElementById('pfEdit').hidden=false; }
      if(act==='close-edit') document.getElementById('pfEdit').hidden=true;
      if(act==='save-edit'){ if(store()&&store().updateProfile&&me()) store().updateProfile({ name:document.getElementById('pfEditName').value.trim(), username:document.getElementById('pfEditUser').value.trim(), bio:document.getElementById('pfEditBio').value.trim() }); document.getElementById('pfEdit').hidden=true; paint(); }
      if(act==='close-modal'){ document.getElementById('pfModal').hidden=true; document.getElementById('pfModalStage').innerHTML=''; }
    });
  }
  function mount(){ if(!isPage()||!g.HshsRender||!g.HshsTemplates||!g.HshsTemplates.profile) return; if(g.HshsShell) try{ g.HshsShell.ensureShell(); }catch(e){} var root=document.getElementById('hshs-page'); if(!root){ root=document.createElement('div'); root.id='hshs-page'; document.body.appendChild(root); } loadCss(); g.HshsRender.mountHTML(root,g.HshsTemplates.profile); document.documentElement.setAttribute('data-hshs-page',PAGE); bind(); paint(); }
  function boot(){ var go=function(){ if(!isPage()) return; if(!g.HshsRender){ setTimeout(go,40); return; } mount(); }; if(g.HshsApp&&g.HshsApp.whenReady) g.HshsApp.whenReady(go); else document.addEventListener('hshs:foundation-ready',go,{once:true}); document.addEventListener('hshs:page',function(){ if(isPage()) setTimeout(go,0); }); }
  g.HshsProfile={ mount:mount };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(typeof window!=='undefined'?window:this);
