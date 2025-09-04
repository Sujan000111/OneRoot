# Backend Setup Guide

## New Features Added

1. **Profile Image Upload**: Users can now upload profile pictures during onboarding
2. **Additional Fields**: Added taluk, village, and pincode fields to user profiles
3. **Enhanced Validation**: Better form validation and error handling
4. **Supabase Storage**: Images are stored in Supabase Storage for better integration

## Installation

### 1. Install New Dependencies

```bash
cd backend
npm install multer
```

### 2. Create Uploads Directory

Create a local uploads directory for temporary file storage:

```bash
mkdir uploads
```

Add this directory to your `.gitignore`:

```gitignore
uploads/
```

### 3. Supabase Storage Setup

1. **Create Storage Bucket**: In your Supabase dashboard, go to Storage and create a new bucket called `profile-images`

2. **Configure Bucket Policies**: Set up the following RLS (Row Level Security) policies:

```sql
-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile images
CREATE POLICY "Public read access to profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

3. **Bucket Settings**: Make sure the bucket is set to public for read access

### 4. Database Schema Updates

The users table now includes:
- `state` (character varying)
- `profileimage` (text)

Make sure your Supabase database has these fields. You can run the following SQL:

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS state character varying,
ADD COLUMN IF NOT EXISTS profileimage text;
```

## API Endpoints

### POST /user/profile
- **Purpose**: Create or update user profile
- **Body**: `{ name, state, district, taluk, village, pincode }`
- **Headers**: `Authorization: Bearer <token>`

### POST /user/profile/image
- **Purpose**: Upload profile image to Supabase Storage
- **Body**: `profileImage` (multipart/form-data)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns public URL of uploaded image

## File Upload Flow

1. **Temporary Storage**: File is temporarily stored locally using multer
2. **Supabase Upload**: File is read and uploaded to Supabase Storage
3. **Cleanup**: Local temporary file is deleted
4. **Profile Update**: User profile is updated with the image URL
5. **Public URL**: Returns public URL for the uploaded image

## Storage Structure

Images are stored in Supabase Storage with the following structure:
```
profile-images/
├── users/
│   ├── {user-id}/
│   │   ├── profile-{user-id}-{timestamp}.jpg
│   │   └── profile-{user-id}-{timestamp}.png
```

## Frontend Dependencies

Install the required frontend dependency:

```bash
npm install expo-image-picker
```

## Testing

1. Start the backend server: `npm run dev`
2. Test image upload with a tool like Postman
3. Verify the profile creation with all new fields
4. Check that images are stored in Supabase Storage
5. Verify public URLs are accessible

## Security Notes

- File uploads are limited to 5MB
- Only image files are allowed
- Files are stored in Supabase Storage with proper RLS policies
- Temporary local files are automatically cleaned up
- Users can only access their own profile images

## Troubleshooting

### Common Issues

1. **Storage Bucket Not Found**: Make sure the `profile-images` bucket exists in Supabase
2. **Permission Denied**: Check RLS policies are properly configured
3. **File Upload Fails**: Verify the uploads directory exists and has write permissions
4. **Image Not Accessible**: Ensure bucket is set to public for read access
