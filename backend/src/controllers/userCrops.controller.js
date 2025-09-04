'use strict';

const { createSuccess, createError } = require('../utils/helpers');
const { getClient } = require('../config/supabaseClient');

module.exports = {
  // Get all crops for a user
  async getUserCrops(req, res) {
    try {
      console.log('🌾 Backend - Get user crops request received');
      console.log('🌾 Backend - User from middleware:', req.user);
      
      const supabase = getClient();
      
      // Get user's crops with details
      const { data: userCrops, error } = await supabase
        .from('user_crops')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Backend - Error fetching user crops:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - User crops fetched:', userCrops);
      
      return res.json(createSuccess('User crops fetched', { crops: userCrops }));
    } catch (err) {
      console.error('❌ Backend - Error in getUserCrops:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch user crops'));
    }
  },

  // Get specific crop details
  async getCropDetails(req, res) {
    try {
      const { cropType } = req.params;
      console.log('🌾 Backend - Get crop details request for:', cropType);
      
      const supabase = getClient();
      
      // Get specific crop details
      const { data: crop, error } = await supabase
        .from('user_crops')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('crop_type', cropType)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Crop not found, return default structure
          return res.json(createSuccess('Crop details fetched', { 
            crop: {
              crop_type: cropType,
              status: 'off',
              crop_image: null,
              expected_price: null,
              quantity: null,
              next_harvest_date: null,
              last_harvest_date: null,
              days_left: null
            }
          }));
        }
        console.error('❌ Backend - Error fetching crop details:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - Crop details fetched:', crop);
      
      return res.json(createSuccess('Crop details fetched', { crop }));
    } catch (err) {
      console.error('❌ Backend - Error in getCropDetails:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch crop details'));
    }
  },

  // Update crop details
  async updateCropDetails(req, res) {
    try {
      const { cropType } = req.params;
      const { 
        crop_image, 
        expected_price, 
        quantity, 
        next_harvest_date, 
        last_harvest_date, 
        status, 
        days_left 
      } = req.body;
      
      console.log('🌾 Backend - Update crop details request for:', cropType);
      console.log('🌾 Backend - Update data:', req.body);
      
      const supabase = getClient();
      
      // Prepare update data
      const updateData = {
        updated_at: new Date().toISOString()
      };
      
      if (crop_image !== undefined) updateData.crop_image = crop_image;
      if (expected_price !== undefined) updateData.expected_price = expected_price;
      if (quantity !== undefined) updateData.quantity = quantity;
      if (next_harvest_date !== undefined) updateData.next_harvest_date = next_harvest_date;
      if (last_harvest_date !== undefined) updateData.last_harvest_date = last_harvest_date;
      if (status !== undefined) updateData.status = status;
      if (days_left !== undefined) updateData.days_left = days_left;
      
      // Try to update existing crop
      const { data: updatedCrop, error: updateError } = await supabase
        .from('user_crops')
        .update(updateData)
        .eq('user_id', req.user.id)
        .eq('crop_type', cropType)
        .select()
        .single();
      
      if (updateError && updateError.code !== 'PGRST116') {
        console.error('❌ Backend - Error updating crop:', updateError);
        return res.status(500).json(createError(updateError.message));
      }
      
      // If crop doesn't exist, create it
      if (!updatedCrop) {
        const { data: newCrop, error: insertError } = await supabase
          .from('user_crops')
          .insert({
            user_id: req.user.id,
            crop_type: cropType,
            ...updateData
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Backend - Error creating crop:', insertError);
          return res.status(500).json(createError(insertError.message));
        }
        
        console.log('🌾 Backend - New crop created:', newCrop);
        return res.json(createSuccess('Crop details created', { crop: newCrop }));
      }
      
      console.log('🌾 Backend - Crop updated:', updatedCrop);
      return res.json(createSuccess('Crop details updated', { crop: updatedCrop }));
    } catch (err) {
      console.error('❌ Backend - Error in updateCropDetails:', err);
      return res.status(500).json(createError(err.message || 'Failed to update crop details'));
    }
  },

  // Toggle crop status (on/off)
  async toggleCropStatus(req, res) {
    try {
      const { cropType } = req.params;
      const { status } = req.body;
      
      console.log('🌾 Backend - Toggle crop status request for:', cropType, 'to:', status);
      
      if (!status || !['on', 'off', 'days'].includes(status)) {
        return res.status(400).json(createError('Invalid status. Must be on, off, or days'));
      }
      
      const supabase = getClient();
      
      // Update crop status
      const { data: updatedCrop, error } = await supabase
        .from('user_crops')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.user.id)
        .eq('crop_type', cropType)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Backend - Error toggling crop status:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - Crop status updated:', updatedCrop);
      return res.json(createSuccess('Crop status updated', { crop: updatedCrop }));
    } catch (err) {
      console.error('❌ Backend - Error in toggleCropStatus:', err);
      return res.status(500).json(createError(err.message || 'Failed to toggle crop status'));
    }
  }
};
