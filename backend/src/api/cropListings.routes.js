'use strict';

const router = require('express').Router();
const CropListingsController = require('../controllers/cropListings.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Get available crop types (no auth required for this)
router.get('/crop-types', CropListingsController.getAvailableCropTypes);

// Get all crop listings for authenticated user
router.get('/', requireAuth, CropListingsController.getUserCropListings);

// Create a new crop listing
router.post('/', requireAuth, CropListingsController.createCropListing);

// Update a crop listing
router.put('/:listingId', requireAuth, CropListingsController.updateCropListing);

// Delete a crop listing
router.delete('/:listingId', requireAuth, CropListingsController.deleteCropListing);

module.exports = router;
