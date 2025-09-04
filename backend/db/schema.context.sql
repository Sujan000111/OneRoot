-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Create cropnames enum type
CREATE TYPE public.markets_cropnames_enum AS ENUM (
  'tender-coconut',
  'dry-coconut',
  'turmeric',
  'banana',
  'sunflower',
  'maize'
);

CREATE TABLE public.auth_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.buyers (
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

CREATE TABLE public.locations (
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

CREATE TABLE public.otps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT otps_pkey PRIMARY KEY (id)
);

CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);

CREATE TABLE public.users (
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
