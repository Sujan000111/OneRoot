-- Migration: Migrate existing crops from users.cropnames to user_crops table
-- This migration populates the user_crops table with existing crop data

-- Insert crops from users.cropnames into user_crops table
INSERT INTO public.user_crops (user_id, crop_type, status, created_at, updated_at)
SELECT 
    u.id as user_id,
    unnest(u.cropnames) as crop_type,
    'off' as status,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE u.cropnames IS NOT NULL 
AND array_length(u.cropnames, 1) > 0
ON CONFLICT (user_id, crop_type) DO NOTHING;

-- Verify the migration
SELECT 
    uc.user_id,
    u.name as user_name,
    uc.crop_type,
    uc.status,
    uc.created_at
FROM public.user_crops uc
JOIN public.users u ON uc.user_id = u.id
ORDER BY u.name, uc.crop_type;
