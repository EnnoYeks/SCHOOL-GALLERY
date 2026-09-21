# HSHS World – Backend (Firebase + R2)

The app talks to Firebase project **`school-gallery-62032`**.

| Layer | Status | Notes |
|-------|--------|--------|
| **Auth** | Live | Email/password + Google. Firebase UID is the account identity. |
| **Firestore** | Live | posts, photos, videos, comments, likes, chats, messages, presence, users, follows |
| **Chat** | Live | `js/hshs-chat-live.js` + `db.js`. Inbox is live classmates only. |
| **People** | Live | Search, follow, profile, start chat |
| **Media files** | Prepared | `js/storage.js` → Cloudflare R2 when configured |
| **Local store** | Fallback only | Empty seed. No demo accounts. |

Before the final school move, deploy rules and indexes:

```bash
firebase use school-gallery-62032
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Authentication

There is **one** Firebase Auth instance (`js/config.js`) and **one** API (`js/hshs-auth-api.js`).

### Methods

- Email + password
- Google sign-in (`signInWithPopup`)
- Guest browsing (no account required for public pages)

Student IDs are **not** an authentication method and are not used as account identity.

### Identity

- **Firebase Auth UID** is the permanent account identity.
- **Username** is the public HSHS identity (unique, URL-safe).
- `users/{uid}` is the primary profile document.
- `userIndex/username_{name}` maps a username to that UID.

### Auth state

`onAuthStateChanged` is the source of truth.

| State | Meaning |
|-------|---------|
| `loading` | Session is being restored |
| `guest` | No real account (public browse) |
| `authenticated` | Signed-in email or Google user |

Anonymous/guest Firebase sessions are not treated as a real account and must not overwrite a signed-in profile.

Sessions persist across refresh, page changes, and browser restarts (`browserLocalPersistence`).

### Profile fields (`users/{uid}`)

`uid`, `fullName`, `username`, `email`, `photoURL`, `bio`, `classYear`, `house`, `role`, `createdAt`, `updatedAt`

Passwords are never stored in Firestore.

### Guest access

Guests can open public pages. Creating posts, comments, likes, and chat messages requires a real signed-in UID (`request.auth.uid`).

### Key files

- `js/config.js` — Firebase app + persistence + auth boot
- `js/hshs-auth-api.js` — sign in / sign up / Google / reset / profile
- `js/hshs-auth.js` — login page UI
- `js/hshs-auth-bridge.js` — stamps `authorId` from the Firebase UID
- `index/login.html` — sign in / create account

---

## 1. Firebase console steps

1. Open https://console.firebase.google.com/project/school-gallery-62032
2. **Authentication → Sign-in method** → enable **Email/Password** and **Google**
3. Deploy rules + indexes:

```bash
npm i -g firebase-tools
firebase login
firebase use school-gallery-62032
firebase deploy --only firestore
```

### Collections in use

| Path | Purpose |
|------|---------|
| `users/{uid}` | Account profile |
| `userIndex/username_{name}` | Unique username → UID |
| `posts/{id}` | Gallery / For You feed |
| `photos/{id}` | Photo library |
| `videos/{id}` | Studio / long videos |
| `comments/{id}` | Comments |
| `likes/{id}` | Like events |
| `follows/{id}` | Follow graph (`{me}_{them}`) |
| `chats/{id}` | Campus threads |
| `chats/{id}/messages/{msgId}` | Live messages |
| `presence/{uid}` | Last seen |

---

## 2. Security model

`firestore.rules` uses `request.auth.uid` as identity.

- A user may create/update only `users/{uid}` for their own UID.
- Posts, photos, videos, comments, and likes must use that same UID as `authorId`.
- Chat list and messages are limited to signed-in members of that thread.
- Unauthenticated users can read public content but cannot write authenticated collections.
- Anonymous provider is **not** treated as a signed-in author.

---

## 3. Cloudflare R2 (media storage)

`js/storage.js` is the upload entry point. Until `window.__R2` is set, uploads fall back to compressed data URLs / blob URLs.

---

## 4. Quick verification

- [ ] Email and Google sign-in enabled in Firebase
- [ ] Rules + indexes deployed
- [ ] Guest can browse Home / Gallery / Photos without an account
- [ ] Register with name + username + email + password creates `users/{uid}`
- [ ] Login with email or username works
- [ ] Google sign-in creates or keeps the profile
- [ ] Password reset sends mail
- [ ] Logout returns the UI to Guest
- [ ] Refresh keeps a signed-in session
- [ ] New posts store `authorId` equal to the Firebase UID
- [ ] Search finds signed-in classmates
- [ ] Follow + Message opens a live thread with no demo names
