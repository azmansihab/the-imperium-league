create extension if not exists pgcrypto;

create table if not exists public.research_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text,
  user_agent text,
  answers jsonb not null
);

alter table public.research_responses enable row level security;

drop policy if exists "Anyone can submit research responses" on public.research_responses;
create policy "Anyone can submit research responses"
on public.research_responses
for insert
to anon, authenticated
with check (true);
