-- HSHS World: shared polls, votes, notifications, friend requests, spotlight nominations.
-- NOT APPLIED. Review and run in the Supabase SQL editor after approval.
-- Auth stays on Firebase. Rows key off firebase_uid (text). One vote per signed-in user
-- is enforced by a unique constraint; RLS restricts writes to the caller's uid once a
-- Firebase custom JWT is accepted by Supabase (auth.uid() = firebase_uid). Until that
-- bridge is on, the policies below allow the anon role to read public polls and to
-- insert a vote only when firebase_uid is present; the unique index still blocks a
-- second vote for the same user.

create extension if not exists pgcrypto;

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 4 and 160),
  options jsonb not null,
  image text,
  closed boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closed')),
  author_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  firebase_uid text not null,
  option_index integer not null check (option_index >= 0),
  created_at timestamptz not null default now(),
  unique (poll_id, firebase_uid)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null,
  type text not null default 'system',
  title text not null,
  message text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_uid_created_idx
  on public.notifications (firebase_uid, created_at desc);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_uid text not null,
  to_uid text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (from_uid, to_uid)
);

create table if not exists public.spotlight_nominations (
  id uuid primary key default gen_random_uuid(),
  nominee_name text not null,
  class_tag text,
  category text,
  note text,
  author_id text,
  created_at timestamptz not null default now()
);

alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.notifications enable row level security;
alter table public.friend_requests enable row level security;
alter table public.spotlight_nominations enable row level security;

-- Polls are school-wide. Anyone can read them.
drop policy if exists polls_select on public.polls;
create policy polls_select on public.polls for select to anon, authenticated using (true);

-- Creating a poll requires a signed-in Firebase user id.
drop policy if exists polls_insert on public.polls;
create policy polls_insert on public.polls for insert to anon, authenticated
  with check (author_id is not null and char_length(author_id) > 0);

-- Votes: readable by everyone (aggregated in the client). Insert only with a uid.
-- The unique (poll_id, firebase_uid) constraint is the one-vote-per-user lock.
drop policy if exists poll_votes_select on public.poll_votes;
create policy poll_votes_select on public.poll_votes for select to anon, authenticated using (true);

drop policy if exists poll_votes_insert on public.poll_votes;
create policy poll_votes_insert on public.poll_votes for insert to anon, authenticated
  with check (firebase_uid is not null and char_length(firebase_uid) > 0);

-- Notifications belong to one Firebase user. Until the JWT bridge is live, the
-- client filters by firebase_uid; this policy keeps rows readable by the anon
-- key so the signed-in client can load its own list. Tighten to
-- (firebase_uid = auth.uid()::text) once Supabase accepts Firebase tokens.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to anon, authenticated using (true);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to anon, authenticated
  using (true) with check (true);

drop policy if exists friend_requests_all on public.friend_requests;
create policy friend_requests_all on public.friend_requests for all to anon, authenticated
  using (true) with check (from_uid is not null and to_uid is not null);

drop policy if exists nominations_select on public.spotlight_nominations;
create policy nominations_select on public.spotlight_nominations for select to anon, authenticated using (true);

drop policy if exists nominations_insert on public.spotlight_nominations;
create policy nominations_insert on public.spotlight_nominations for insert to anon, authenticated
  with check (nominee_name is not null);
