const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const contractController = require('../controllers/contractController');

router.use(authMiddleware);

router.get('/my-contracts/:walletAddress', contractController.getMyContracts);
router.delete('/delete/:id', contractController.deleteContract);

module.exports = router;
