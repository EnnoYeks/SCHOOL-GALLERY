# HSHS World data sources

Audited against the live Supabase project (`hhlogdqpgjiajeufwnop`) on 2026-11-02.
Auth is Firebase. Supabase is the database. `HshsStore` (`js/hshs-store.js`) is localStorage only and has no `listPolls`.

| page | feature | where data comes from now | real shared source? |
| --- | --- | --- | --- |
| / | home feed | Supabase `posts`, `photos`, `videos`, `events` via `db.getPosts` / `getPhotos` / `getVideos` / `getUpcomingEvents` | yes |
| /gallery | gallery | Supabase `posts`, `photos`, `videos` plus R2 via `HshsStorage` | yes |
| /photos | photos | Supabase `photos` | yes |
| /videos | videos | Supabase `videos` | yes |
| /spotlight | moments | Supabase `posts` via `db.getPosts` | yes (table exists; currently empty) |
| /spotlight | nominations | localStorage key `hshs-spotlight-nominations` | no |
| /polls | polls and votes | intended: Supabase `polls` + `poll_votes`. Tables do not exist yet. Client no longer writes `local-` ids to localStorage as the source of truth. localStorage `hshs_poll_vote_*` is only a per-device "I already voted" hint. | no — migration not applied |
| /memories | archive | Supabase `posts` via `db.getPosts` | yes (table exists; currently empty) |
| /notifications | notifications | intended: Supabase `notifications` filtered by Firebase uid. Table does not exist. No longer reads `HshsStore.listNotifications`. | no — migration not applied |
| /chat | messages | Firebase (stubs in `db.js` return empty) | partial |
| friends | friend requests | `HshsStore` localStorage only. `friend_requests` table does not exist. | no — migration not applied |

## Tables that exist

`posts`, `photos`, `videos`, `events`, `users`, `comments`, `likes`.

## Tables that do not exist

`polls`, `poll_votes`, `notifications`, `friend_requests`, `spotlight_nominations`.

## Migration (not run)

`supabase/migrations/20261102_polls_notifications.sql` creates those tables, a unique `(poll_id, firebase_uid)` constraint so one signed-in user can vote once, and RLS policies. It was not executed. Approve it before polls, votes, and notifications can be shared across devices.
