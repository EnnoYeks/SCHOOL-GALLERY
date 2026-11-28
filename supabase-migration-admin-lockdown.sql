-- HSHS World admin lockdown.
-- Intentionally NOT applied to production. Review existing policies before applying.
-- Preserves current non-admin INSERT/UPDATE/DELETE policies on posts/photos/videos.
-- Admin writes use the Cloudflare Worker service-role client, which bypasses RLS.

alter table public.posts enable row level security;
alter table public.photos enable row level security;
alter table public.videos enable row level security;
alter table public.events enable row level security;

grant select on public.posts, public.photos, public.videos, public.events to anon, authenticated;

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

-- Column revokes are dynamic because deployments may not have every admin field
-- on each media table. The trigger below remains the enforcement backstop.
do $$
declare
  tbl text;
  cols text;
begin
  foreach tbl in array array['posts','photos','videos'] loop
    select string_agg(quote_ident(column_name), ', ')
      into cols
      from information_schema.columns
      where table_schema = 'public'
        and table_name = tbl
        and column_name in ('featured','featured_at','is_official','author_role');
    if cols is not null then
      execute format('revoke update (%s) on public.%I from anon, authenticated', cols, tbl);
    end if;
  end loop;
end $$;

create or replace function public.hshs_block_browser_admin_column_changes()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  old_values jsonb := to_jsonb(old);
  new_values jsonb := to_jsonb(new);
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') and (
    new_values -> 'featured' is distinct from old_values -> 'featured'
    or new_values -> 'featured_at' is distinct from old_values -> 'featured_at'
    or new_values -> 'is_official' is distinct from old_values -> 'is_official'
    or new_values -> 'author_role' is distinct from old_values -> 'author_role'
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
