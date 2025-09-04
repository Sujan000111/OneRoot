-- Database setup script for OneRoot
-- Run this in your Supabase SQL editor

-- Create auth_users table
CREATE TABLE IF NOT EXISTS public.auth_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);

-- Create cropnames enum type
CREATE TYPE IF NOT EXISTS public.markets_cropnames_enum AS ENUM (
  'tender-coconut',
  'dry-coconut',
  'turmeric',
  'banana',
  'sunflower',
  'maize'
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  name character varying,
  state character varying NOT NULL,
  origin text,
  cropnames public.markets_cropnames_enum[],
  coordinates text,
  village character varying NOT NULL,
  taluk character varying NOT NULL,
  district character varying NOT NULL,
  pincode character varying NOT NULL,
  address character varying,
  profileimage text,
  createdat timestamp without time zone DEFAULT now(),
  updatedat timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS public.buyers (
  id uuid NOT NULL,
  name text,
  village text,
  taluk text,
  district text,
  pincode character varying,
  mobilenumber text,
  language text,
  identity text,
  fcmtoken text,
  deviceid text,
  isverified boolean DEFAULT false,
  cropnames public.markets_cropnames_enum[],
  preferredpaymentmodes text[],
  knownlanguages text[],
  activity double precision,
  score double precision,
  meta jsonb,
  createdat timestamp without time zone DEFAULT now(),
  updatedat timestamp without time zone DEFAULT now(),
  latitude double precision,
  longitude double precision,
  notes text,
  profileimage text,
  userstatus text,
  lastactiveat timestamp without time zone,
  enapp boolean DEFAULT false,
  userplan text,
  CONSTRAINT buyers_pkey PRIMARY KEY (id)
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL,
  village character varying,
  officename character varying,
  pincode character varying,
  taluk character varying,
  district character varying,
  state character varying,
  createdat timestamp without time zone DEFAULT now(),
  updatedat timestamp without time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- Create otps table
CREATE TABLE IF NOT EXISTS public.otps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT otps_pkey PRIMARY KEY (id)
);

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
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
CREATE INDEX IF NOT EXISTS idx_users_village ON public.users(village);
CREATE INDEX IF NOT EXISTS idx_users_pincode ON public.users(pincode);
CREATE INDEX IF NOT EXISTS idx_buyers_village ON public.buyers(village);
CREATE INDEX IF NOT EXISTS idx_buyers_district ON public.buyers(district);
CREATE INDEX IF NOT EXISTS idx_buyers_pincode ON public.buyers(pincode);
CREATE INDEX IF NOT EXISTS idx_user_crops_user_id ON public.user_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crops_crop_type ON public.user_crops(crop_type);
CREATE INDEX IF NOT EXISTS idx_user_crops_status ON public.user_crops(status);

-- Verify the tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
