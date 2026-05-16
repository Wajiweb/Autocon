const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const contractController = require('../controllers/contractController');

router.use(requireAuth);

router.get('/my-contracts/:walletAddress', contractController.getMyContracts);
router.delete('/delete/:id', contractController.deleteContract);

module.exports = router;
