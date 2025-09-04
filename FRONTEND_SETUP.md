# Frontend Setup Guide

## New Features Added

1. **Enhanced Onboarding Form**: Added taluk, village, and pincode fields
2. **Profile Photo Upload**: Users can take photos or select from gallery
3. **Improved Validation**: Better form validation with pincode format checking
4. **Loading States**: Upload progress indicators and disabled states
5. **Supabase Storage**: Images are stored in Supabase Storage for better integration

## Installation

### 1. Install New Dependencies

```bash
npm install expo-image-picker
```

### 2. Permissions Setup

Add the following permissions to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends.",
          "cameraPermission": "The app accesses your camera to let you take photos."
        }
      ]
    ]
  }
}
```

## New Fields Added

### OnboardingScreen1.tsx

The following new state variables and fields have been added:

- `taluk`: User's taluk/block
- `village`: User's village
- `pincode`: 6-digit postal code
- `profileImage`: Profile photo URI
- `isUploading`: Upload state indicator

### Form Validation

- All fields are now required
- Pincode must be exactly 6 digits
- Profile image is optional but recommended

## Photo Upload Features

### Image Picker Options

Users can:
1. **Select from Gallery**: Choose existing photos
2. **Take New Photo**: Use camera to capture new image
3. **Image Editing**: Crop and adjust photos before upload

### Upload Process

1. Image is selected/captured
2. Image is uploaded to backend (temporarily stored locally)
3. Backend uploads image to Supabase Storage
4. Profile is created with image URL from Supabase
5. User proceeds to next onboarding step

## UI Improvements

### Profile Picture Section

- Circular profile picture display
- Camera icon overlay for new users
- "Tap to add photo" instruction text
- Image preview after selection

### Form Fields

- All fields now use proper TextInput components
- Pincode field has numeric keyboard and 6-character limit
- Better visual hierarchy and spacing

### Button States

- Loading state during profile creation
- Disabled state while uploading
- Progress text feedback

## API Integration

### Profile Creation

```typescript
const response = await fetch(buildApiUrl('/user/profile'), {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    name, 
    state, 
    district, 
    taluk, 
    village, 
    pincode 
  }),
});
```

### Image Upload

```typescript
const formData = new FormData();
formData.append('profileImage', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'profile.jpg',
} as any);

const response = await fetch(buildApiUrl('/user/profile/image'), {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
  body: formData,
});

// Response includes Supabase Storage public URL
const { data } = await response.json();
const imageUrl = data.imageUrl; // Supabase Storage public URL
```

## Storage Benefits

### Supabase Storage Integration

- **Seamless Integration**: Works with existing Supabase setup
- **Automatic Cleanup**: Temporary files are automatically removed
- **Public URLs**: Images are immediately accessible via public URLs
- **Security**: RLS policies ensure users can only access their own images
- **Scalability**: Supabase handles storage scaling automatically

## Error Handling

- Graceful fallback if image upload fails
- User-friendly error messages
- Form validation with clear feedback
- Network error handling
- Automatic cleanup of failed uploads

## Testing

1. Test form validation with empty fields
2. Test pincode format validation
3. Test photo selection from gallery
4. Test camera photo capture
5. Test profile creation with and without photos
6. Test error scenarios (network issues, invalid data)
7. Verify images are accessible via Supabase Storage URLs

## Notes

- Profile image is optional but enhances user experience
- All location fields are required for better user targeting
- Pincode validation ensures data quality
- Image upload happens before profile creation for better UX
- Images are stored in Supabase Storage with proper security policies
- Public URLs are returned immediately for frontend use
