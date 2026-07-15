import { firestore, auth, supabase } from "./config.js";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

class Database {
  constructor() {
    this.initialized = true;
    console.log("Firestore database initialized");
  }

  async queryCollection(collectionName, limitValue = 10, offset = 0, orderField = "createdAt") {
    try {
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, orderBy(orderField, "desc"), limit(limitValue + offset));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
    console.log(`No documents found in "${collectionName}"`);
    return [];
}
      const allItems = snapshot.docs.map((docSnap) => this.normalizeItem({ id: docSnap.id, ...docSnap.data() }));
      return allItems.slice(offset, offset + limitValue);
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      return [];
    }
  }

  async getPosts(limit = 10, offset = 0) {
    return this.queryCollection("posts", limit, offset);
  }

  async getPostById(id) {
    try {
      const documentRef = doc(firestore, "posts", id);
      const snapshot = await getDoc(documentRef);
      if (!snapshot.exists()) return null;
      return this.normalizeItem({ id: snapshot.id, ...snapshot.data() });
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  }

  async createPost(postData) {
    try {
      const payload = {
        ...postData,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: 0,
      };
      const docRef = await addDoc(collection(firestore, "posts"), payload);
      return this.normalizeItem({ id: docRef.id, ...payload });
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }
  }

  async updatePost(id, updates) {
    try {
      const documentRef = doc(firestore, "posts", id);
      await updateDoc(documentRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return this.getPostById(id);
    } catch (error) {
      console.error("Error updating post:", error);
      return null;
    }
  }

  async deletePost(id) {
    try {
      await deleteDoc(doc(firestore, "posts", id));
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  async deletePhoto(id) {
    try {
      await deleteDoc(doc(firestore, "photos", id));
      return true;
    } catch (error) {
      console.error("Error deleting photo:", error);
      return false;
    }
  }

  async deleteVideo(id) {
    try {
      await deleteDoc(doc(firestore, "videos", id));
      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      return false;
    }
  }

  async getPhotos(limit = 20, offset = 0) {
    return this.queryCollection("photos", limit, offset);
  }

  async createPhoto(photoData) {
    try {
      const payload = {
        ...photoData,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
      };
      const docRef = await addDoc(collection(firestore, "photos"), payload);
      return this.normalizeItem({ id: docRef.id, ...payload });
    } catch (error) {
      console.error("Error creating photo:", error);
      return null;
    }
  }

  async getVideos(limit = 12, offset = 0) {
    return this.queryCollection("videos", limit, offset);
  }

  async createVideo(videoData) {
    try {
      const payload = {
        ...videoData,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
      };
      const docRef = await addDoc(collection(firestore, "videos"), payload);
      return this.normalizeItem({ id: docRef.id, ...payload });
    } catch (error) {
      console.error("Error creating video:", error);
      return null;
    }
  }

  async getComments(postId) {
    try {
      const commentsQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  async createComment(postId, commentData) {
    try {
      const payload = {
        postId,
        ...commentData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(firestore, "comments"), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error creating comment:", error);
      return null;
    }
  }

  async getCurrentUserId() {
    try {
      const user = auth?.currentUser;
      if (user?.uid) return user.uid;
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = `guest-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("userId", userId);
      }
      return userId;
    } catch (error) {
      console.warn("Unable to determine current user id:", error);
      return "guest";
    }
  }

  async hasLiked(itemId, itemType = "post") {
    try {
      const userId = await this.getCurrentUserId();
      const likesQuery = query(
        collection(firestore, "likes"),
        where("itemId", "==", itemId),
        where("itemType", "==", itemType),
        where("userId", "==", userId),
        limit(1)
      );
      const snapshot = await getDocs(likesQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  }

  async addLike(itemId, itemType = "post") {
    try {
      const userId = await this.getCurrentUserId();
      if (await this.hasLiked(itemId, itemType)) {
        return null;
      }
      const payload = {
        itemId,
        itemType,
        userId,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(firestore, "likes"), payload);
      await this.incrementLikeCount(itemId, itemType, 1);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error adding like:", error);
      return null;
    }
  }

  async removeLike(itemId, itemType = "post") {
    try {
      const userId = await this.getCurrentUserId();
      const likesQuery = query(
        collection(firestore, "likes"),
        where("itemId", "==", itemId),
        where("itemType", "==", itemType),
        where("userId", "==", userId),
        limit(1)
      );
      const snapshot = await getDocs(likesQuery);
      if (snapshot.empty) return false;
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(firestore, "likes", docId));
      await this.incrementLikeCount(itemId, itemType, -1);
      return true;
    } catch (error) {
      console.error("Error removing like:", error);
      return false;
    }
  }

  async incrementLikeCount(itemId, itemType, delta) {
    try {
      const collectionName = itemType === "photo" ? "photos" : itemType === "video" ? "videos" : "posts";
      const itemRef = doc(firestore, collectionName, itemId);
      await updateDoc(itemRef, {
        likesCount: increment(delta),
      });
    } catch (error) {
      console.error("Error updating like count:", error);
    }
  }

  async search(searchTerm, scope = "all") {
    try {
      const queryValue = String(searchTerm || "").trim().toLowerCase();
      if (!queryValue) return [];

      const collectionsToSearch = [];
      if (scope === "photos") collectionsToSearch.push("photos");
      else if (scope === "videos") collectionsToSearch.push("videos");
      else collectionsToSearch.push("posts", "photos", "videos");

      const results = [];
      for (const collectionName of collectionsToSearch) {
        const snapshot = await getDocs(query(collection(firestore, collectionName), orderBy("createdAt", "desc"), limit(100)));
        snapshot.docs.forEach((docSnap) => {
          const item = this.normalizeItem({ id: docSnap.id, ...docSnap.data() });
          const searchable = [item.title, item.description, item.category, item.author, item.authorName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (searchable.includes(queryValue)) {
            results.push(item);
          }
        });
      }

      return results;
    } catch (error) {
      console.error("Error searching:", error);
      return [];
    }
  }

  async getNotifications(limitValue = 20) {
    try {
      const userId = await this.getCurrentUserId();
      const notificationsQuery = query(
        collection(firestore, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitValue)
      );
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async createNotification(notificationData) {
    try {
      const payload = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false,
      };
      const docRef = await addDoc(collection(firestore, "notifications"), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(firestore, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async getAnalytics() {
    try {
      const postsCount = (await getDocs(collection(firestore, "posts"))).size;
      const photosCount = (await getDocs(collection(firestore, "photos"))).size;
      const videosCount = (await getDocs(collection(firestore, "videos"))).size;
      return {
        totalPosts: postsCount,
        totalPhotos: photosCount,
        totalVideos: videosCount,
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        totalPosts: 0,
        totalPhotos: 0,
        totalVideos: 0,
      };
    }
  }

  normalizeItem(item) {
    if (!item || typeof item !== "object") return item;

    return {
      ...item,
      likes: item.likes ?? item.likesCount ?? 0,
      comments: item.comments ?? item.commentsCount ?? 0,
      shares: item.shares ?? item.sharesCount ?? 0,
      views: item.views ?? item.viewsCount ?? 0,
    };
  }

  async saveToStorage() {
    return true;
  }
}

const db = new Database();
window.db = db;

export default db;
