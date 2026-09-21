// ============================================
// ENNOYEKS SCHOOL GALLERY DATABASE
// FIREBASE / FIRESTORE LAYER (full backend)
// ============================================

import { firestore, auth } from "./config.js";

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
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

class Database {
    constructor() {
        console.log("[HSHS] Firestore database initialized");
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
        return {
            ...item,
            likes: item.likes ?? item.likesCount ?? 0,
            views: item.views ?? item.viewsCount ?? 0,
            comments: item.comments ?? item.commentsCount ?? 0,
            shares: item.shares ?? 0,
            image: item.image || item.imageUrl || item.thumbnailUrl || "",
            imageUrl: item.imageUrl || item.image || "",
            thumbnailUrl: item.thumbnailUrl || item.imageUrl || item.image || ""
        };
    }

    async queryCollection(collectionName, limitValue = 10, offset = 0) {
        try {
            const ref = collection(firestore, collectionName);
            const q = query(ref, orderBy("createdAt", "desc"), limit(limitValue + offset));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return [];
            const data = snapshot.docs.map(d => this.normalizeItem({ id: d.id, ...d.data() }));
            return data.slice(offset, offset + limitValue);
        } catch (error) {
            console.error("Database error:", error);
            return [];
        }
    }

    async getPosts(limitCount = 10, offset = 0) {
        return this.queryCollection("posts", limitCount, offset);
    }
    async getPhotos(limitCount = 20, offset = 0) {
        return this.queryCollection("photos", limitCount, offset);
    }
    async getVideos(limitCount = 12, offset = 0) {
        return this.queryCollection("videos", limitCount, offset);
    }

    async getById(collectionName, id) {
        try {
            const snap = await getDoc(doc(firestore, collectionName, id));
            if (!snap.exists()) return null;
            return this.normalizeItem({ id: snap.id, ...snap.data() });
        } catch (e) {
            console.error("getById", e);
            return null;
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
                classTag: data.classTag || "Campus",
                image: data.image || data.imageUrl || "",
                imageUrl: data.imageUrl || data.image || "",
                thumbnailUrl: data.thumbnailUrl || data.imageUrl || data.image || "",
                mediaKey: data.mediaKey || "",
                mediaProvider: data.mediaProvider || "local",
                destinations: Array.isArray(data.destinations) ? data.destinations : ["gallery"],
                filter: data.filter || "original",
                soundId: data.soundId || null,
                author: data.author || meta.author,
                authorId: data.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0,
                shares: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const ref = await addDoc(collection(firestore, "posts"), payload);
            return this.normalizeItem({ id: ref.id, ...payload, createdAt: new Date().toISOString() });
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
                classTag: data.classTag || "Campus",
                image: data.image || data.imageUrl || "",
                imageUrl: data.imageUrl || data.image || "",
                thumbnailUrl: data.thumbnailUrl || data.imageUrl || data.image || "",
                mediaKey: data.mediaKey || "",
                mediaProvider: data.mediaProvider || "local",
                author: data.author || meta.author,
                authorId: data.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const ref = await addDoc(collection(firestore, "photos"), payload);
            return this.normalizeItem({ id: ref.id, ...payload, createdAt: new Date().toISOString() });
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
                classTag: videoData.classTag || "Campus",
                image: videoData.image || videoData.thumbnailUrl || videoData.imageUrl || "",
                imageUrl: videoData.imageUrl || videoData.image || "",
                thumbnailUrl: videoData.thumbnailUrl || videoData.imageUrl || videoData.image || "",
                videoUrl: videoData.videoUrl || videoData.image || "",
                mediaKey: videoData.mediaKey || "",
                mediaProvider: videoData.mediaProvider || "local",
                duration: videoData.duration || "",
                author: videoData.author || meta.author,
                authorId: videoData.authorId || meta.authorId,
                likes: 0,
                views: 0,
                comments: 0,
                shares: 0,
                featured: !!videoData.featured,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const ref = await addDoc(collection(firestore, "videos"), payload);
            return this.normalizeItem({ id: ref.id, ...payload, createdAt: new Date().toISOString() });
        } catch (error) {
            console.error("Video creation failed:", error);
            return null;
        }
    }

