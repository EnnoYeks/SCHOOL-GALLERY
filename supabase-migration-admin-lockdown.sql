-- HSHS World admin lockdown.
-- Intentionally NOT applied to production. Review existing policies before applying.
-- Preserves current non-admin INSERT/UPDATE/DELETE policies on posts/photos/videos.
-- Admin writes use the Cloudflare Worker service-role client, which bypasses RLS.

alter table public.posts enable row level security;
alter table public.photos enable row level security;
alter table public.videos enable row level security;
alter table public.events enable row level security;

drop policy if exists "HSHS public posts read" on public.posts;
create policy "HSHS public posts read"
  on public.posts for select to anon, authenticated
  using (status = 'published' or is_official is false);

drop policy if exists "HSHS public photos read" on public.photos;
create policy "HSHS public photos read"
  on public.photos for select to anon, authenticated
  using (true);

drop policy if exists "HSHS public videos read" on public.videos;
create policy "HSHS public videos read"
  on public.videos for select to anon, authenticated
  using (true);

drop policy if exists "HSHS public events read" on public.events;
create policy "HSHS public events read"
  on public.events for select to anon, authenticated
  using (true);

-- Events are read-only to browser roles. Admin event writes are Worker/service-role only.
revoke insert, update, delete on public.events from anon, authenticated;

-- Column-level revokes are defense-in-depth. The trigger below also protects these
-- fields even if a role already has table-level UPDATE privileges.
revoke update (featured, featured_at, is_official, author_role)
  on public.posts from anon, authenticated;
revoke update (featured, featured_at, is_official, author_role)
  on public.photos from anon, authenticated;
revoke update (featured, featured_at, is_official, author_role)
  on public.videos from anon, authenticated;

create or replace function public.hshs_block_browser_admin_column_changes()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') and (
    new.featured is distinct from old.featured
    or new.featured_at is distinct from old.featured_at
    or new.is_official is distinct from old.is_official
    or new.author_role is distinct from old.author_role
  ) then
    raise exception 'Admin-only content fields cannot be changed by browser roles'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.hshs_block_browser_admin_column_changes() from public, anon, authenticated;

drop trigger if exists hshs_protect_admin_fields_posts on public.posts;
create trigger hshs_protect_admin_fields_posts
  before update on public.posts
  for each row execute function public.hshs_block_browser_admin_column_changes();

drop trigger if exists hshs_protect_admin_fields_photos on public.photos;
create trigger hshs_protect_admin_fields_photos
  before update on public.photos
  for each row execute function public.hshs_block_browser_admin_column_changes();

drop trigger if exists hshs_protect_admin_fields_videos on public.videos;
create trigger hshs_protect_admin_fields_videos
  before update on public.videos
  for each row execute function public.hshs_block_browser_admin_column_changes();
