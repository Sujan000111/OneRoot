# Complete Database Setup Guide

## Overview
This guide will help you set up the complete database structure for the OneRoot application with all the necessary tables and functionality.

## Database Tables

### 1. Core Tables
- `auth_users` - Stores user authentication data
- `users` - Stores user profile information
- `buyers` - Stores buyer information
- `locations` - Stores location data
- `otps` - Stores OTP verification data

### 2. New Crop Management Table
- `user_crops` - Stores detailed crop information for each user

## Setup Instructions

### Step 1: Run the Main Database Setup
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Run this first: setup_database.sql
-- This creates all the basic tables and the enum type
```

### Step 2: Run the User Crops Migration
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Run this second: 002_add_user_crops_table.sql
-- This adds the user_crops table for detailed crop management
```

### Step 3: Verify Setup
Run this query to verify all tables are created:

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- auth_users
- buyers
- locations
- otps
- user_crops
- users

## User Crops Table Structure

The `user_crops` table stores detailed information about each user's crops:

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

## API Endpoints

### User Crops Endpoints
- `GET /user-crops` - Get all crops for authenticated user
- `GET /user-crops/:cropType` - Get specific crop details
- `PUT /user-crops/:cropType` - Update crop details
- `PATCH /user-crops/:cropType/status` - Toggle crop status (on/off)

### Example API Calls

#### Get User Crops
```bash
GET /user-crops
Authorization: Bearer <jwt_token>
```

#### Update Crop Details
```bash
PUT /user-crops/tender-coconut
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "expected_price": 25.50,
  "quantity": "100 kg",
  "next_harvest_date": "2025-02-15",
  "last_harvest_date": "2025-01-15"
}
```

#### Toggle Crop Status
```bash
PATCH /user-crops/tender-coconut/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "on"
}
```

## Frontend Integration

### BookCardModal Features
The BookCardModal now supports:
- ✅ **Add/Edit Expected Price** - Users can set and update crop prices
- ✅ **Add/Edit Quantity** - Users can specify crop quantities
- ✅ **Add/Edit Harvest Dates** - Users can set next and last harvest dates
- ✅ **Toggle Crop Status** - Users can turn crops on/off
- ✅ **Database Integration** - All changes are saved to the database
- ✅ **Real-time Updates** - Changes reflect immediately in the UI

### Crop Status Types
- `on` - Crop is active and ready for sale
- `off` - Crop is inactive
- `days` - Crop will be ready in X days

## Testing the Setup

### 1. Test Database Connection
```bash
curl http://localhost:3000/test-db
```

### 2. Test User Crops Table
```bash
curl http://localhost:3000/test-tables
```

### 3. Test Crop Update
```bash
curl -X POST http://localhost:3000/test-cropnames
```

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you've run both SQL files in order
   - Check that the enum type `markets_cropnames_enum` exists

2. **"invalid input syntax" error**
   - Ensure you're using the correct enum values: 'tender-coconut', 'dry-coconut', 'turmeric', 'banana', 'sunflower', 'maize'

3. **Foreign key constraint errors**
   - Make sure the `users` table exists and has data before creating `user_crops` entries

### Verification Queries

Check if the enum type exists:
```sql
SELECT typname FROM pg_type WHERE typname = 'markets_cropnames_enum';
```

Check if the user_crops table exists:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'user_crops';
```

Check table structure:
```sql
\d user_crops
```

## Next Steps

After setting up the database:

1. **Restart your backend server** to load the new routes
2. **Test the complete flow**:
   - Complete onboarding and select crops
   - Click on a crop card to open BookCardModal
   - Try updating crop details (price, quantity, dates)
   - Toggle crop status on/off
   - Verify changes are saved in the database

3. **Check Supabase** to see the data being stored in the `user_crops` table

The system is now fully functional with database integration for crop management!
