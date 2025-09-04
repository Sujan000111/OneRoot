'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/api/auth.routes');
const userRoutes = require('./src/api/user.routes');
const buyersRoutes = require('./src/api/buyers.routes');
const userCropsRoutes = require('./src/api/userCrops.routes');
const cropListingsRoutes = require('./src/api/cropListings.routes');
const callsRoutes = require('./src/api/calls.routes');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return res.json({ 
        status: 'error', 
        message: 'Database connection failed', 
        error: error.message 
      });
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || 'not set'
      }
    });
  } catch (err) {
    console.error('Test endpoint error:', err);
    res.json({ 
      status: 'error', 
      message: 'Test failed', 
      error: err.message 
    });
  }
});

// Test JWT generation and verification
app.get('/test-jwt', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
    const JWT_EXPIRES_IN = '24h';
    
    // Generate a test token
    const testToken = jwt.sign({ test: 'data', sub: 'test-user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Decode it to check expiration
    const decoded = jwt.decode(testToken);
    
    // Verify it immediately
    const verified = jwt.verify(testToken, JWT_SECRET);
    
    res.json({
      status: 'ok',
      message: 'JWT test successful',
      token: testToken.substring(0, 20) + '...',
      tokenLength: testToken.length,
      expiresIn: JWT_EXPIRES_IN,
      creationTime: new Date().toISOString(),
      expirationTime: new Date(decoded.exp * 1000).toISOString(),
      timeUntilExpiry: Math.floor((decoded.exp * 1000 - Date.now()) / 1000),
      verified: !!verified
    });
  } catch (err) {
    res.json({
      status: 'error',
      message: 'JWT test failed',
      error: err.message
    });
  }
});

// Test database table structure
app.get('/test-tables', async (req, res) => {
  try {
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    // Try to query the users table directly
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, cropnames')
      .limit(5);
    
    if (usersError) {
      return res.json({ 
        status: 'error', 
        message: 'Users table error', 
        error: usersError.message,
        hint: 'The users table might not exist. Please run the setup_database.sql script in Supabase.'
      });
    }
    
    // Try to query auth_users table
    const { data: authUsers, error: authUsersError } = await supabase
      .from('auth_users')
      .select('id, phone')
      .limit(5);
    
    res.json({
      status: 'ok',
      message: 'Database structure check',
      usersTableExists: true,
      sampleUsers: users || [],
      sampleAuthUsers: authUsers || [],
      authUsersError: authUsersError?.message || null
    });
  } catch (err) {
    res.json({
      status: 'error',
      message: 'Database test failed',
      error: err.message
    });
  }
});

// Test cropnames enum update
app.post('/test-cropnames', async (req, res) => {
  try {
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    // Test updating cropnames with enum values
    const testCropnames = ['tender-coconut', 'banana'];
    const testUserId = '07a9661d-88ed-4f02-9738-6d0a3ba52389'; // Use existing user ID
    
    console.log('🧪 Testing cropnames update with:', testCropnames);
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        cropnames: testCropnames,
        updatedat: new Date().toISOString()
      })
      .eq('id', testUserId)
      .select('id, name, cropnames');
    
    if (error) {
      console.error('❌ Cropnames update error:', error);
      return res.json({
        status: 'error',
        message: 'Failed to update cropnames',
        error: error.message,
        details: error
      });
    }
    
    console.log('✅ Cropnames update successful:', data);
    
    res.json({
      status: 'ok',
      message: 'Cropnames update test successful',
      updatedUser: data[0] || null,
      testCropnames: testCropnames
    });
  } catch (err) {
    console.error('❌ Test cropnames error:', err);
    res.json({
      status: 'error',
      message: 'Cropnames test failed',
      error: err.message
    });
  }
});

