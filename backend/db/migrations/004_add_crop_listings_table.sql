-- Migration: Add crop_listings table for user-created crop listings
-- This table stores crop listings created through AddCropModal

-- Create crop_listings table
CREATE TABLE IF NOT EXISTS public.crop_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop_type public.markets_cropnames_enum NOT NULL,
  crop_variety text,
  expected_price numeric(10,2) NOT NULL,
  quantity text NOT NULL,
  is_ready boolean NOT NULL DEFAULT false,
  ready_in_days integer,
  images text[], -- Array of image URLs/paths
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT crop_listings_pkey PRIMARY KEY (id),
  CONSTRAINT crop_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crop_listings_user_id ON public.crop_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_listings_crop_type ON public.crop_listings(crop_type);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status ON public.crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_crop_listings_created_at ON public.crop_listings(created_at);

-- Verify the table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'crop_listings';
