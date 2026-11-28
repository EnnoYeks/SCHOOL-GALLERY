# Security deploy

Admin access is authorized by the Cloudflare Worker using verified Firebase ID tokens and the Worker variable `ADMIN_EMAILS` (comma-separated verified email addresses). The browser must not contain an admin allow-list or use direct Supabase writes for admin actions. Set `ADMIN_EMAILS` and redeploy the Worker. Keep `SUPABASE_SERVICE_ROLE_KEY` as an encrypted Worker secret, never in frontend configuration.

Review and apply `supabase-migration-admin-lockdown.sql` manually after inspecting existing policies. It is not automatically applied and must not be run blindly.


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
