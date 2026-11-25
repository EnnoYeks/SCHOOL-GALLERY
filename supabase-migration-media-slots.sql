-- HSHS World central editorial media slots.
-- Applied to Supabase project hhlogdqpgjiajeufwnop on 2026-11-25.
-- media_table is required because media records live in three separate tables
-- (posts, photos, videos) and their UUIDs are not globally unique.

create table if not exists public.media_slots (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,63}$'),
  label text not null,
  page text not null,
  layout text not null check (layout in ('carousel','grid','strip','card')),
  mode text not null default 'manual' check (mode in ('manual','latest','most_liked','mixed')),
  max_items integer not null default 6 check (max_items between 1 and 100),
  aspect_ratio text not null default '16/9',
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_slot_items (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null references public.media_slots(key) on delete cascade,
  media_table text not null check (media_table in ('posts','photos','videos')),
  media_id uuid not null,
  position double precision not null,
  caption text check (caption is null or char_length(caption) <= 2000),
  link_url text check (link_url is null or link_url ~* '^https?://'),
  focal_x real not null default 0.5 check (focal_x between 0 and 1),
  focal_y real not null default 0.5 check (focal_y between 0 and 1),
  starts_at timestamptz,
  ends_at timestamptz,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_slot_item_dates_valid check (starts_at is null or ends_at is null or starts_at < ends_at),
  constraint media_slot_item_unique_media unique (slot_key, media_table, media_id)
);

create index if not exists media_slot_items_slot_position_idx
  on public.media_slot_items (slot_key, position);
create index if not exists media_slot_items_active_window_idx
  on public.media_slot_items (slot_key, visible, starts_at, ends_at);

alter table public.media_slots enable row level security;
alter table public.media_slot_items enable row level security;

revoke all on table public.media_slots, public.media_slot_items from public, anon, authenticated;
grant select on table public.media_slots, public.media_slot_items to anon, authenticated;
grant all on table public.media_slots, public.media_slot_items to service_role;

drop policy if exists "Public can read visible media slots" on public.media_slots;
create policy "Public can read visible media slots"
  on public.media_slots
  for select
  to anon, authenticated
  using (visible is true);

drop policy if exists "Public can read active visible media slot items" on public.media_slot_items;
create policy "Public can read active visible media slot items"
  on public.media_slot_items
  for select
  to anon, authenticated
  using (
    visible is true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
    and exists (
      select 1
      from public.media_slots s
      where s.key = media_slot_items.slot_key
        and s.visible is true
    )
  );

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.cleanup_media_slot_items_on_media_delete()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  delete from public.media_slot_items
  where media_table = tg_table_name
    and media_id = old.id;
  return old;
end;
$$;

revoke all on function private.cleanup_media_slot_items_on_media_delete() from public, anon, authenticated;

drop trigger if exists cleanup_media_slot_items_after_posts_delete on public.posts;
create trigger cleanup_media_slot_items_after_posts_delete
  after delete on public.posts
  for each row execute function private.cleanup_media_slot_items_on_media_delete();

drop trigger if exists cleanup_media_slot_items_after_photos_delete on public.photos;
create trigger cleanup_media_slot_items_after_photos_delete
  after delete on public.photos
  for each row execute function private.cleanup_media_slot_items_on_media_delete();

drop trigger if exists cleanup_media_slot_items_after_videos_delete on public.videos;
create trigger cleanup_media_slot_items_after_videos_delete
  after delete on public.videos
  for each row execute function private.cleanup_media_slot_items_on_media_delete();

insert into public.media_slots (key, label, page, layout, mode, max_items, aspect_ratio)
values
  ('home_hero', 'Homepage hero', 'home', 'carousel', 'manual', 6, '16/9'),
  ('home_featured', 'Featured Today', 'home', 'grid', 'manual', 6, '16/9'),
  ('home_trending_left', 'Trending Today · Left', 'home', 'card', 'manual', 1, '16/9'),
  ('home_trending_right', 'Trending Today · Right', 'home', 'card', 'manual', 1, '16/9'),
  ('videos_page', 'Videos page', 'videos', 'grid', 'latest', 12, '16/9'),
  ('photos_page', 'Photos page', 'photos', 'grid', 'latest', 48, '4/5'),
  ('memories_page', 'Memories page', 'memories', 'grid', 'latest', 12, '4/5'),
  ('vibe_feed', 'Vibe feed', 'vibe', 'card', 'latest', 24, '9/16'),
  ('gallery_feed', 'Gallery feed', 'gallery', 'grid', 'latest', 48, '4/5'),
  ('trending_page', 'Trending page', 'trending', 'grid', 'most_liked', 12, '16/9'),
  ('spotlight_page', 'Spotlight page', 'spotlight', 'grid', 'manual', 12, '4/5')
on conflict (key) do nothing;
