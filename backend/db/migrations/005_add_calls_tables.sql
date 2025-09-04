-- Calls feature tables
-- Run in Supabase SQL editor after previous migrations

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1) calls table: logs each call event
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  caller_user_id uuid not null references public.users(id) on delete cascade,
  callee_user_id uuid references public.users(id) on delete set null,
  callee_phone text not null,
  direction text not null check (direction in ('outgoing','incoming')),
  status text not null check (status in ('dialed','missed','answered','rejected','failed','completed')),
  started_at timestamp without time zone not null default now(),
  ended_at timestamp without time zone,
  duration_seconds integer,
  context jsonb default '{}'::jsonb,
  created_at timestamp without time zone not null default now()
);

create index if not exists idx_calls_caller on public.calls (caller_user_id, started_at desc);
create index if not exists idx_calls_callee on public.calls (callee_user_id, started_at desc);
create index if not exists idx_calls_phone on public.calls (callee_phone);

-- 2) optional: call_participants for future conferencing (kept simple now)
create table if not exists public.call_participants (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  role text check (role in ('caller','callee','observer')),
  created_at timestamp without time zone not null default now()
);

create index if not exists idx_call_participants_call on public.call_participants (call_id);

-- RLS optional; backend uses service role. Enable and allow authenticated read if needed
alter table public.calls enable row level security;
alter table public.call_participants enable row level security;

-- Read policy for authenticated users to view their own calls
do $$ begin
  execute 'drop policy if exists calls_select_own on public.calls';
  execute 'create policy calls_select_own on public.calls for select to authenticated using (caller_user_id = auth.uid() or callee_user_id = auth.uid())';
exception when others then null; end $$;

-- Insert/update/delete restricted to service role by default (no public policies)


