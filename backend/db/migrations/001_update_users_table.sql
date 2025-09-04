-- Migration: Update users table for onboarding system
-- Run this in your Supabase SQL editor AFTER running setup_database.sql

-- Add missing columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS state character varying,
ADD COLUMN IF NOT EXISTS profileimage text;

-- Note: The main table structure should be created using setup_database.sql first
-- This migration only adds any additional columns that might be needed

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
CREATE INDEX IF NOT EXISTS idx_users_village ON public.users(village);
CREATE INDEX IF NOT EXISTS idx_users_pincode ON public.users(pincode);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

