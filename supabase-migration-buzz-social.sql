-- Buzz 2.0 social tables and Firebase-backed row ownership.
-- Apply only after enabling Firebase as a Supabase Third-Party Auth provider.
-- Firebase ID tokens must carry role="authenticated".
-- This file is intentionally not applied to the live project by this feature branch.

create or replace function public.hshs_firebase_uid()
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when auth.jwt() ->> 'iss' = 'https://securetoken.google.com/school-gallery-62032'
     and auth.jwt() ->> 'aud' = 'school-gallery-62032'
     and auth.jwt() ->> 'role' = 'authenticated'
     and nullif(auth.jwt() ->> 'sub', '') is not null
    then auth.jwt() ->> 'sub'
    else null
  end
$$;

revoke all on function public.hshs_firebase_uid() from public;
grant execute on function public.hshs_firebase_uid() to anon, authenticated;

create table if not exists public.video_follows (
  follower_id text not null,
  creator_id text not null,
  created_at timestamptz not null default now(),
  constraint video_follows_pkey primary key (follower_id, creator_id),
  constraint video_follows_no_self_follow check (follower_id <> creator_id)
);

create index if not exists video_follows_creator_idx
  on public.video_follows (creator_id);

create index if not exists comments_video_lookup_idx
  on public.comments (collection, post_id, created_at);

alter table public.video_follows enable row level security;

-- Explicit grants are required for new public-schema tables to be available
-- through the Supabase Data API on projects using the post-2026-10-30 defaults.
grant select, insert, delete on public.video_follows to authenticated;

drop policy if exists "Users read own video follows" on public.video_follows;
create policy "Users read own video follows"
  on public.video_follows for select to authenticated
  using (follower_id = public.hshs_firebase_uid());

drop policy if exists "Users insert own video follows" on public.video_follows;
create policy "Users insert own video follows"
  on public.video_follows for insert to authenticated
  with check (
    follower_id = public.hshs_firebase_uid()
    and creator_id <> public.hshs_firebase_uid()
  );

drop policy if exists "Users delete own video follows" on public.video_follows;
create policy "Users delete own video follows"
  on public.video_follows for delete to authenticated
  using (follower_id = public.hshs_firebase_uid());

-- Replace unrestricted inserts with Firebase-UID-owned video reactions.
drop policy if exists "App insert likes" on public.likes;
create policy "Firebase users insert own video likes"
  on public.likes for insert to authenticated
  with check (
    user_id = public.hshs_firebase_uid()
    and type = 'video'
  );

drop policy if exists "Firebase users delete own video likes" on public.likes;
create policy "Firebase users delete own video likes"
  on public.likes for delete to authenticated
  using (
    user_id = public.hshs_firebase_uid()
    and type = 'video'
  );

drop policy if exists "App insert comments" on public.comments;
create policy "Firebase users insert own video comments"
  on public.comments for insert to authenticated
  with check (
    author_id = public.hshs_firebase_uid()
    and collection = 'videos'
    and char_length(trim(text)) between 1 and 240
  );

drop policy if exists "Firebase users delete own video comments" on public.comments;
create policy "Firebase users delete own video comments"
  on public.comments for delete to authenticated
  using (
    author_id = public.hshs_firebase_uid()
    and collection = 'videos'
  );
