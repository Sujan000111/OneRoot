-- Supabase OTP + Phone Auth minimal schema
-- Run in Supabase SQL editor

-- Extensions (safe if already enabled)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1) Users table for phone-auth users
create table if not exists public.auth_users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  created_at timestamp without time zone not null default now()
);

-- Keep RLS ON; backend uses service role for writes
alter table public.auth_users enable row level security;

-- Optional: allow read for authenticated role (adjust as needed)
-- (IF NOT EXISTS is not supported for policies; drop if exists, then create)
DROP POLICY IF EXISTS auth_users_select_authenticated ON public.auth_users;
CREATE POLICY auth_users_select_authenticated
ON public.auth_users
FOR SELECT
TO authenticated
USING (true);

-- 2) Transient OTP store
create table if not exists public.otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp text not null,
  expires_at timestamp without time zone not null,
  created_at timestamp without time zone not null default now()
);

-- Helpful indexes
create index if not exists idx_otps_phone on public.otps (phone);
create index if not exists idx_otps_expires_at on public.otps (expires_at);

-- Keep RLS ON; backend uses service role for all OTP operations
alter table public.otps enable row level security;

-- No public policies needed on otps when using service role

-- Notes:
-- - Backend should use SUPABASE_SERVICE_ROLE_KEY for inserting/selecting/deleting OTPs and upserting users.
-- - If you choose not to use service role, you must add explicit RLS policies for anon/auth roles (not recommended).
