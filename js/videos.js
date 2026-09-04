import { db } from "./db.js";
import { updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firestore } from "./config.js";

const DEMO = [
    { id: "d1", title: "HSHS Sports Day 2024", category: "sports", featured: true, views: 2400, likes: 180, comments: 24, duration: "04:35", createdAt: Date.now() - 86400000 * 2, thumbnailUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&q=70", author: "Sports Club" },
    { id: "d2", title: "Science Fair Highlights", category: "academics", featured: true, views: 1800, likes: 96, comments: 12, duration: "03:12", createdAt: Date.now() - 86400000 * 5, thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=70", author: "Science Club" },
    { id: "d3", title: "Inter-House Football Finals", category: "sports", views: 1200, likes: 88, comments: 19, duration: "02:45", createdAt: Date.now() - 86400000, thumbnailUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=70", author: "Football" },
    { id: "d4", title: "Morning Assembly Highlights", category: "events", views: 980, likes: 64, comments: 8, duration: "03:10", createdAt: Date.now() - 86400000 * 2, thumbnailUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=70", author: "Prefects" },
    { id: "d5", title: "Graduation Ceremony 2024", category: "events", views: 2600, likes: 210, comments: 41, duration: "04:18", createdAt: Date.now() - 86400000 * 3, thumbnailUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=70", author: "School" },
    { id: "d6", title: "Robotics Club Showcase", category: "academics", views: 1100, likes: 73, comments: 11, duration: "03:32", createdAt: Date.now() - 86400000 * 4, thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70", author: "Robotics" },
    { id: "d7", title: "Art & Creativity Workshop", category: "events", views: 870, likes: 51, comments: 7, duration: "02:28", createdAt: Date.now() - 86400000 * 5, thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=70", author: "Art Club" }
];

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
        this.bindFilters(); this.bindSearch(); this.bindLoadMore(); this.bindPlayer();
        document.getElementById("uploadVideoBtn")?.addEventListener("click", () => {
            window.location.href = "photos.html";
        });
        await this.load(false);
    }
    async load(append = false) {
        if (this.loading || (!this.hasMore && append)) return;
        const container = document.getElementById("videosContainer");
        if (!container) return;
        this.loading = true;
        if (!append) container.innerHTML = this.skeletons();
        try {
            const batch = await db.getVideos(this.pageSize, this.videos.length) || [];
            this.videos = append ? [...this.videos, ...batch] : batch;
            if (!this.videos.length) this.videos = DEMO;
            this.hasMore = batch.length === this.pageSize;
            this.apply();
        } catch (error) {
            console.error("Videos load failed:", error);
            this.videos = DEMO;
            this.hasMore = false;
            this.apply();
        } finally {
            this.loading = false;
            const loadMore = document.getElementById("loadMoreVideos");
            if (loadMore) {
                loadMore.hidden = !this.hasMore || !this.filtered.length;
                loadMore.disabled = false;
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
        const container = document.getElementById("videosContainer");
        const hero = document.getElementById("featuredVideo");
        const title = document.getElementById("videoSectionTitle");
        const section = document.getElementById("featuredVideoSection");
        if (!container) return;
        if (!this.filtered.length) {
            if (hero) hero.innerHTML = "";
            if (section) section.hidden = true;
            container.innerHTML = `<div class="empty-state"><i class="fas fa-video"></i><h3>No videos found</h3><p>Try another filter.</p></div>`;
            return;
        }
        if (section) section.hidden = false;
        const featured = this.filtered.filter(v => v.featured).slice(0, 2);
        const featuredIds = new Set(featured.map(v => v.id));
        const rest = this.filtered.filter(v => !featuredIds.has(v.id));
        const featureCards = (featured.length ? featured : this.filtered.slice(0, 2));
        const list = featured.length ? rest : this.filtered.slice(2);
        if (hero) hero.innerHTML = featureCards.map((v, i) => this.featCard(v, this.filtered.indexOf(v), i === 0)).join("");
        container.innerHTML = list.map(v => this.rowCard(v, this.filtered.indexOf(v))).join("");
        if (title) title.textContent = this.filter === "trending" ? "Trending Videos" : this.filter === "latest" ? "Latest Videos" : this.filter === "all" ? "Latest Videos" : this.label(this.filter) + " Videos";
        document.querySelectorAll("[data-video-index]").forEach(el => {
            el.onclick = () => this.play(Number(el.dataset.videoIndex));
        });
    }
    featCard(v, index, first) {
        const title = this.escape(v.title || "Untitled");
        const thumb = this.attr(v.thumbnailUrl || "");
        const dur = this.escape(v.duration || "");
        return `<article class="vibe-feat" data-video-index="${index}">
            ${thumb ? `<img src="${thumb}" alt="${title}">` : `<div class="thumb-fallback"><i class="fas fa-play"></i></div>`}
            ${first ? `<span class="badge">FEATURED</span>` : ""}
            <span class="play"><i class="fas fa-play"></i></span>
            ${dur ? `<span class="dur">${dur}</span>` : ""}
            <div class="meta"><b>${title}</b><small>${this.num(v.views)} views • ${this.ago(v.createdAt)}</small></div>
        </article>`;
    }
    rowCard(v, index) {
        const title = this.escape(v.title || "Untitled");
        const thumb = this.attr(v.thumbnailUrl || "");
        const dur = this.escape(v.duration || "");
        return `<article class="vibe-row" data-video-index="${index}">
            <div class="shot">
                ${thumb ? `<img src="${thumb}" alt="${title}">` : `<div class="thumb-fallback"><i class="fas fa-play"></i></div>`}
                <span class="play"><i class="fas fa-play"></i></span>
                ${dur ? `<span class="dur">${dur}</span>` : ""}
            </div>
            <div class="copy"><b>${title}</b><small>${this.num(v.views)} views • ${this.ago(v.createdAt)}</small></div>
            <button class="more" type="button" aria-label="More">⋮</button>
        </article>`;
    }
    skeletons(){return "<div class=\"video-skeleton\"></div><div class=\"video-skeleton\"></div><div class=\"video-skeleton\"></div>";}
    bindFilters(){
        document.querySelectorAll(".video-tab").forEach(tab => tab.addEventListener("click", () => {
            document.querySelectorAll(".video-tab").forEach(x => x.classList.remove("active"));
            tab.classList.add("active");
            this.filter = tab.dataset.filter || "all";
            this.apply();
        }));
        document.querySelectorAll("[data-filter-jump]").forEach(btn => btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-filter-jump");
            const tab = document.querySelector('.video-tab[data-filter="' + name + '"]');
            tab?.click();
        }));
    }
    bindSearch(){document.getElementById("searchInput")?.addEventListener("input", e => { this.search = e.target.value.toLowerCase().trim(); this.apply(); });}
    bindLoadMore(){document.getElementById("loadMoreVideos")?.addEventListener("click", () => this.load(true));}
    bindPlayer(){
        const modal = document.getElementById("videoPlayerModal"), player = document.getElementById("videoPlayer");
        const close = () => { player?.pause(); if (player) player.removeAttribute("src"); modal?.classList.remove("active"); };
        document.getElementById("playerClose")?.addEventListener("click", close);
        modal?.addEventListener("click", e => { if (e.target === modal) close(); });
        document.getElementById("playPauseBtn")?.addEventListener("click", () => { if (player) player.paused ? player.play().catch(()=>{}) : player.pause(); });
        document.getElementById("fullscreenBtn")?.addEventListener("click", () => player?.requestFullscreen?.());
        document.getElementById("prevVideo")?.addEventListener("click", () => this.play(this.index - 1));
        document.getElementById("nextVideo")?.addEventListener("click", () => this.play(this.index + 1));
    }
    play(index){
        if (index < 0 || index >= this.filtered.length) return;
        const video = this.filtered[index], player = document.getElementById("videoPlayer"), modal = document.getElementById("videoPlayerModal");
        if (!player || !modal) return;
        this.index = index;
        if (!video.videoUrl) return;
        player.src = video.videoUrl;
        player.poster = video.thumbnailUrl || "";
        modal.classList.add("active");
        player.play().catch(()=>{});
        this.updateViews(video);
    }
    async updateViews(video){
        if (!video?.id || String(video.id).startsWith("d")) return;
        try { await updateDoc(doc(firestore, "videos", video.id), { views: increment(1) }); video.views = (+video.views || 0) + 1; } catch (e) {}
    }
    score(v){ return ((+v.likes||0)+(+v.comments||0))*4 + (+v.views||0); }
    date(v){ if (!v) return 0; if (typeof v.toMillis === "function") return v.toMillis(); if (v.seconds) return v.seconds * 1000; const n = new Date(v).getTime(); return Number.isFinite(n) ? n : 0; }
    ago(v){
        const n = this.date(v); if (!n) return "recently";
        const d = Math.max(1, Math.round((Date.now() - n) / 86400000));
        return d + " day" + (d === 1 ? "" : "s") + " ago";
    }
    num(v){ return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(+v || 0); }
    label(v){ return String(v || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
    escape(v){ return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c])); }
    attr(v){ return this.escape(v); }
    destroy() {
        try {
            const player = document.getElementById("videoPlayer");
            const modal = document.getElementById("videoPlayerModal");
            if (player) { player.pause(); player.removeAttribute("src"); }
            if (modal) modal.classList.remove("active");
        } catch (e) {}
    }
}

function startVideos() {
    if (!document.getElementById("videosContainer")) return;
    try {
        if (window.__hshsVideosPage && typeof window.__hshsVideosPage.destroy === "function") {
            window.__hshsVideosPage.destroy();
        }
    } catch (e) {}
    window.__hshsVideosPage = new VideosPage();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startVideos);
else startVideos();
document.addEventListener("hshs:page", startVideos);
window.startVideos = startVideos;
export { VideosPage };
