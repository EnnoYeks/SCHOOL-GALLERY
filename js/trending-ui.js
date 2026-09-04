/* HSHS Trending UI adapter
   Keeps the existing ranking engine intact and presents its real results
   in the approved desktop/mobile layout. */
(function(){
  function runTrendingUI(){
  const grid=document.getElementById('trendingGrid');
  const hero=document.getElementById('topTrendingHero');
  const side=document.getElementById('topTrendingSide');
  const topics=document.getElementById('hotTopics');
  if(!grid||!hero||!side)return;

  const text=(el,sel)=>el.querySelector(sel)?.textContent.trim()||'';
  const media=(card,cls)=>{const src=card.querySelector('.post-media');if(!src)return `<div class="media-fallback ${cls}"><i class="fas fa-image"></i></div>`;if(src.tagName==='VIDEO')return `<video class="${cls}" muted playsinline preload="metadata" poster="${src.getAttribute('poster')||''}"><source src="${src.querySelector('source')?.src||''}"></video>`;return `<img class="${cls}" src="${src.getAttribute('src')||''}" alt="${src.getAttribute('alt')||''}" loading="lazy">`;};
  const stats=(card)=>{const s=text(card,'.stats-row');return `<div class="trend-stats"><span>${s.match(/❤️\s*[\d.,KkMm]+/)?.[0]||'❤️ 0'}</span><span>${s.match(/💬\s*[\d.,KkMm]+/)?.[0]||'💬 0'}</span><span>${s.match(/👁️?\s*[\d.,KkMm]+/)?.[0]||'👁 0'}</span></div>`;};
  const author=(card)=>{const img=card.querySelector('.author-row img');const strong=card.querySelector('.author-row strong');const time=card.querySelector('.author-row span');return `<div class="author-row">${img?`<img src="${img.src}" alt="">`:''}<span>${strong?.textContent||'HSHS Student'}</span>${time?`<small>• ${time.textContent}</small>`:''}</div>`;};

  function build(){
    const cards=[...grid.querySelectorAll('.trending-card')];
    if(cards.length<1)return;
    const first=cards[0], second=cards[1], third=cards[2];
    const title=(c)=>text(c,'.card-content h3');
    const desc=(c)=>text(c,'.card-content p');
    const category=(c)=>text(c,'.category-badge');
    const score=(c)=>text(c,'.stats-row .hot');
    hero.innerHTML=`<article class="hero-trending-card"><div class="hero-media">${media(first,'hero-image')}</div><div class="hero-overlay"></div><div class="rank-badge rank-one">1</div><div class="hero-content"><span class="top-label"><i class="fas fa-bolt"></i> TOP TRENDING</span><h2>${title(first)}</h2><p>${desc(first)}</p>${author(first)}${stats(first)}<span class="score-pill">${score(first)||'🔥 Trending'}</span></div></article>`;
    side.innerHTML=[second,third].filter(Boolean).map((c,i)=>`<article class="mini-trending-card"><div class="mini-media">${media(c,'mini-image')}</div><div class="mini-overlay"></div><div class="rank-badge ${i?'rank-three':'rank-two'}">${i+2}</div><div class="mini-content"><span class="mini-category">${category(c)}</span><h3>${title(c)}</h3>${stats(c)}</div></article>`).join('');
    cards.slice(0,3).forEach(c=>c.remove());
    if(topics){
      const cats=[...new Set(cards.map(category).filter(Boolean))].slice(0,6);
      topics.innerHTML=cats.map(cat=>`<div class="hot-topic"><strong>#${cat.replace(/\s+/g,'')}</strong><span>Trending category</span></div>`).join('');
    }
  }

  const observer=new MutationObserver(()=>{if(grid.querySelector('.trending-card')){observer.disconnect();build();}});
  observer.observe(grid,{childList:true,subtree:true});
  // If cards already present (cached SPA content), build immediately
  if(grid.querySelector('.trending-card')) build();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', runTrendingUI);
  else runTrendingUI();
  document.addEventListener('hshs:page', runTrendingUI);
})();
