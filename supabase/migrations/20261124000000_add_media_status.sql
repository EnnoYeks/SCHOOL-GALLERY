-- HSHS World: explicit media health flags for admin review.
-- This migration is intentionally NOT applied automatically.
-- Existing content and media URLs are preserved; rows default to "available".
alter table public.photos
  add column if not exists media_status text not null default 'available';
alter table public.posts
  add column if not exists media_status text not null default 'available';
alter table public.videos
  add column if not exists media_status text not null default 'available';
alter table public.users
  add column if not exists media_status text not null default 'available';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'photos_media_status_check' and conrelid = 'public.photos'::regclass) then
    alter table public.photos add constraint photos_media_status_check
      check (media_status in ('available', 'missing')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'posts_media_status_check' and conrelid = 'public.posts'::regclass) then
    alter table public.posts add constraint posts_media_status_check
      check (media_status in ('available', 'missing')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'videos_media_status_check' and conrelid = 'public.videos'::regclass) then
    alter table public.videos add constraint videos_media_status_check
      check (media_status in ('available', 'missing')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'users_media_status_check' and conrelid = 'public.users'::regclass) then
    alter table public.users add constraint users_media_status_check
      check (media_status in ('available', 'missing')) not valid;
  end if;
end $$;
