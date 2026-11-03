# Buzz 2.0 setup notes

## What changed

- Buzz loads the existing Supabase `videos` feed in pages of 18.
- Only the visible clip plays; off-screen clips pause.
- Likes, comments and creator follows use Supabase rather than browser-only state.
- The Following tab is account-based.
- Video shares include a deep link to the selected clip.
- The comment sheet is usable on mobile and desktop.

## Required one-time Supabase/Firebase setup

Buzz 2.0 uses a separate Supabase client that forwards the signed-in Firebase ID token. The existing public Supabase client used by the rest of the site is unchanged.

1. In Supabase project `hhlogdqpgjiajeufwnop`, open **Authentication → Third-Party Auth** and add Firebase project `school-gallery-62032`.
2. Ensure Firebase users have the custom claim `role: "authenticated"`. This must be assigned by trusted Firebase Admin SDK code, never by browser code. The current client auth code does not set this claim.
3. Review and apply `supabase-migration-buzz-social.sql`. It creates `video_follows` and replaces unrestricted social write policies with UID-owned policies.
4. The migration explicitly grants Data API access to `video_follows`. This matters because Supabase changed the default exposure behavior for new public-schema tables on 2026-10-30.

Until these steps are completed, the feed remains browseable, but signed-in likes/comments/follows may be rejected by Supabase. Do not loosen RLS to make the buttons work.

Reference: https://supabase.com/docs/guides/auth/third-party/firebase-auth

## Verification checklist

- [ ] Signed-out visitor can browse clips and read public comments/like counts.
- [ ] Signed-in Firebase user can like and unlike a clip.
- [ ] Signed-in Firebase user can follow and unfollow a creator.
- [ ] Signed-in Firebase user can post a comment; author UID comes from the verified token.
- [ ] A second user cannot remove another user's like, comment, or follow.
- [ ] Following only shows creators followed by the current account.
- [ ] Only the visible clip plays; off-screen clips pause.
- [ ] Test the Vercel preview at phone and desktop widths.

## Production safety

This feature branch does not apply the SQL migration, change Cloudflare Worker settings, merge to `main`, or assign the production alias.
