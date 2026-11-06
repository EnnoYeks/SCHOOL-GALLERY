-- HSHS World: persist intrinsic media dimensions for stable masonry layout.
-- Safe to run more than once. Existing rows remain NULL until backfilled.
alter table public.photos
  add column if not exists width integer,
  add column if not exists height integer;

alter table public.videos
  add column if not exists width integer,
  add column if not exists height integer;

alter table public.posts
  add column if not exists width integer,
  add column if not exists height integer;
