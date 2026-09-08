# Bring HSHS World to life

The app already talks to Firebase project `school-gallery-62032`.
Chat now writes to Firestore. Photos/videos still stay off Firebase (R2 later).

## One-time Firebase console steps

1. Open https://console.firebase.google.com/project/school-gallery-62032
2. Authentication → Sign-in method → enable **Anonymous**
3. Firestore Database → create the database if it does not exist (start in production mode)
4. Deploy rules from this repo:

```bash
npm i -g firebase-tools
firebase login
firebase use school-gallery-62032
firebase deploy --only firestore:rules
```

## What goes live first

- `chats/{id}` campus threads
- `chats/{id}/messages` live text
- `presence/{uid}` last seen
- posts / photos / videos / comments / likes keep using `js/db.js`

If Firestore is blocked, chat still works on this device through localStorage.
