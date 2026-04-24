'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }      = require('../middleware/auth');
const { estimateGasHandler }  = require('../controllers/gasController');

router.post('/estimate-gas', authMiddleware, estimateGasHandler);

module.exports = router;
