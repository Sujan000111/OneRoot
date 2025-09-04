-- Migration: Add user_crops table for detailed crop management
-- This migration adds the user_crops table to store detailed information about each user's crops

-- Create user_crops table for detailed crop management
CREATE TABLE IF NOT EXISTS public.user_crops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop_type public.markets_cropnames_enum NOT NULL,
  crop_image text,
  expected_price numeric(10,2),
  quantity text,
  next_harvest_date date,
  last_harvest_date date,
  status text NOT NULL DEFAULT 'off' CHECK (status IN ('on', 'off', 'days')),
  days_left integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_crops_pkey PRIMARY KEY (id),
  CONSTRAINT user_crops_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_crops_user_crop_unique UNIQUE (user_id, crop_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_crops_user_id ON public.user_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crops_crop_type ON public.user_crops(crop_type);
CREATE INDEX IF NOT EXISTS idx_user_crops_status ON public.user_crops(status);

-- Verify the table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_crops';
