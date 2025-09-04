# Complete Database Setup Guide - Final Version

## Overview
This guide provides the complete database setup for the OneRoot application with full crop management functionality.

## Database Tables

### 1. Core Tables
- `auth_users` - User authentication data
- `users` - User profile information  
- `buyers` - Buyer information
- `locations` - Location data
- `otps` - OTP verification data

### 2. Crop Management Tables
- `user_crops` - User's selected crops (from onboarding)
- `crop_listings` - User-created crop listings (from AddCropModal)

## Setup Instructions

### Step 1: Run Main Database Setup
Execute in Supabase SQL Editor:
```sql
-- Run: setup_database.sql
-- Creates all basic tables and enum types
```

### Step 2: Run User Crops Migration
Execute in Supabase SQL Editor:
```sql
-- Run: 002_add_user_crops_table.sql
-- Adds user_crops table for detailed crop management
```

### Step 3: Run Crop Listings Migration
Execute in Supabase SQL Editor:
```sql
-- Run: 004_add_crop_listings_table.sql
-- Adds crop_listings table for user-created listings
```

### Step 4: Migrate Existing Data
Execute in Supabase SQL Editor:
```sql
-- Run: 003_migrate_existing_crops.sql
-- Migrates existing crops from users.cropnames to user_crops table
```

## Database Schema Details

### user_crops Table
Stores crops selected during onboarding:
```sql
CREATE TABLE public.user_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  crop_type public.markets_cropnames_enum NOT NULL,
  crop_image text,
  expected_price numeric(10,2),
  quantity text,
  next_harvest_date date,
  last_harvest_date date,
  status text DEFAULT 'off' CHECK (status IN ('on', 'off', 'days')),
  days_left integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, crop_type)
);
```

### crop_listings Table
Stores crop listings created through AddCropModal:
```sql
CREATE TABLE public.crop_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  crop_type public.markets_cropnames_enum NOT NULL,
  crop_variety text,
  expected_price numeric(10,2) NOT NULL,
  quantity text NOT NULL,
  is_ready boolean NOT NULL DEFAULT false,
  ready_in_days integer,
  images text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## API Endpoints

### User Crops Endpoints
- `GET /user-crops` - Get all crops for authenticated user
- `GET /user-crops/:cropType` - Get specific crop details
- `PUT /user-crops/:cropType` - Update crop details
- `PATCH /user-crops/:cropType/status` - Toggle crop status

### Crop Listings Endpoints
- `GET /crop-listings/crop-types` - Get available crop types with images
- `GET /crop-listings` - Get all crop listings for authenticated user
- `POST /crop-listings` - Create a new crop listing
- `PUT /crop-listings/:listingId` - Update a crop listing
- `DELETE /crop-listings/:listingId` - Delete a crop listing

## Frontend Integration

### AddCropModal Features
- ✅ **Crop Selection**: Visual crop selection with images
- ✅ **Expected Price**: Price per kg input
- ✅ **Crop Ready**: Yes/No toggle
- ✅ **Crop Variety**: Text input for variety
- ✅ **Crop Quantity**: Quantity input
- ✅ **Ready in Days**: Stepper input (when crop not ready)
- ✅ **Database Integration**: All data saved to crop_listings table
- ✅ **Real-time Updates**: New crops appear immediately

### BookCardModal Features
- ✅ **Crop Details**: View and edit crop information
- ✅ **Status Toggle**: Turn crops on/off
- ✅ **Price Management**: Set expected prices
- ✅ **Harvest Dates**: Set next and last harvest dates
- ✅ **Database Integration**: All changes saved to user_crops table

### CropCellCard Features
- ✅ **Status Display**: Visual status badges (on/off/days)
- ✅ **Real-time Updates**: Status changes reflect immediately
- ✅ **Enhanced Styling**: Borders, shadows, and colors

## Data Flow

### 1. Onboarding Flow
1. User completes onboarding and selects crops
2. Crops stored in `users.cropnames` (enum array)
3. Crops migrated to `user_crops` table for detailed management

### 2. AddCropModal Flow
1. User opens AddCropModal
2. Selects crop type from available options
3. Sets expected price, variety, quantity
4. Chooses if crop is ready or ready in X days
5. Data saved to `crop_listings` table
6. New crop appears on home screen

### 3. BookCardModal Flow
1. User clicks on crop card
2. Opens BookCardModal with crop details
3. Can update price, dates, quantity, status
4. Changes saved to `user_crops` table
5. Status changes reflect in CropCellCard

## Table Relationships

```
users (1) -----> (many) user_crops
users (1) -----> (many) crop_listings
user_crops.crop_type -----> markets_cropnames_enum
crop_listings.crop_type -----> markets_cropnames_enum
```

## Testing the Setup

### 1. Test Database Connection
```bash
curl http://localhost:3000/test-db
```

### 2. Test User Crops
```bash
curl http://localhost:3000/test-user-crops
```

### 3. Test Crop Listings
```bash
curl http://localhost:3000/crop-listings/crop-types
```

### 4. Test Complete Flow
1. Complete onboarding and select crops
2. Open AddCropModal and create a crop listing
3. Click on crop card to open BookCardModal
4. Update crop details and toggle status
5. Verify changes in database and UI

## Verification Queries

Check if all tables exist:
```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Check table structures:
```sql
\d user_crops
\d crop_listings
```

Check data:
```sql
SELECT * FROM user_crops LIMIT 5;
SELECT * FROM crop_listings LIMIT 5;
```

## Next Steps

After setting up the database:

1. **Restart backend server** to load new routes
2. **Test the complete flow**:
   - Onboarding → Crop selection
   - AddCropModal → Create listings
   - BookCardModal → Manage crops
   - Status changes → Visual updates
3. **Verify in Supabase** that data is being stored correctly

The system is now fully functional with complete database integration for crop management! 🚀
