// ============================================
// HSHS WORLD — DATABASE LAYER
// Supabase (posts, photos, videos, events)
// Firebase Auth + Cloudflare R2 stay as-is
// ============================================

import { supabase, auth } from "./config.js";

class Database {
    constructor() {
        console.log("[HSHS] Supabase database initialized");
    }

    async getCurrentUserId() {
        if (auth?.currentUser) return auth.currentUser.uid;
        let id = localStorage.getItem("guestId");
        if (!id) {
            id = "guest-" + Math.random().toString(36).substring(2);
            localStorage.setItem("guestId", id);
        }
        return id;
    }

    async getAuthorMeta() {
        const uid = await this.getCurrentUserId();
        let name = "Campus student";
        try {
            if (window.HshsStore && typeof window.HshsStore.currentUser === "function") {
                const u = window.HshsStore.currentUser();
                if (u && u.name) name = u.name;
            }
        } catch (e) {}
        return { authorId: uid, author: name };
    }

    normalizeItem(item) {
        if (!item) return item;
        return {
            ...item,
            likes: item.likes ?? 0,
            views: item.views ?? 0,
            comments: item.comments ?? 0,
            shares: item.shares ?? 0,
            image: item.image || item.image_url || item.thumbnail_url || "",
            imageUrl: item.image_url || item.image || "",
            thumbnailUrl: item.thumbnail_url || item.image_url || item.image || "",
            authorId: item.author_id || item.authorId,
            mediaKey: item.media_key || item.mediaKey,
            mediaProvider: item.media_provider || item.mediaProvider,
            featuredAt: item.featured_at || item.featuredAt
        };
    }

    async queryTable(table, limitValue = 10, offset = 0, extra = {}) {
        try {
            let q = supabase
                .from(table)
                .select("*")
                .order("created_at", { ascending: false })
                .range(offset, offset + limitValue - 1);
            if (table === "posts") q = q.eq("status", "published");
            if (extra.eq) Object.entries(extra.eq).forEach(([k, v]) => q = q.eq(k, v));
            const { data, error } = await q;
            if (error) throw error;
            return (data || []).map(row => this.normalizeItem(row));
        } catch (error) {
            console.error("Supabase query error:", error);
            return [];
        }
    }

    async getPosts(limitCount = 10, offset = 0) {
        return this.queryTable("posts", limitCount, offset);
    }
    async getPhotos(limitCount = 20, offset = 0) {
        return this.queryTable("photos", limitCount, offset);
    }
    async getVideos(limitCount = 12, offset = 0) {
        return this.queryTable("videos", limitCount, offset);
    }

    async getFeatured(limitCount = 4) {
        try {
            const tables = ["posts", "photos", "videos"];
            const results = await Promise.all(tables.map(async (table) => {
                let q = supabase
                    .from(table)
                    .select("*")
                    .eq("featured", true)
                    .order("featured_at", { ascending: false })
                    .limit(limitCount);
                if (table === "posts") q = q.eq("status", "published");
                const { data } = await q;
                return (data || []).map(row => this.normalizeItem({ ...row, type: table === "videos" ? "video" : (row.type || "photo") }));
            }));
            const all = results.flat();
            all.sort((a, b) => {
                const at = a.featuredAt ? new Date(a.featuredAt).getTime() : 0;
                const bt = b.featuredAt ? new Date(b.featuredAt).getTime() : 0;
                return bt - at;
            });
            return all.slice(0, limitCount);
        } catch (e) {
            console.warn("getFeatured", e);
            return [];
        }
    }

    async getUpcomingEvents(limitCount = 2) {
        try {
            const today = new Date().toISOString().slice(0, 10);
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .gte("date", today)
                .order("date", { ascending: true })
                .limit(limitCount);
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn("getUpcomingEvents", e);
            return [];
        }
    }

