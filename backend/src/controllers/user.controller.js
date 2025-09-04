'use strict';

const { createSuccess, createError } = require('../utils/helpers');
const { getClient } = require('../config/supabaseClient');

module.exports = {
  async getMe(req, res) {
    return res.json(createSuccess('User fetched', { user: req.user }));
  },

  async getProfile(req, res) {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('users')
        .select('id,name,state,district,taluk,village,pincode,mobilenumber,profileimage')
        .eq('id', req.user.id)
        .single();

      if (error) {
        return res.status(500).json(createError(error.message));
      }

      return res.json(createSuccess('Profile fetched', { profile: data }));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to fetch profile'));
    }
  },

  async getMyCrops(req, res) {
    try {
      console.log('🌾 Backend - Get user crops request received');
      console.log('🌾 Backend - User from middleware:', req.user);
      
      const supabase = getClient();
      
      // Get user's crops from user_crops table
      const { data: userCrops, error } = await supabase
        .from('user_crops')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Backend - Error fetching user crops:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - User crops from database:', userCrops);
      
      // Map database crops to frontend format
      const cropDetails = userCrops.map(crop => {
        const cropMap = {
          'tender-coconut': { 
            id: 'tender-coconut', 
            name: 'Tender Coconut', 
            image: 'tender-coconut.png'
          },
          'dry-coconut': { 
            id: 'dry-coconut', 
            name: 'Dry Coconut', 
            image: 'dry-coconut.png'
          },
          'turmeric': { 
            id: 'turmeric', 
            name: 'Turmeric', 
            image: 'turmeric.png'
          },
          'banana': { 
            id: 'banana', 
            name: 'Banana', 
            image: 'banana.png'
          },
          'sunflower': { 
            id: 'sunflower', 
            name: 'Sunflower', 
            image: 'sunflower.png'
          },
          'maize': { 
            id: 'maize', 
            name: 'Maize', 
            image: 'maize.png'
          }
        };
        
        const cropInfo = cropMap[crop.crop_type] || { 
          id: crop.crop_type, 
          name: crop.crop_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
          image: 'default-crop.png'
        };
        
        return {
          ...cropInfo,
          status: crop.status,
          daysLeft: crop.days_left,
          expectedPrice: crop.expected_price,
          quantity: crop.quantity,
          nextHarvestDate: crop.next_harvest_date,
          lastHarvestDate: crop.last_harvest_date,
          cropImage: crop.crop_image
        };
      });
      
      console.log('🌾 Backend - Mapped crop details:', cropDetails);
      
      return res.json(createSuccess('User crops fetched', { crops: cropDetails }));
    } catch (err) {
      console.error('❌ Backend - Error in getMyCrops:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch user crops'));
    }
  },

  async upsertProfile(req, res) {
    try {
      console.log('🔐 Backend - User profile request received');
      console.log('🔐 Backend - User from middleware:', req.user);
      console.log('🔐 Backend - Request body:', req.body);
      console.log('🔐 Backend - Authorization header:', req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'No auth header');
      
      const supabase = getClient();
      const { name, state, district, taluk, village, pincode, cropnames } = req.body;
      
      // Check if this is a cropnames-only update (from OnboardingScreen2)
      const isCropUpdate = cropnames && Array.isArray(cropnames) && !name && !state && !district && !taluk && !village && !pincode;
      
      if (isCropUpdate) {
        console.log('🔐 Backend - Crop names update request');
        // For crop updates, we only need cropnames
        if (!cropnames || !Array.isArray(cropnames)) {
          return res.status(400).json(createError('cropnames array is required for crop update'));
        }
        
        // Create user_crops entries for each selected crop
        try {
          for (const cropType of cropnames) {
            const { error: cropError } = await supabase
              .from('user_crops')
              .upsert({
                user_id: req.user.id,
                crop_type: cropType,
                status: 'off', // Default status
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id,crop_type' });
            
            if (cropError) {
              console.error('❌ Backend - Error creating user crop entry:', cropError);
            } else {
              console.log('✅ Backend - User crop entry created for:', cropType);
            }
          }
        } catch (cropErr) {
          console.error('❌ Backend - Error in crop creation loop:', cropErr);
        }
      } else {
        // For full profile updates, all fields are required
        if (!name || !state || !district || !taluk || !village || !pincode) {
          console.log('❌ Backend - Missing required fields for profile update');
          return res.status(400).json(createError('Missing required fields: name, state, district, taluk, village, and pincode are required'));
        }
      }

      // Expect a table public.users with id=auth id, plus profile fields
      let record;
      
      if (isCropUpdate) {
        // For crop updates, only update cropnames and timestamp
        // Convert cropnames to the proper enum format
        const enumCropnames = Array.isArray(cropnames) ? cropnames : [];
        record = {
          id: req.user.id,
          cropnames: enumCropnames,
          updatedat: new Date().toISOString(),
        };
        console.log('📝 Backend - Crop update record:', record);
        console.log('📝 Backend - Cropnames as enum:', enumCropnames);
      } else {
        // For full profile updates, include all fields
        const enumCropnames = Array.isArray(cropnames) ? cropnames : null;
        record = {
          id: req.user.id,
          name,
          state,
          village,
          taluk,
          district,
          pincode,
          // Store cropnames as enum array
          cropnames: enumCropnames,
          updatedat: new Date().toISOString(),
        };
        console.log('📝 Backend - Full profile update record:', record);
        console.log('📝 Backend - Cropnames as enum:', enumCropnames);
      }

      console.log('📝 Backend - Record to upsert:', record);

      // If row exists, update; else insert
      const { data, error } = await supabase
        .from('users')
        .upsert(record, { onConflict: 'id' })
        .select('id');
      
      console.log('📝 Backend - Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Backend - Supabase error:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('✅ Backend - Profile saved successfully');
      return res.json(createSuccess('Profile saved', { 
        id: req.user.id
      }));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to save profile'));
    }
  },
};
