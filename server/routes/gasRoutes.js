'use strict';
const express = require('express');
const router  = express.Router();
const { authMiddleware }      = require('../middleware/auth');
const { validate, schemas }   = require('../middleware/validationSchemas');
const { estimateGasHandler }  = require('../controllers/gasController');

router.post('/estimate-gas', authMiddleware, validate(schemas.estimateGas), estimateGasHandler);

module.exports = router;
