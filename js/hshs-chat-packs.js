(function (g) {
  'use strict';
  if (g.__hshsChatPacks) return;
  g.__hshsChatPacks = true;
  var RECENT_KEY = 'hshsEmojiRecent';
  var PACKS = {
    recent: { label: 'Recent', icon: '🕒', list: [] },
    smile: { label: 'Smileys', icon: '😊', list: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠'] },
    people: { label: 'People', icon: '🙋', list: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','👏','🙌','🫶','🤝','🙏','💪','👀','🧠'] },
    love: { label: 'Love', icon: '❤️', list: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
    animals: { label: 'Animals', icon: '🐻', list: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉'] },
    food: { label: 'Food', icon: '🍔', list: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🍔','🍟','🍕','🌭','🥪','🌮','🍩','🍪','🎂'] },
    activities: { label: 'Activities', icon: '⚽', list: ['⚽','🏀','🏈','⚾','🎾','🏐','🎯','🎮','🎲','🎨','🎬','🎤','🏆','🥇'] },
    objects: { label: 'Objects', icon: '💡', list: ['⌚','📱','💻','📷','💡','📖','📚','✏️','📝','📅','🎓','🏫','🚌'] },
    flags: { label: 'Flags', icon: '🏳️', list: ['🇺🇬','🇰🇪','🇹🇿','🇷🇼','🇿🇦','🇳🇬','🇬🇭','🇺🇸','🇬🇧','🏁','🚩'] },
    school: { label: 'School', icon: '🎓', list: ['🎓','📚','📖','✏️','📝','🏫','🚌','🔬','💻','📅','✅','🔥','⭐','🏆'] }
  };
  var STICKERS = [{id:'hi',send:'👋',label:'Hi'},{id:'fire',send:'🔥',label:'Fire'},{id:'100',send:'💯',label:'100'},{id:'clap',send:'👏',label:'Clap'},{id:'pray',send:'🙏',label:'Pray'},{id:'grad',send:'🎓',label:'Grad'},{id:'books',send:'📚',label:'Books'},{id:'crest',send:'🏛️',label:'Campus'},{id:'win',send:'🏆',label:'Win'},{id:'vibe',send:'⚡',label:'Vibe'},{id:'heart',send:'💙',label:'Heart'},{id:'ok',send:'👌',label:'OK'}];
  var GIFS = [{id:'wave',send:'👋',label:'Wave'},{id:'lol',send:'😂',label:'LOL'},{id:'yes',send:'✅',label:'Yes'},{id:'no',send:'❌',label:'No'},{id:'fire',send:'🔥',label:'Fire'},{id:'party',send:'🎉',label:'Party'}];
  var mode='emoji', tab='smile', query='';
  function recent(){ try { return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]'); } catch(e){ return []; } }
  function remember(ch){ var list=recent().filter(function(x){return x!==ch;}); list.unshift(ch); localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0,24))); }
  function insert(ch){ var input=document.getElementById('hshsThreadInput'); if(!input) return; input.value += ch; input.focus(); remember(ch); input.dispatchEvent(new Event('input',{bubbles:true})); }
  function render(){
    var panel=document.getElementById('hshsEmojiPanel'); if(!panel) return;
    panel.hidden=false; panel.classList.add('open','packs');
    var chips=Object.keys(PACKS).map(function(key){ return '<button type="button" class="pk-chip'+(tab===key&&mode==='emoji'?' on':'')+'" data-tab="'+key+'">'+PACKS[key].label+'</button>'; }).join('');
    var body='';
    if(mode==='stickers') body='<div class="pk-sticker-grid">'+STICKERS.map(function(s){return '<button type="button" class="pk-sticker" data-send="'+s.send+'"><b>'+s.send+'</b><span>'+s.label+'</span></button>';}).join('')+'</div>';
    else if(mode==='gifs') body='<div class="pk-sticker-grid">'+GIFS.map(function(s){return '<button type="button" class="pk-sticker gif" data-send="'+s.send+'"><b>'+s.send+'</b><span>'+s.label+'</span></button>';}).join('')+'</div>';
    else {
      var rec=recent();
      var recBlock=rec.length?'<h4>Recently Used</h4><div class="pk-grid">'+rec.map(function(e){return '<button type="button" class="hshs-emoji" data-emoji="'+e+'">'+e+'</button>';}).join('')+'</div>':'';
      var list=(tab==='recent'?rec:(PACKS[tab]||PACKS.smile).list);
      body=recBlock+'<h4>'+((PACKS[tab]||PACKS.smile).label)+'</h4><div class="pk-grid">'+list.map(function(e){return '<button type="button" class="hshs-emoji" data-emoji="'+e+'">'+e+'</button>';}).join('')+'</div>';
    }
    panel.innerHTML='<div class="pk-head"><div><strong>Emoji</strong><small>Add some emotion 😊</small></div><button type="button" class="pk-close" id="hshsPackClose">×</button></div><div class="pk-search"><i class="fas fa-search"></i><input id="hshsEmojiSearch" placeholder="Search emoji..."></div><div class="pk-modes"><button type="button" data-mode="emoji"'+(mode==='emoji'?' class="on"':'')+'>Emoji</button><button type="button" data-mode="stickers"'+(mode==='stickers'?' class="on"':'')+'>Stickers</button><button type="button" data-mode="gifs"'+(mode==='gifs'?' class="on"':'')+'>GIFs</button></div><div class="pk-chips">'+chips+'</div><div class="pk-body">'+body+'</div><div class="pk-dock"><button type="button" data-dock="abc">ABC</button><button type="button" data-tab="smile">😊</button><button type="button" data-tab="people">👤</button><button type="button" data-tab="animals">🐻</button><button type="button" data-tab="food">🍔</button><button type="button" data-tab="activities">⚽</button><button type="button" data-tab="objects">💡</button><button type="button" data-tab="flags">🚩</button><button type="button" id="hshsEmojiBackspace">⌫</button></div>';
    panel.querySelectorAll('[data-tab]').forEach(function(b){ b.onclick=function(){ mode='emoji'; tab=b.getAttribute('data-tab'); render(); }; });
    panel.querySelectorAll('[data-mode]').forEach(function(b){ b.onclick=function(){ mode=b.getAttribute('data-mode'); render(); }; });
    panel.querySelectorAll('[data-emoji],[data-send]').forEach(function(b){ b.onclick=function(){ insert(b.getAttribute('data-emoji')||b.getAttribute('data-send')); }; });
    var close=document.getElementById('hshsPackClose');
    if(close) close.onclick=function(){ panel.hidden=true; panel.classList.remove('open'); var btn=document.getElementById('hshsEmojiBtn'); if(btn) btn.classList.remove('is-on'); };
    var abc=panel.querySelector('[data-dock="abc"]');
    if(abc) abc.onclick=function(){ if(close) close.click(); var i=document.getElementById('hshsThreadInput'); if(i) i.focus(); };
    var del=document.getElementById('hshsEmojiBackspace');
    if(del) del.onclick=function(){ var input=document.getElementById('hshsThreadInput'); if(!input) return; input.value=input.value.slice(0,-1); input.dispatchEvent(new Event('input',{bubbles:true})); };
  }
  function styleRec(){ var bar=document.getElementById('hshsRecBar'); if(!bar||bar.dataset.wave) return; bar.dataset.wave='1'; var wave=document.createElement('span'); wave.className='pk-wave'; wave.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>'; var dot=bar.querySelector('.hshs-rec-dot'); if(dot&&dot.nextSibling) bar.insertBefore(wave,dot.nextSibling); else bar.appendChild(wave); }
  function hijack(){ styleRec(); var btn=document.getElementById('hshsEmojiBtn'); var panel=document.getElementById('hshsEmojiPanel'); if(!btn||!panel||btn.dataset.packsBound) return; btn.dataset.packsBound='1'; btn.addEventListener('click', function(){ setTimeout(render,0); }); }
  function boot(){ if(!document.getElementById('hshsChatPage')) return; hijack(); setTimeout(hijack,300); }
  document.addEventListener('hshs:page', boot);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  g.HshsChatPacks={ render:render, boot:boot };
})(typeof window!=='undefined'?window:this);
