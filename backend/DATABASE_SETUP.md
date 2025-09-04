# Database Setup Guide

## Overview
This guide will help you set up the OneRoot database properly to avoid the "invalid input syntax" error.

## Prerequisites
- Access to your Supabase project
- Supabase SQL editor access

## Steps to Fix the Database

### 1. Run the Main Database Setup
First, run the `setup_database.sql` file in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `db/setup_database.sql`
4. Click "Run" to execute the script

This will create all the necessary tables with the correct data types.

### 2. Run the Migration (Optional)
After the main setup, you can run the migration file `db/migrations/001_update_users_table.sql` if you need to add any additional columns.

### 3. Verify the Setup
The setup script includes a verification query that will show you all the created tables.

## What Was Fixed

The original schema had several issues:
- `USER-DEFINED` data types (not valid PostgreSQL)
- `ARRAY` instead of `text[]` for array columns
- Missing proper data type definitions

## Current Schema

The corrected schema includes:
- `users` table with proper varchar/text columns
- `buyers` table with proper data types
- `locations` table for geographic data
- `otps` table for authentication
- `auth_users` table for user management

## Testing

After setup, you can test the API endpoints:
- `POST /user/profile` - Create/update user profile
- `GET /user/me` - Get current user info

## Troubleshooting

If you still get "invalid input syntax" errors:
1. Make sure you ran `setup_database.sql` first
2. Check that all tables were created successfully
3. Verify the column data types in the Supabase dashboard
4. Ensure your environment variables are properly set

## Next Steps

Once the database is set up:
1. Start your backend server: `npm run dev`
2. Test the API endpoints
3. Remove any hardcoded demo tokens from your frontend
4. Implement proper authentication flow
