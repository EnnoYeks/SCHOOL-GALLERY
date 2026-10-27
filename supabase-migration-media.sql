-- HSHS World media enhancements. Review the live schema before running.
-- Confirm photos.id/videos.id types and RLS policies in Supabase first.
alter table public.photos
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists blur_data text,
  add column if not exists dominant_color text,
  add column if not exists views integer not null default 0,
  add column if not exists trending_score real not null default 0,
  add column if not exists processed_key text;

alter table public.videos
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists duration real,
  add column if not exists poster_key text,
  add column if not exists preview_key text,
  add column if not exists views integer not null default 0,
  add column if not exists trending_score real not null default 0;

create or replace function public.increment_video_views(video_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.videos set views = coalesce(views, 0) + 1 where id = video_id;
$$;

create or replace function public.increment_photo_likes(photo_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.photos set likes = coalesce(likes, 0) + 1 where id = photo_id;
$$;

revoke all on function public.increment_video_views(uuid) from public;
revoke all on function public.increment_photo_likes(uuid) from public;
grant execute on function public.increment_video_views(uuid) to anon, authenticated;
grant execute on function public.increment_photo_likes(uuid) to anon, authenticated;

-- These public counters are best-effort and can be abused; add server-side rate limiting
-- and stricter per-user reaction tables before treating them as authoritative analytics.
