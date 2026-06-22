import { supabase } from "./config";

class Database {
    constructor() {
        this.initialized = true;
        console.log("Supabase database initialized");
    }

    // ============================================
    // POSTS
    // ============================================

    async getPosts(limit = 10, offset = 0) {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .range(offset, offset + limit - 1)
            .order("createdAt", { ascending: false });

        if (error) {
            console.error("Error fetching posts:", error);
            return [];
        }

        return data;
    }

    async getPostById(id) {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching post:", error);
            return null;
        }

        return data;
    }

    async createPost(postData) {
        const post = {
            ...postData,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
        };

        const { data, error } = await supabase
            .from("posts")
            .insert([post])
            .select();

        if (error) {
            console.error("Error creating post:", error);
            return null;
        }

        return data[0];
    }

    async updatePost(id, updates) {
        const { data, error } = await supabase
            .from("posts")
            .update(updates)
            .eq("id", id)
            .select();

        if (error) {
            console.error("Error updating post:", error);
            return null;
        }

        return data[0];
    }

    async deletePost(id) {
        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting post:", error);
            return false;
        }

        return true;
    }

    // ============================================
    // PHOTOS
    // ============================================

    async getPhotos(limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from("photos")
            .select("*")
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching photos:", error);
            return [];
        }

        return data;
    }

    async createPhoto(photoData) {
        const { data, error } = await supabase
            .from("photos")
            .insert([photoData])
            .select();

        if (error) {
            console.error("Error creating photo:", error);
            return null;
        }

        return data[0];
    }

    // ============================================
    // VIDEOS
    // ============================================

    async getVideos(limit = 12, offset = 0) {
        const { data, error } = await supabase
            .from("videos")
            .select("*")
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching videos:", error);
            return [];
        }

        return data;
    }

    async createVideo(videoData) {
        const { data, error } = await supabase
            .from("videos")
            .insert([videoData])
            .select();

        if (error) {
            console.error("Error creating video:", error);
            return null;
        }

        return data[0];
    }

    // ============================================
    // COMMENTS
    // ============================================

    async getComments(postId) {
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("postId", postId);

        if (error) {
            console.error("Error fetching comments:", error);
            return [];
        }

        return data;
    }

    async createComment(postId, commentData) {
        const { data, error } = await supabase
            .from("comments")
            .insert([
                {
                    postId,
                    ...commentData,
                    createdAt: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error("Error creating comment:", error);
            return null;
        }

        return data[0];
    }

    // ============================================
    // LIKES
    // ============================================

    async addLike(itemId, itemType = "post") {
        const { data, error } = await supabase
            .from("likes")
            .insert([
                {
                    itemId,
                    itemType,
                    createdAt: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error("Error adding like:", error);
            return null;
        }

        return data[0];
    }

    async removeLike(itemId) {
        const { error } = await supabase
            .from("likes")
            .delete()
            .eq("itemId", itemId);

        if (error) {
            console.error("Error removing like:", error);
            return false;
        }

        return true;
    }

    // ============================================
    // SEARCH
    // ============================================

    async search(query) {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .ilike("title", `%${query}%`);

        if (error) {
            console.error("Error searching:", error);
            return [];
        }

        return data;
    }

    // ============================================
    // ANALYTICS
    // ============================================

    async getAnalytics() {
        const { count: totalPosts } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true });

        const { count: totalPhotos } = await supabase
            .from("photos")
            .select("*", { count: "exact", head: true });

        const { count: totalVideos } = await supabase
            .from("videos")
            .select("*", { count: "exact", head: true });

        return {
            totalPosts,
            totalPhotos,
            totalVideos
        };
    }
}

const db = new Database();

export default db;
