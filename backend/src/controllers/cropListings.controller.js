'use strict';

const { createSuccess, createError } = require('../utils/helpers');
const { getClient } = require('../config/supabaseClient');

module.exports = {
  // Get all crop listings for a user
  async getUserCropListings(req, res) {
    try {
      console.log('🌾 Backend - Get user crop listings request received');
      console.log('🌾 Backend - User from middleware:', req.user);
      
      const supabase = getClient();
      
      // Get user's crop listings
      const { data: listings, error } = await supabase
        .from('crop_listings')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Backend - Error fetching crop listings:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - User crop listings fetched:', listings);
      
      return res.json(createSuccess('User crop listings fetched', { listings }));
    } catch (err) {
      console.error('❌ Backend - Error in getUserCropListings:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch crop listings'));
    }
  },

  // Create a new crop listing
  async createCropListing(req, res) {
    try {
      const { 
        crop_type, 
        crop_variety, 
        expected_price, 
        quantity, 
        is_ready, 
        ready_in_days, 
        images 
      } = req.body;
      
      console.log('🌾 Backend - Create crop listing request received');
      console.log('🌾 Backend - Request data:', req.body);
      
      // Validate required fields
      if (!crop_type || !expected_price || !quantity) {
        return res.status(400).json(createError('Missing required fields: crop_type, expected_price, and quantity are required'));
      }
      
      const supabase = getClient();
      
      // Create crop listing
      const { data: listing, error } = await supabase
        .from('crop_listings')
        .insert({
          user_id: req.user.id,
          crop_type,
          crop_variety: crop_variety || null,
          expected_price: parseFloat(expected_price),
          quantity,
          is_ready: is_ready || false,
          ready_in_days: ready_in_days || null,
          images: images || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Backend - Error creating crop listing:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - Crop listing created:', listing);
      
      return res.json(createSuccess('Crop listing created successfully', { listing }));
    } catch (err) {
      console.error('❌ Backend - Error in createCropListing:', err);
      return res.status(500).json(createError(err.message || 'Failed to create crop listing'));
    }
  },

  // Update a crop listing
  async updateCropListing(req, res) {
    try {
      const { listingId } = req.params;
      const updateData = req.body;
      
      console.log('🌾 Backend - Update crop listing request for ID:', listingId);
      console.log('🌾 Backend - Update data:', updateData);
      
      const supabase = getClient();
      
      // Update crop listing
      const { data: listing, error } = await supabase
        .from('crop_listings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', req.user.id) // Ensure user can only update their own listings
        .select()
        .single();
      
      if (error) {
        console.error('❌ Backend - Error updating crop listing:', error);
        return res.status(500).json(createError(error.message));
      }
      
      if (!listing) {
        return res.status(404).json(createError('Crop listing not found'));
      }
      
      console.log('🌾 Backend - Crop listing updated:', listing);
      
      return res.json(createSuccess('Crop listing updated successfully', { listing }));
    } catch (err) {
      console.error('❌ Backend - Error in updateCropListing:', err);
      return res.status(500).json(createError(err.message || 'Failed to update crop listing'));
    }
  },

  // Delete a crop listing
  async deleteCropListing(req, res) {
    try {
      const { listingId } = req.params;
      
      console.log('🌾 Backend - Delete crop listing request for ID:', listingId);
      
      const supabase = getClient();
      
      // Delete crop listing
      const { error } = await supabase
        .from('crop_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', req.user.id); // Ensure user can only delete their own listings
      
      if (error) {
        console.error('❌ Backend - Error deleting crop listing:', error);
        return res.status(500).json(createError(error.message));
      }
      
      console.log('🌾 Backend - Crop listing deleted successfully');
      
      return res.json(createSuccess('Crop listing deleted successfully'));
    } catch (err) {
      console.error('❌ Backend - Error in deleteCropListing:', err);
      return res.status(500).json(createError(err.message || 'Failed to delete crop listing'));
    }
  },

  // Get available crop types with images
  async getAvailableCropTypes(req, res) {
    try {
      console.log('🌾 Backend - Get available crop types request');
      
      // Define available crop types with their details
      const cropTypes = [
        {
          id: 'tender-coconut',
          name: 'Tender Coconut',
          image: 'tender-coconut.png',
          varieties: ['Green', 'Yellow', 'Hybrid']
        },
        {
          id: 'dry-coconut',
          name: 'Dry Coconut',
          image: 'dry-coconut.png',
          varieties: ['Copra', 'Desiccated', 'Virgin Oil']
        },
        {
          id: 'turmeric',
          name: 'Turmeric',
          image: 'turmeric.png',
          varieties: ['Alleppey', 'Madras', 'Rajapuri']
        },
        {
          id: 'banana',
          name: 'Banana',
          image: 'banana.png',
          varieties: ['Cavendish', 'Robusta', 'Nendran']
        },
        {
          id: 'sunflower',
          name: 'Sunflower',
          image: 'sunflower.png',
          varieties: ['High Oleic', 'Confectionery', 'Oil Seed']
        },
        {
          id: 'maize',
          name: 'Maize',
          image: 'maize.png',
          varieties: ['Sweet Corn', 'Field Corn', 'Popcorn']
        }
      ];
      
      console.log('🌾 Backend - Available crop types:', cropTypes);
      
      return res.json(createSuccess('Available crop types fetched', { cropTypes }));
    } catch (err) {
      console.error('❌ Backend - Error in getAvailableCropTypes:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch crop types'));
    }
  }
};