    async createPost(data) {
        try {
            const meta = await this.getAuthorMeta();
            const payload = {
                type: data.type || "photo",
                title: String(data.title || "Untitled moment").slice(0, 200),
                description: String(data.description || data.caption || "").slice(0, 2000),
                category: data.category || "events",
                class_tag: data.classTag || "Campus",
                image: data.image || data.imageUrl || "",
                image_url: data.imageUrl || data.image || "",
                thumbnail_url: data.thumbnailUrl || data.imageUrl || data.image || "",
                media_key: data.mediaKey || "",
                media_provider: data.mediaProvider || "cloudflare-r2",
                destinations: Array.isArray(data.destinations) ? data.destinations : ["gallery"],
                filter: data.filter || "original",
                sound_id: data.soundId || null,
                author: data.author || meta.author,
                author_id: data.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0,
                shares: 0,
                status: "published",
                is_official: false,
                author_role: "user"
            };
            const { data: row, error } = await supabase.from("posts").insert(payload).select().single();
            if (error) throw error;
            return this.normalizeItem(row);
        } catch (error) {
            console.error("createPost failed:", error);
            return null;
        }
    }

    async createPhoto(data) {
        try {
            const meta = await this.getAuthorMeta();
            const payload = {
                title: String(data.title || "Photo").slice(0, 200),
                description: String(data.description || "").slice(0, 2000),
                category: data.category || "events",
                class_tag: data.classTag || "Campus",
                image: data.image || data.imageUrl || "",
                image_url: data.imageUrl || data.image || "",
                thumbnail_url: data.thumbnailUrl || data.imageUrl || data.image || "",
                media_key: data.mediaKey || "",
                media_provider: data.mediaProvider || "cloudflare-r2",
                author: data.author || meta.author,
                author_id: data.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0
            };
            const { data: row, error } = await supabase.from("photos").insert(payload).select().single();
            if (error) throw error;
            return this.normalizeItem(row);
        } catch (error) {
            console.error("createPhoto failed:", error);
            return null;
        }
    }

    async createVideo(videoData) {
        try {
            const meta = await this.getAuthorMeta();
            const payload = {
                title: String(videoData.title || "Video").slice(0, 200),
                description: String(videoData.description || "").slice(0, 2000),
                category: videoData.category || "events",
                class_tag: videoData.classTag || "Campus",
                image: videoData.image || videoData.thumbnailUrl || videoData.imageUrl || "",
                image_url: videoData.imageUrl || videoData.image || "",
                thumbnail_url: videoData.thumbnailUrl || videoData.imageUrl || videoData.image || "",
                video_url: videoData.videoUrl || videoData.image || "",
                media_key: videoData.mediaKey || "",
                media_provider: videoData.mediaProvider || "cloudflare-r2",
                duration: videoData.duration || "",
                author: videoData.author || meta.author,
                author_id: videoData.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0,
                shares: 0,
                featured: !!videoData.featured
            };
            const { data: row, error } = await supabase.from("videos").insert(payload).select().single();
            if (error) throw error;
            return this.normalizeItem(row);
        } catch (error) {
            console.error("createVideo failed:", error);
            return null;
        }
    }

    async getAnalytics() {
        try {
            const [posts, photos, videos] = await Promise.all([
                supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
                supabase.from("photos").select("id", { count: "exact", head: true }),
                supabase.from("videos").select("id", { count: "exact", head: true })
            ]);
            return {
                totalPosts: posts.count || 0,
                totalPhotos: photos.count || 0,
                totalVideos: videos.count || 0
            };
        } catch (error) {
            return { totalPosts: 0, totalPhotos: 0, totalVideos: 0 };
        }
    }

    // Stub methods so older code doesn't break (chat still on Firebase for now)
    async getById() { return null; }
    async deletePost() { return false; }
    async deleteVideo() { return false; }
    async getComments() { return []; }
    async createComment() { return null; }
    async addLike() { return false; }
    async listChats() { return []; }
    watchChats() { return function () {}; }
    async upsertChat() { return false; }
    async listMessages() { return []; }
    async sendMessage() { return null; }
    async updateMessage() { return false; }
    watchMessages() { return function () {}; }
    realUid() { return ""; }
    followDocId(a, b) { return String(a) + "_" + String(b); }
    shapeUser(id, raw) { return { id, uid: id, ...(raw || {}) }; }
}

const db = new Database();
window.db = db;
export { db };
export default db;
