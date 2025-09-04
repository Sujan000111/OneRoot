'use strict';

const router = require('express').Router();
const BuyersController = require('../controllers/buyers.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.get('/', BuyersController.list);
router.post('/search', requireAuth, BuyersController.search);

module.exports = router;
