# Security deploy

GitHub now has tighter Firestore rules, but **Firebase does not auto-deploy rules from git**.

Run this once from a machine with Firebase CLI access:

```bash
firebase use school-gallery-62032
firebase deploy --only firestore:rules
```

Until that command succeeds, the live database still allows public reads of `users` (emails/phones).

Also in Firebase console:
- Authentication → Abuse protection: enable
- App Check: enable for the web app
- Restrict the browser API key to hshsgallery.vercel.app
