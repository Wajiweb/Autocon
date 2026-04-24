'use strict';

/**
 * jobRoutes.js
 *
 * Routes for the background job system.
 *
 * POST /api/jobs/create         — Enqueue a new job
 * GET  /api/jobs/stats          — Aggregated stats (must be before /:jobId)
 * GET  /api/jobs/:jobId         — Poll a single job's status
 * GET  /api/jobs                — List all jobs for the user (paginated)
 */

const express = require('express');
const router  = express.Router();

const { authMiddleware } = require('../middleware/auth');
const { strictLimiter }  = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validationSchemas');
const { createJob, getJobStatus, listJobs, getJobStats } = require('../controllers/jobController');

// Create a job (strict rate limit — prevents queue flooding)
router.post('/create', strictLimiter, authMiddleware, validate(schemas.createJob), createJob);

// Stats endpoint must come BEFORE /:jobId to avoid route collision
router.get('/stats', authMiddleware, getJobStats);

// Poll a specific job by ID
router.get('/:jobId', authMiddleware, getJobStatus);

// List all jobs for the user with pagination
router.get('/', authMiddleware, validate(schemas.pagination, 'query'), listJobs);

module.exports = router;
