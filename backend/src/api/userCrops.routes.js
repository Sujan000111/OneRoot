'use strict';

const router = require('express').Router();
const UserCropsController = require('../controllers/userCrops.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Get all crops for a user
router.get('/', requireAuth, UserCropsController.getUserCrops);

// Get specific crop details
router.get('/:cropType', requireAuth, UserCropsController.getCropDetails);

// Update crop details
router.put('/:cropType', requireAuth, UserCropsController.updateCropDetails);

// Toggle crop status
router.patch('/:cropType/status', requireAuth, UserCropsController.toggleCropStatus);

module.exports = router;
