-- Run this in the Supabase SQL editor
-- Adds a simple view counter that can be called from the client

-- Optional: ensure views column exists and defaults to 0
alter table videos add column if not exists views integer default 0;
alter table photos add column if not exists likes integer default 0;

-- Function to increment video views by 1
create or replace function increment_video_views(video_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update videos set views = coalesce(views, 0) + 1 where id = video_id;
end;
$$;

-- Grant execute to anon/authenticated (adjust if you use stricter RLS)
grant execute on function increment_video_views(uuid) to anon, authenticated;
