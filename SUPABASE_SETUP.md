# Supabase Setup Guide for Onboarding System

## 🗄️ **Database Schema Updates**

### **Current Issues in Your Schema**

Your current `users` table is missing these required fields:
- ❌ `state` - Required for onboarding
- ❌ `profileimage` - Required for profile photos

### **Required Changes**

1. **Add Missing Columns**
2. **Update Field Constraints**
3. **Add Performance Indexes**

## 📋 **Step-by-Step Setup**

### **Step 1: Update Database Schema**

Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS state character varying,
ADD COLUMN IF NOT EXISTS profileimage text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
CREATE INDEX IF NOT EXISTS idx_users_village ON public.users(village);
CREATE INDEX IF NOT EXISTS idx_users_pincode ON public.users(pincode);
```

### **Step 2: Create Storage Bucket**

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ **Yes** (for read access)
   - **File size limit**: 5MB (default)
   - **Allowed MIME types**: `image/*`

### **Step 3: Configure Storage Policies**

Run this SQL to set up security policies:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access to profile images
CREATE POLICY "Public read access to profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Policy: Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔍 **Verification Steps**

### **Check Database Schema**

```sql
-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected Result:**
```
column_name    | data_type        | is_nullable
---------------+------------------+-------------
id             | uuid             | NO
name           | character varying| YES
state          | character varying| YES          ← NEW
origin         | USER-DEFINED     | YES
cropnames      | ARRAY            | YES
coordinates    | USER-DEFINED     | YES
village        | character varying| YES
taluk          | character varying| YES
district       | character varying| YES
pincode        | character varying| YES
address        | character varying| YES
profileimage   | text             | YES          ← NEW
createdat      | timestamp        | YES
updatedat      | timestamp        | YES
```

### **Check Storage Policies**

```sql
-- Verify storage policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
```

**Expected Result:**
```
policyname                                    | cmd    | permissive
----------------------------------------------+--------+------------
Public read access to profile images          | SELECT | t
Users can delete their own profile images     | DELETE | t
Users can update their own profile images     | UPDATE | t
Users can upload their own profile images     | INSERT | t
```

## 🚨 **Important Notes**

### **Field Requirements**

The onboarding system requires these fields to be filled:
- ✅ `name` - User's full name
- ✅ `state` - User's state
- ✅ `district` - User's district  
- ✅ `taluk` - User's taluk/block
- ✅ `village` - User's village
- ✅ `pincode` - 6-digit postal code
- ✅ `profileimage` - Profile photo URL (optional but recommended)

### **Storage Structure**

Images will be stored in this structure:
```
profile-images/
├── users/
│   ├── {user-uuid}/
│   │   ├── profile-{user-uuid}-{timestamp}.jpg
│   │   └── profile-{user-uuid}-{timestamp}.png
```

### **Security Features**

- **RLS Enabled**: Row Level Security is active
- **User Isolation**: Users can only access their own images
- **Public Read**: Profile images are publicly readable
- **Upload Control**: Only authenticated users can upload
- **File Validation**: Only image files are allowed

## 🧪 **Testing the Setup**

### **Test Image Upload**

1. Start your backend server
2. Use Postman or similar tool to test:
   - `POST /user/profile/image`
   - Include `Authorization: Bearer <token>` header
   - Upload an image file

### **Test Profile Creation**

1. Test profile creation:
   - `POST /user/profile`
   - Include all required fields
   - Verify data is saved to database

### **Check Storage**

1. Go to Supabase Dashboard > Storage
2. Navigate to `profile-images` bucket
3. Verify images are uploaded to correct folders
4. Test public URLs are accessible

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Bucket not found"**
   - Ensure `profile-images` bucket exists
   - Check bucket name spelling

2. **"Permission denied"**
   - Verify RLS policies are created
   - Check user authentication

3. **"Column does not exist"**
   - Run the ALTER TABLE commands
   - Check for typos in column names

4. **"Storage not accessible"**
   - Ensure bucket is set to public
   - Check storage policies

### **Reset if Needed**

If you need to start over:

```sql
-- Drop storage policies
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Re-run the setup scripts
```

## ✅ **Success Checklist**

- [ ] Database schema updated with new columns
- [ ] Storage bucket `profile-images` created
- [ ] RLS policies configured
- [ ] Performance indexes added
- [ ] Test image upload successful
- [ ] Test profile creation successful
- [ ] Public URLs accessible

Once all items are checked, your onboarding system should work perfectly! 🎉

