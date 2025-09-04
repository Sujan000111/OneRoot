'use strict';

const router = require('express').Router();
const CallsController = require('../controllers/calls.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// List current user's calls
router.get('/', requireAuth, CallsController.listMyCalls);

// Create a call log (on dial or completion)
router.post('/', requireAuth, CallsController.createCall);

// Update a call (e.g., to set ended_at/duration/status)
router.patch('/:id', requireAuth, CallsController.updateCall);

module.exports = router;