// Test user_crops table
app.get('/test-user-crops', async (req, res) => {
  try {
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    const testUserId = '07a9661d-88ed-4f02-9738-6d0a3ba52389';
    
    console.log('🧪 Testing user_crops table for user:', testUserId);
    
    // Check if user_crops table exists and has data
    const { data: userCrops, error: userCropsError } = await supabase
      .from('user_crops')
      .select('*')
      .eq('user_id', testUserId);
    
    if (userCropsError) {
      console.error('❌ User crops table error:', userCropsError);
      return res.json({
        status: 'error',
        message: 'User crops table error',
        error: userCropsError.message,
        hint: 'The user_crops table might not exist. Please run the 002_add_user_crops_table.sql migration.'
      });
    }
    
    // Also check the users table cropnames
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, cropnames')
      .eq('id', testUserId)
      .single();
    
    res.json({
      status: 'ok',
      message: 'User crops table check',
      userCropsTableExists: true,
      userCrops: userCrops || [],
      userData: userData || null,
      userError: userError?.message || null
    });
  } catch (err) {
    console.error('❌ Test user crops error:', err);
    res.json({
      status: 'error',
      message: 'User crops test failed',
      error: err.message
    });
  }
});

// Test API configuration
app.get('/test-api-config', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      userCrops: '/user-crops',
      userCropsById: '/user-crops/:cropType',
      userCropsStatus: '/user-crops/:cropType/status'
    }
  });
});

// Test crop status update
app.patch('/test-crop-status/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const { status } = req.body;
    const testUserId = '07a9661d-88ed-4f02-9738-6d0a3ba52389';
    
    console.log('🧪 Testing crop status update:', { cropType, status });
    
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    const { data, error } = await supabase
      .from('user_crops')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUserId)
      .eq('crop_type', cropType)
      .select();
    
    if (error) {
      console.error('❌ Crop status update error:', error);
      return res.json({
        status: 'error',
        message: 'Failed to update crop status',
        error: error.message
      });
    }
    
    console.log('✅ Crop status update successful:', data);
    
    res.json({
      status: 'ok',
      message: 'Crop status updated successfully',
      updatedCrop: data[0] || null
    });
  } catch (err) {
    console.error('❌ Test crop status error:', err);
    res.json({
      status: 'error',
      message: 'Crop status test failed',
      error: err.message
    });
  }
});

// Migrate existing crops to user_crops table
app.post('/migrate-crops', async (req, res) => {
  try {
    const { getClient } = require('./src/config/supabaseClient');
    const supabase = getClient();
    
    console.log('🔄 Starting crop migration...');
    
    // Get all users with cropnames
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, cropnames')
      .not('cropnames', 'is', null);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return res.json({
        status: 'error',
        message: 'Failed to fetch users',
        error: usersError.message
      });
    }
    
    console.log('👥 Found users with crops:', users);
    
    let migratedCount = 0;
    const migrationResults = [];
    
    // Migrate crops for each user
    for (const user of users) {
      if (user.cropnames && user.cropnames.length > 0) {
        console.log(`🌾 Migrating crops for user ${user.name}:`, user.cropnames);
        
        for (const cropType of user.cropnames) {
          const { data: insertedCrop, error: insertError } = await supabase
            .from('user_crops')
            .upsert({
              user_id: user.id,
              crop_type: cropType,
              status: 'off',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,crop_type' })
            .select();
          
          if (insertError) {
            console.error(`❌ Error inserting crop ${cropType} for user ${user.name}:`, insertError);
            migrationResults.push({
              user: user.name,
              crop: cropType,
              status: 'error',
              error: insertError.message
            });
          } else {
            console.log(`✅ Migrated crop ${cropType} for user ${user.name}`);
            migratedCount++;
            migrationResults.push({
              user: user.name,
              crop: cropType,
              status: 'success'
            });
          }
        }
      }
    }
    
    console.log(`🎉 Migration completed. Migrated ${migratedCount} crops.`);
    
    res.json({
      status: 'ok',
      message: 'Crop migration completed',
      migratedCount: migratedCount,
      results: migrationResults
    });
  } catch (err) {
    console.error('❌ Migration error:', err);
    res.json({
      status: 'error',
      message: 'Migration failed',
      error: err.message
    });
  }
});

// API routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/user-crops', userCropsRoutes);
app.use('/crop-listings', cropListingsRoutes);
app.use('/buyers', buyersRoutes);
app.use('/calls', callsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 8085;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://${HOST}:${PORT}`);
});
