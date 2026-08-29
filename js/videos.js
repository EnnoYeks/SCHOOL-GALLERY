import { db } from "./db.js";
import { updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firestore } from "./config.js";

class VideosPage {
    constructor() {
        this.videos = [];
        this.filtered = [];
        this.index = 0;
        this.filter = "all";
        this.search = "";
        this.pageSize = 12;
        this.loading = false;
        this.hasMore = true;
        this.init();
    }
    async init() {
        this.bindFilters(); this.bindSearch(); this.bindLoadMore(); this.bindPlayer(); await this.load(false);
    }
    async load(append = false) {
        if (this.loading || (!this.hasMore && append)) return;
        const container = document.getElementById("videosContainer");
        const loadMore = document.getElementById("loadMoreVideos");
        if (!container) return;
        this.loading = true;
        if (!append) container.innerHTML = this.skeletons();
        try {
            const batch = await db.getVideos(this.pageSize, this.videos.length) || [];
            this.videos = append ? [...this.videos, ...batch] : batch;
            this.hasMore = batch.length === this.pageSize;
            this.apply();
        } catch (error) {
            console.error("Videos load failed:", error);
            if (!append) container.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><h3>Unable to load videos</h3><p>${this.escape(error.message || "Please try again.")}</p></div>`;
        } finally {
            this.loading = false;
            if (loadMore) {
                loadMore.hidden = !this.hasMore || !this.filtered.length;
                loadMore.disabled = false;
                loadMore.innerHTML = this.hasMore ? 'Load more <i class="fas fa-arrow-down"></i>' : "You’re all caught up";
            }
        }
    }
    apply() {
        let videos = [...this.videos];
        if (this.filter === "latest") videos.sort((a,b) => this.date(b.createdAt) - this.date(a.createdAt));
        else if (this.filter === "trending") videos.sort((a,b) => this.score(b) - this.score(a));
        else if (this.filter !== "all") videos = videos.filter(v => String(v.category || "").toLowerCase().replace(/\s+/g,"-") === this.filter);
        if (this.search) videos = videos.filter(v => [v.title,v.description,v.category,v.author].join(" ").toLowerCase().includes(this.search));
        this.filtered = videos; this.render();
    }
    render() {
        const container = document.getElementById("videosContainer"), hero = document.getElementById("featuredVideo"), count = document.getElementById("videoCount"), title = document.getElementById("videoSectionTitle"), section = document.getElementById("featuredVideoSection");
        if (!container) return;
        if (!this.filtered.length) {
            if (hero) hero.innerHTML = "";
            if (section) section.hidden = true;
            container.innerHTML = `<div class="empty-state"><i class="fas fa-video"></i><h3>No videos found</h3><p>${this.search ? "Try a different search or filter." : "Upload the first HSHS video!"}</p></div>`;
            if (count) count.textContent = "0 videos";
            return;
        }
        if (section) section.hidden = false;
        const featuredIndex = this.findFeaturedIndex(), featured = this.filtered[featuredIndex];
        const library = this.filtered.filter((_,i) => i !== featuredIndex);
        if (hero) hero.innerHTML = this.card(featured,true,featuredIndex);
        container.innerHTML = library.length ? library.map(video => this.card(video,false,this.filtered.indexOf(video))).join("") : `<div class="library-empty">The featured video is currently the only video in this view.</div>`;
        if (count) count.textContent = `${this.filtered.length} video${this.filtered.length === 1 ? "" : "s"}`;
        if (title) title.textContent = this.filter === "trending" ? "Trending Videos" : this.filter === "latest" ? "Latest Videos" : this.filter === "all" ? "Video Library" : `${this.label(this.filter)} Videos`;
        document.querySelectorAll("[data-video-index]").forEach(el => {
            el.onclick = () => this.play(Number(el.dataset.videoIndex));
            el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.play(Number(el.dataset.videoIndex)); } };
        });
    }
    findFeaturedIndex() {
        const explicit = this.filtered.findIndex(v => v.featured === true);
        if (explicit >= 0) return explicit;
        return this.filtered.reduce((best,v,i,arr) => this.score(v) > this.score(arr[best]) ? i : best,0);
    }
    card(v,featured,index) {
        const title=this.escape(v.title||"Untitled video"), description=this.escape(v.description||""), thumbnail=this.attr(v.thumbnailUrl||""), duration=this.escape(v.duration||""), author=this.escape(v.author||"HSHS Student");
        return `<article class="${featured?"featured-video":"video-card"}" data-video-index="${index}" tabindex="0" role="button" aria-label="Play ${title}"><div class="video-thumbnail">${thumbnail?`<img src="${thumbnail}" alt="${title}" class="thumbnail-image" loading="${featured?"eager":"lazy"}>`:`<div class="thumbnail-fallback"><i class="fas fa-video"></i></div>`}${featured?`<span class="featured-badge"><i class="fas fa-star"></i> FEATURED</span><span class="featured-play"><i class="fas fa-play"></i></span>`:`<span class="play-button-overlay"><i class="fas fa-play"></i></span>`}${duration?`<span class="video-duration">${duration}</span>`:""}</div><div class="video-info"><div class="video-title">${title}</div>${description?`<div class="video-description">${description}</div>`:""}<div class="video-metadata"><span>${author}</span><span>${this.formatDate(v.createdAt)}</span></div><div class="video-stats"><span class="stat-item"><i class="fas fa-eye"></i>${this.num(v.views)}</span><span class="stat-item"><i class="fas fa-heart"></i>${this.num(v.likes)}</span><span class="stat-item"><i class="fas fa-comment"></i>${this.num(v.comments)}</span></div></div></article>`;
    }
    skeletons(){return Array.from({length:6},()=>'<div class="video-skeleton"></div>').join("");}
    bindFilters(){document.querySelectorAll(".video-tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".video-tab").forEach(x=>x.classList.remove("active"));tab.classList.add("active");this.filter=tab.dataset.filter||"all";this.apply();}));}
    bindSearch(){document.getElementById("searchInput")?.addEventListener("input",e=>{this.search=e.target.value.toLowerCase().trim();this.apply();});}
    bindLoadMore(){document.getElementById("loadMoreVideos")?.addEventListener("click",()=>this.load(true));}
    bindPlayer(){
        const modal=document.getElementById("videoPlayerModal"), player=document.getElementById("videoPlayer");
        const close=()=>{player?.pause();if(player)player.removeAttribute("src");modal?.classList.remove("active");};
        document.getElementById("playerClose")?.addEventListener("click",close);
        modal?.addEventListener("click",e=>{if(e.target===modal)close();});
        document.getElementById("playPauseBtn")?.addEventListener("click",()=>{if(player)player.paused?player.play().catch(()=>{}):player.pause();});
        document.getElementById("fullscreenBtn")?.addEventListener("click",()=>player?.requestFullscreen?.());
        document.getElementById("prevVideo")?.addEventListener("click",()=>this.play(this.index-1));
        document.getElementById("nextVideo")?.addEventListener("click",()=>this.play(this.index+1));
        player?.addEventListener("play",()=>{const b=document.getElementById("playPauseBtn");if(b)b.innerHTML='<i class="fas fa-pause"></i>';});
        player?.addEventListener("pause",()=>{const b=document.getElementById("playPauseBtn");if(b)b.innerHTML='<i class="fas fa-play"></i>';});
        document.addEventListener("keydown",e=>{if(!modal?.classList.contains("active"))return;if(e.key==="Escape")close();if(e.key==="ArrowLeft")this.play(this.index-1);if(e.key==="ArrowRight")this.play(this.index+1);});
    }
    play(index){
        if(index<0||index>=this.filtered.length)return;
        const video=this.filtered[index],player=document.getElementById("videoPlayer"),modal=document.getElementById("videoPlayerModal");
        if(!player||!modal||!video?.videoUrl)return;
        this.index=index;player.src=video.videoUrl;player.poster=video.thumbnailUrl||"";modal.classList.add("active");player.play().catch(()=>{});this.updateViews(video);
    }
    async updateViews(video){try{await updateDoc(doc(firestore,"videos",video.id),{views:increment(1)});video.views=(+video.views||0)+1;}catch(error){console.error("Could not update views:",error);}}
    score(v){const likes=+v.likes||0,comments=+v.comments||0,shares=+v.shares||0,views=+v.views||0;return ((likes+comments+shares)*4)+(likes*2)+views;}
    date(v){if(!v)return 0;if(typeof v.toMillis==="function")return v.toMillis();if(v.seconds)return v.seconds*1000;const n=new Date(v).getTime();return Number.isFinite(n)?n:0;}
    formatDate(v){const n=this.date(v);return n?new Intl.DateTimeFormat("en",{month:"short",day:"numeric",year:"numeric"}).format(new Date(n)):"Recently";}
    num(v){return new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1}).format(+v||0);}
    label(v){return String(v||"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());}
    escape(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
    attr(v){return this.escape(v);}
}

document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("videosContainer"))new VideosPage();});
export { VideosPage };