    async deleteVideo(id) {
        try {
            await deleteDoc(doc(firestore, "videos", id));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async deletePost(id) {
        try {
            await deleteDoc(doc(firestore, "posts", id));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async getComments(postId) {
        try {
            const q = query(
                collection(firestore, "comments"),
                where("postId", "==", postId),
                orderBy("createdAt", "desc"),
                limit(100)
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createComment(postId, data) {
        try {
            const meta = await this.getAuthorMeta();
            const payload = {
                postId,
                text: String(data.text || data).slice(0, 2000),
                author: data.author || meta.author,
                authorId: data.authorId || meta.authorId,
                createdAt: serverTimestamp()
            };
            const ref = await addDoc(collection(firestore, "comments"), payload);
            try {
                const col = data.collection || "posts";
                await updateDoc(doc(firestore, col, postId), { comments: increment(1) });
            } catch (e) {}
            return { id: ref.id, ...payload, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async addLike(itemId, type = "post") {
        try {
            const user = await this.getCurrentUserId();
            await addDoc(collection(firestore, "likes"), {
                itemId,
                type,
                user,
                createdAt: serverTimestamp()
            });
            const collectionName =
                type === "video" ? "videos" : type === "photo" ? "photos" : "posts";
            await updateDoc(doc(firestore, collectionName, itemId), { likes: increment(1) });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async getAnalytics() {
        try {
            const posts = await getDocs(collection(firestore, "posts"));
            const photos = await getDocs(collection(firestore, "photos"));
            const videos = await getDocs(collection(firestore, "videos"));
            return {
                totalPosts: posts.size,
                totalPhotos: photos.size,
                totalVideos: videos.size
            };
        } catch (error) {
            return { totalPosts: 0, totalPhotos: 0, totalVideos: 0 };
        }
    }

    async listChats(uid) {
        if (!uid) return [];
        try {
            const snap = await getDocs(query(
                collection(firestore, "chats"),
                where("memberIds", "array-contains", uid),
                orderBy("updatedAt", "desc"),
                limit(40)
            ));
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.warn("listChats index fallback", error);
            try {
                const snap = await getDocs(query(
                    collection(firestore, "chats"),
                    where("memberIds", "array-contains", uid),
                    limit(40)
                ));
                const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                rows.sort((a, b) => {
                    const am = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
                    const bm = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
                    return bm - am;
                });
                return rows;
            } catch (err) {
                console.error("listChats", err);
                return [];
            }
        }
    }

    watchChats(uid, onChange) {
        if (!uid || typeof onChange !== "function") return function () {};
        const apply = (rows, err) => {
            try { onChange(rows || [], err || null); } catch (e) {}
        };
        const listen = (qRef) => onSnapshot(
            qRef,
            { includeMetadataChanges: true },
            function (snap) {
                const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                rows.sort(function (a, b) {
                    const am = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
                    const bm = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
                    return bm - am;
                });
                apply(rows, null);
            },
            function (err) {
                console.warn("watchChats", err && err.code, err);
                if (err && String(err.code || "").indexOf("failed-precondition") !== -1) {
                    try {
                        return listen(query(
                            collection(firestore, "chats"),
                            where("memberIds", "array-contains", uid),
                            limit(40)
                        ));
                    } catch (e) {}
                }
                apply([], err);
            }
        );
        try {
            return listen(query(
                collection(firestore, "chats"),
                where("memberIds", "array-contains", uid),
                orderBy("updatedAt", "desc"),
                limit(40)
            ));
        } catch (error) {
            try {
                return listen(query(
                    collection(firestore, "chats"),
                    where("memberIds", "array-contains", uid),
                    limit(40)
                ));
            } catch (err) {
                apply([], err);
                return function () {};
            }
        }
    }

    async upsertChat(chatId, data) {
        try {
            await setDoc(
                doc(firestore, "chats", chatId),
                { ...data, updatedAt: serverTimestamp() },
                { merge: true }
            );
            return true;
        } catch (error) {
            console.error("upsertChat", error);
            return false;
        }
    }

    async listMessages(chatId, limitValue = 80) {
        try {
            const q = query(
                collection(firestore, "chats", chatId, "messages"),
                orderBy("createdAt", "asc"),
                limit(limitValue)
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("listMessages", error);
            return [];
        }
    }

    async sendMessage(chatId, data) {
        try {
            const uid = data.senderId || (await this.getCurrentUserId());
            const kind = data.kind || "text";
            const text = String(data.text || data.fileName || kind || " ").slice(0, 2000) || " ";
            const payload = {
                text,
                senderId: uid,
                senderName: data.senderName || "Campus student",
                kind,
                fileName: data.fileName || "",
                fileMeta: data.fileMeta || "",
                src: data.src || "",
                mediaKey: data.mediaKey || "",
                mediaProvider: data.mediaProvider || "",
                clientId: data.clientId || "",
                reacts: {},
                createdAt: serverTimestamp()
            };
            const ref = await addDoc(collection(firestore, "chats", chatId, "messages"), payload);
            const chatPatch = {
                preview: kind === "text" ? payload.text.slice(0, 80) : (kind + " attachment"),
                lastMessage: kind === "text" ? payload.text.slice(0, 80) : (kind + " attachment"),
                updatedAt: serverTimestamp()
            };
            try {
                const chatSnap = await getDoc(doc(firestore, "chats", chatId));
                const members = (chatSnap.exists() && chatSnap.data().memberIds) || [];
                members.forEach(function (id) {
                    if (!id) return;
                    chatPatch["unread." + id] = id === uid ? 0 : increment(1);
                });
            } catch (e) {}
            await setDoc(doc(firestore, "chats", chatId), chatPatch, { merge: true });
            return { id: ref.id, ...payload };
        } catch (error) {
            console.error("sendMessage", error);
            return null;
        }
    }

    async updateMessage(chatId, msgId, patch) {
        try {
            await updateDoc(doc(firestore, "chats", chatId, "messages", msgId), patch);
            return true;
        } catch (error) {
            console.error("updateMessage", error);
            return false;
        }
    }

    watchMessages(chatId, onChange) {
        if (!chatId || typeof onChange !== "function") return function () {};
        try {
            const q = query(
                collection(firestore, "chats", chatId, "messages"),
                orderBy("createdAt", "asc"),
                limit(120)
            );
            return onSnapshot(
                q,
                { includeMetadataChanges: true },
                function (snap) {
                    const rows = snap.docs.map(function (d) {
                        return { id: d.id, pending: !!(d.metadata && d.metadata.hasPendingWrites), ...d.data() };
                    });
                    onChange(rows, null);
                },
                function (err) {
                    console.error("watchMessages", err);
                    onChange(null, err);
                }
            );
        } catch (error) {
            console.error("watchMessages", error);
            onChange(null, error);
            return function () {};
        }
    }

    realUid() {
        const u = (typeof window !== "undefined" && window.hshsAuthUser) || (auth && auth.currentUser) || null;
        if (!u || u.isAnonymous) return "";
        return u.uid;
    }

    followDocId(followerId, followingId) {
        return String(followerId || "") + "_" + String(followingId || "");
    }

    shapeUser(id, raw) {
        raw = raw || {};
        return {
            id: raw.uid || id,
            uid: raw.uid || id,
            name: raw.fullName || raw.name || "HSHS Student",
            fullName: raw.fullName || raw.name || "HSHS Student",
            username: String(raw.username || "").replace(/^@/, "").toLowerCase(),
            role: raw.role || "Student",
            classYear: raw.classYear || "",
            house: raw.house || "",
            bio: raw.bio || "",
            email: raw.email || "",
            avatar: raw.photoURL || raw.avatar || "",
            photoURL: raw.photoURL || raw.avatar || "",
            cover: raw.coverURL || raw.cover || "",
            coverURL: raw.coverURL || raw.cover || ""
        };
    }

    async listUsers(max = 80) {
        try {
            const snap = await getDocs(query(collection(firestore, "users"), limit(max)));
            return snap.docs.map((d) => this.shapeUser(d.id, d.data()));
        } catch (error) {
            console.error("listUsers", error);
            return [];
        }
    }

    async getUser(uid) {
        if (!uid) return null;
        try {
            const snap = await getDoc(doc(firestore, "users", uid));
            if (!snap.exists()) return null;
            return this.shapeUser(snap.id, snap.data());
        } catch (error) {
            console.error("getUser", error);
            return null;
        }
    }

    async getUserByUsername(username) {
        const value = String(username || "").replace(/^@/, "").toLowerCase().trim();
        if (!value) return null;
        try {
            const idx = await getDoc(doc(firestore, "userIndex", "username_" + value));
            if (idx.exists() && idx.data().uid) return this.getUser(idx.data().uid);
        } catch (e) {}
        try {
            const snap = await getDocs(query(collection(firestore, "users"), where("username", "==", value), limit(1)));
            if (snap.empty) return null;
            const d = snap.docs[0];
            return this.shapeUser(d.id, d.data());
        } catch (error) {
            console.error("getUserByUsername", error);
            return null;
        }
    }

    async searchUsers(q, max = 24) {
        const rows = await this.listUsers(80);
        const needle = String(q || "").toLowerCase().trim().replace(/^@/, "");
        const filtered = needle
            ? rows.filter((u) => [u.name, u.username, u.role, u.classYear, u.bio].join(" ").toLowerCase().indexOf(needle) !== -1)
            : rows;
        return filtered.slice(0, max);
    }

    async search(q) {
        const people = await this.searchUsers(q, 8);
        return people.map((u) => ({
            kind: "user",
            id: u.uid,
            uid: u.uid,
            title: u.name,
            username: u.username,
            category: "account",
            image: u.photoURL || ""
        }));
    }

    async isFollowing(targetId) {
        const me = this.realUid();
        if (!me || !targetId || me === targetId) return false;
        try {
            const snap = await getDoc(doc(firestore, "follows", this.followDocId(me, targetId)));
            return snap.exists();
        } catch (error) {
            return false;
        }
    }

    async followCounts(uid) {
        if (!uid) return { followers: 0, following: 0 };
        try {
            const followers = await getDocs(query(collection(firestore, "follows"), where("followingId", "==", uid), limit(200)));
            const following = await getDocs(query(collection(firestore, "follows"), where("followerId", "==", uid), limit(200)));
            return { followers: followers.size, following: following.size };
        } catch (error) {
            console.error("followCounts", error);
            return { followers: 0, following: 0 };
        }
    }

    async toggleFollow(targetId) {
        const me = this.realUid();
        if (!me) return { ok: false, error: "Sign in first.", following: false };
        if (!targetId || targetId === me) return { ok: false, error: "Choose another student.", following: false };
        const id = this.followDocId(me, targetId);
        try {
            const ref = doc(firestore, "follows", id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                await deleteDoc(ref);
                return { ok: true, following: false, counts: await this.followCounts(targetId) };
            }
            await setDoc(ref, {
                followerId: me,
                followingId: targetId,
                createdAt: serverTimestamp()
            });
            return { ok: true, following: true, counts: await this.followCounts(targetId) };
        } catch (error) {
            console.error("toggleFollow", error);
            const code = String((error && error.code) || "");
            const msg = code.indexOf("permission") !== -1
                ? "Follow rules are not live yet. Deploy firestore.rules."
                : (error.message || "Could not follow.");
            return { ok: false, error: msg, following: false };
        }
    }

    async mapFollowUsers(field, uid) {
        if (!uid) return [];
        try {
            const snap = await getDocs(query(collection(firestore, "follows"), where(field, "==", uid), limit(80)));
            const ids = snap.docs.map((d) => {
                const data = d.data() || {};
                return field === "followerId" ? data.followingId : data.followerId;
            }).filter(Boolean);
            const rows = [];
            for (const id of ids) {
                const user = await this.getUser(id);
                if (user) rows.push(user);
            }
            return rows;
        } catch (error) {
            console.error("mapFollowUsers", error);
            return [];
        }
    }

    async listFollowing(uid) { return this.mapFollowUsers("followerId", uid); }
    async listFollowers(uid) { return this.mapFollowUsers("followingId", uid); }

    async mediaByAuthor(uid, limitValue = 48) {
        if (!uid) return [];
        const out = [];
        const cols = [["posts", "photo"], ["photos", "photo"], ["videos", "video"]];
        for (const [name, fallback] of cols) {
            try {
                const snap = await getDocs(query(collection(firestore, name), where("authorId", "==", uid), orderBy("createdAt", "desc"), limit(limitValue)));
                snap.docs.forEach((d) => out.push(this.normalizeItem({ id: d.id, type: fallback, ...d.data() })));
            } catch (error) {
                try {
                    const snap = await getDocs(query(collection(firestore, name), where("authorId", "==", uid), limit(limitValue)));
                    snap.docs.forEach((d) => out.push(this.normalizeItem({ id: d.id, type: fallback, ...d.data() })));
                } catch (err) {}
            }
        }
        const seen = {};
        return out.filter((item) => {
            const key = item.id || item.imageUrl || item.title;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    async startDirectChat(peer) {
        const me = this.realUid();
        if (!me) return { ok: false, error: "Sign in first." };
        if (!peer || !peer.uid) return { ok: false, error: "Choose a student." };
        if (peer.uid === me) return { ok: false, error: "That is you." };
        const ids = [me, peer.uid].sort();
        const chatId = ids.join("_");
        const peerName = peer.name || peer.fullName || "HSHS Student";
        const ok = await this.upsertChat(chatId, {
            memberIds: ids,
            peerId: peer.uid,
            peerName,
            peerUsername: peer.username || "",
            name: peerName,
            user: peer.username || "",
            avatar: peer.photoURL || peer.avatar || "",
            group: false,
            preview: "",
            lastMessage: ""
        });
        return ok ? { ok: true, chatId, peer } : { ok: false, error: "Could not start chat." };
    }

    async setPresence(uid, info) {
        if (!uid) return false;
        try {
            await setDoc(
                doc(firestore, "presence", uid),
                { ...info, lastSeen: serverTimestamp() },
                { merge: true }
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    watchPresence(onChange) {
        if (typeof onChange !== "function") return function () {};
        try {
            return onSnapshot(
                collection(firestore, "presence"),
                function (snap) {
                    const map = {};
                    snap.forEach(function (d) { map[d.id] = { id: d.id, ...d.data() }; });
                    onChange(map, null);
                },
                function (err) {
                    console.error("watchPresence", err);
                    onChange({}, err);
                }
            );
        } catch (error) {
            console.error("watchPresence", error);
            return function () {};
        }
    }
}

const db = new Database();
window.db = db;
export { db };
export default db;
