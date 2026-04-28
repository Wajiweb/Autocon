/**
 * landingRoutes.js — Public landing page routes
 * Thin router — all logic lives in landingController.js
 *
 * GET /api/landing/stats
 * GET /api/landing/features
 * GET /api/landing/testimonials
 */
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/landingController');

router.get('/stats',        controller.getStats);
router.get('/features',     controller.getFeatures);
router.get('/testimonials', controller.getTestimonials);

module.exports = router;
