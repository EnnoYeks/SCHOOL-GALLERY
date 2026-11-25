-- Atomic renumber helper for media-slot drag-and-drop ordering.
create or replace function public.hshs_renumber_media_slot_items(p_slot_key text)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  with ranked as (
    select id, row_number() over (order by position asc, created_at asc, id asc)::double precision as next_position
    from public.media_slot_items
    where slot_key = p_slot_key
  )
  update public.media_slot_items item
  set position = ranked.next_position,
      updated_at = now()
  from ranked
  where item.id = ranked.id;
$$;

revoke all on function public.hshs_renumber_media_slot_items(text) from public, anon, authenticated;
grant execute on function public.hshs_renumber_media_slot_items(text) to service_role;
