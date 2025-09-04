'use strict';

const router = require('express').Router();
const UserController = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/me', requireAuth, UserController.getMe);
router.get('/profile', requireAuth, UserController.getProfile);
router.get('/crops', requireAuth, UserController.getMyCrops);
router.post('/profile', requireAuth, UserController.upsertProfile);

module.exports = router;
