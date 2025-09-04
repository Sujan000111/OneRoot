-- Supabase Storage Setup for Profile Images (Idempotent)
-- NOTE: Run this as the database owner (Run as owner in Supabase SQL editor)

-- 1) Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2) Enable RLS on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3) Drop existing policies if they exist (to allow repeatable runs)
DROP POLICY IF EXISTS "Public read access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 4) Create policies
-- Public read for objects in the profile-images bucket
CREATE POLICY "Public read access to profile images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile-images'
);

-- Authenticated users may upload into their own user folder: users/{auth.uid()}/...
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users may update objects inside their own user folder
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users may delete objects inside their own user folder
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5) Verification
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname='storage' AND tablename='objects' ORDER BY policyname;
