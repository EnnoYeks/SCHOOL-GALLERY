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
        this.bindFilters();
        this.bindSearch();
        this.bindLoadMore();
        this.bindPlayer();
        document.getElementById("uploadVideoBtn")?.addEventListener("click", () => {
            const target = document.querySelector('[data-route="admin"]') || document.querySelector('a[href*="admin"]');
            if (target) target.click();
            else window.location.href = "admin.html";
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
            this.hasMore = batch.length === this.pageSize;
            this.apply();
        } catch (error) {
            console.error("Videos load failed:", error);
            this.videos = append ? this.videos : [];
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
        this.filtered = videos;
        this.render();
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
            container.innerHTML = `<div class="library-empty"><i class="fas fa-video"></i><h3>No videos yet</h3><p>School videos will appear here when they are uploaded.</p></div>`;
            if (title) title.textContent = this.filter === "all" ? "Latest Videos" : this.label(this.filter) + " Videos";
            return;
        }
        if (section) section.hidden = false;
        const featured = this.filtered.filter(v => v.featured).slice(0, 2);
        const featuredIds = new Set(featured.map(v => v.id));
        const rest = this.filtered.filter(v => !featuredIds.has(v.id));
        const featureCards = featured.length ? featured : this.filtered.slice(0, 2);
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
        const thumb = this.attr(v.thumbnailUrl || v.thumbnail || "");
        const dur = this.escape(v.duration || "");
        return `<article class="vibe-feat" data-video-index="${index}">
            ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy">` : `<div class="thumb-fallback"><i class="fas fa-play"></i></div>`}
            ${first ? `<span class="badge">FEATURED</span>` : ""}
            <span class="play"><i class="fas fa-play"></i></span>
            ${dur ? `<span class="dur">${dur}</span>` : ""}
            <div class="meta"><b>${title}</b><small>${this.num(v.views)} views • ${this.ago(v.createdAt)}</small></div>
        </article>`;
    }
    rowCard(v, index) {
        const title = this.escape(v.title || "Untitled");
        const thumb = this.attr(v.thumbnailUrl || v.thumbnail || "");
        const dur = this.escape(v.duration || "");
        return `<article class="vibe-row" data-video-index="${index}">
            <div class="shot">
                ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy">` : `<div class="thumb-fallback"><i class="fas fa-play"></i></div>`}
                <span class="play"><i class="fas fa-play"></i></span>
                ${dur ? `<span class="dur">${dur}</span>` : ""}
            </div>
            <div class="copy"><b>${title}</b><small>${this.num(v.views)} views • ${this.ago(v.createdAt)}</small></div>
            <button class="more" type="button" aria-label="More">⋮</button>
        </article>`;
    }
    skeletons(){return "<article class=\"vibe-skel-row\"><div class=\"frame vibe-shine\"></div><div class=\"lines\"><div class=\"line vibe-shine\"></div><div class=\"line short vibe-shine\"></div></div></article>".repeat(5);}
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
        const current = document.getElementById("currentTime"), duration = document.getElementById("durationTime"), fill = document.getElementById("progressFill"), progress = document.getElementById("progressBar");
        const close = () => { player?.pause(); if (player) { player.removeAttribute("src"); player.load(); } modal?.classList.remove("active"); };
        document.getElementById("playerClose")?.addEventListener("click", close);
        modal?.addEventListener("click", e => { if (e.target === modal) close(); });
        document.getElementById("playPauseBtn")?.addEventListener("click", () => { if (player) player.paused ? player.play().catch(()=>{}) : player.pause(); });
        document.getElementById("fullscreenBtn")?.addEventListener("click", () => player?.requestFullscreen?.());
        player?.addEventListener("loadedmetadata", () => { if (duration) duration.textContent = this.time(player.duration); });
        player?.addEventListener("timeupdate", () => { if (current) current.textContent = this.time(player.currentTime); if (fill && player.duration) fill.style.width = ((player.currentTime / player.duration) * 100) + "%"; });
        progress?.addEventListener("click", e => { if (!player?.duration) return; const r = progress.getBoundingClientRect(); player.currentTime = ((e.clientX - r.left) / r.width) * player.duration; });
        player?.addEventListener("play", () => { const i = document.querySelector("#playPauseBtn i"); if (i) i.className = "fas fa-pause"; });
        player?.addEventListener("pause", () => { const i = document.querySelector("#playPauseBtn i"); if (i) i.className = "fas fa-play"; });
        document.getElementById("prevVideo")?.addEventListener("click", () => this.play(this.index - 1));
        document.getElementById("nextVideo")?.addEventListener("click", () => this.play(this.index + 1));
    }
    play(index){
        if (index < 0 || index >= this.filtered.length) return;
        const video = this.filtered[index], player = document.getElementById("videoPlayer"), modal = document.getElementById("videoPlayerModal");
        if (!player || !modal || !video.videoUrl) return;
        this.index = index;
        player.src = video.videoUrl;
        player.poster = video.thumbnailUrl || video.thumbnail || "";
        modal.classList.add("active");
        player.play().catch(()=>{});
        this.updateViews(video);
    }
    async updateViews(video){
        if (!video?.id) return;
        try { await updateDoc(doc(firestore, "videos", video.id), { views: increment(1) }); video.views = (+video.views || 0) + 1; } catch (e) {}
    }
    score(v){ return ((+v.likes||0)+(+v.comments||0))*4 + (+v.views||0); }
    date(v){ if (!v) return 0; if (typeof v.toMillis === "function") return v.toMillis(); if (v.seconds) return v.seconds * 1000; const n = new Date(v).getTime(); return Number.isFinite(n) ? n : 0; }
    ago(v){ const n = this.date(v); if (!n) return "recently"; const d = Math.max(1, Math.round((Date.now() - n) / 86400000)); return d + " day" + (d === 1 ? "" : "s") + " ago"; }
    time(v){ if (!Number.isFinite(v)) return "0:00"; const s = Math.max(0, Math.floor(v)); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); }
    num(v){ return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(+v || 0); }
    label(v){ return String(v || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
    escape(v){ return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    attr(v){ return this.escape(v); }
    destroy(){ try { const player = document.getElementById("videoPlayer"); const modal = document.getElementById("videoPlayerModal"); if (player) { player.pause(); player.removeAttribute("src"); player.load(); } if (modal) modal.classList.remove("active"); } catch (e) {} }
}

function startVideos() {
    if (!document.getElementById("videosContainer")) return;
    try { if (window.__hshsVideosPage && typeof window.__hshsVideosPage.destroy === "function") window.__hshsVideosPage.destroy(); } catch (e) {}
    window.__hshsVideosPage = new VideosPage();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startVideos);
else startVideos();
document.addEventListener("hshs:page", startVideos);
window.startVideos = startVideos;
export { VideosPage };
