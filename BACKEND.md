# HSHS World – Backend (Firebase + R2)

The app talks to Firebase project **`school-gallery-62032`**.

| Layer | Status | Notes |
|-------|--------|--------|
| **Auth** | Live | Anonymous sign-in on boot (`js/config.js`) |
| **Firestore** | Live | posts, photos, videos, comments, likes, chats, messages, presence |
| **Chat** | Live | `js/hshs-chat-live.js` + `db.js` |
| **Media files** | Prepared | `js/storage.js` → Cloudflare R2 when configured; data-URL fallback now |
| **Local store** | Fallback | `HshsStore` still seeds UI offline |

---

## 1. One-time Firebase console steps

1. Open https://console.firebase.google.com/project/school-gallery-62032  
2. **Authentication → Sign-in method → enable Anonymous**  
3. **Firestore Database** → create the database if missing (production mode is fine; rules below protect it)  
4. Deploy rules + indexes from this repo:

```bash
npm i -g firebase-tools
firebase login
firebase use school-gallery-62032
firebase deploy --only firestore
```

That deploys both `firestore.rules` and `firestore.indexes.json`.

### Collections in use

| Path | Purpose |
|------|---------|
| `posts/{id}` | Gallery / For You feed |
| `photos/{id}` | Photo library |
| `videos/{id}` | Vibe / long videos |
| `comments/{id}` | Comments (`postId` field) |
| `likes/{id}` | Like events |
| `chats/{id}` | Campus threads |
| `chats/{id}/messages/{msgId}` | Live messages |
| `presence/{uid}` | Last seen |

Media **bytes** never live in Firestore — only URLs + metadata.

---

## 2. Cloudflare R2 (media storage)

`js/storage.js` is the single upload entry point.

### Recommended secure setup

1. Create an R2 bucket (e.g. `hshs-media`).  
2. Enable a **public** custom domain or R2.dev subdomain for reads.  
3. Deploy a small **Cloudflare Worker** that returns a **presigned PUT URL** (so browser secrets stay out of the client).  
4. Point the app at it:

```js
// In js/config.js or a one-liner before modules load:
window.__R2 = {
  signUrl: "https://your-worker.workers.dev/sign",
  publicBaseUrl: "https://media.yourdomain.com"   // or https://pub-xxxxx.r2.dev
};
```

`HshsStorage.upload(file)` will then:

1. POST `{ key, contentType, size }` to `signUrl`  
2. PUT the file to the returned presigned URL  
3. Return `{ url, key, provider: "cloudflare-r2" }`  

Until `__R2` is set, uploads fall back to compressed **data URLs** (photos) / **blob URLs** (videos) so the site keeps working offline and in demos.

### Size limits (config)

```js
storage: {
  provider: "cloudflare-r2",
  maxFileSize: 104857600,   // 100 MB
  maxPhotoSize: 52428800,   // 50 MB
  maxVideoSize: 104857600
}
```

---

## 3. What the code does today

- **`js/config.js`** – Firebase app, anonymous auth, global `firestore` / `auth` / `CONFIG`  
- **`js/db.js`** – Full CRUD helpers: `getPosts`, `createPost`, `createPhoto`, `createVideo`, comments, likes, chat, presence  
- **`js/storage.js`** – R2-ready upload + local fallback  
- **`js/hshs-chat-live.js`** – Live campus chat (already on Firestore)  
- **`js/hshs-upload.js`** – Create studio; will prefer Storage + `db.create*` when available  
- **`js/core/data.js`** – Bridge that prefers `db` when present  

If Firestore is blocked (rules, network, Auth not enabled), chat and content still work on-device via localStorage / `HshsStore`.

---

## 4. Quick verification checklist

- [ ] Anonymous Auth enabled  
- [ ] `firebase deploy --only firestore` succeeded  
- [ ] Open site → DevTools console shows `[HSHS] Firestore database initialized` and no Auth errors  
- [ ] Chat page shows “Live chat on” toast  
- [ ] Create a post → network tab shows Firestore writes (or local fallback if offline)  
- [ ] (Later) Set `window.__R2` → uploads hit R2 and return public URLs  

---

## 5. Next optional hardening

- Add email / Google sign-in alongside Anonymous  
- Cloud Function or Worker to strip EXIF / generate thumbnails on R2 upload  
- Stricter Firestore rules (e.g. only author can delete own posts) once real accounts exist  
- Migrate seed Unsplash posts into Firestore once, then turn off local seed for production  
