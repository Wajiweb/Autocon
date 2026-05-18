const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { cacheClient } = require('../middleware/cache');

/**
 * GET /api/health
 * Comprehensive health check for all services
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  // Check MongoDB
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    health.services.mongodb = {
      status: 'connected',
      latency: `${latency}ms`,
      database: mongoose.connection.db.databaseName
    };
  } catch (err) {
    health.services.mongodb = {
      status: 'error',
      message: err.message
    };
    health.status = 'degraded';
  }

  // Check Redis Cache
  try {
    const start = Date.now();
    await cacheClient.ping();
    const latency = Date.now() - start;
    health.services.redis = {
      status: 'connected',
      latency: `${latency}ms`,
      host: process.env.REDIS_HOST
    };
  } catch (err) {
    health.services.redis = {
      status: 'error',
      message: err.message
    };
    health.status = 'degraded';
  }

  // Check Blockchain RPC (Sepolia)
  try {
    const { ethers } = require('ethers');
    const start = Date.now();
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const network = await provider.getNetwork();
    const latency = Date.now() - start;
    health.services.blockchain = {
      status: 'connected',
      network: network.name,
      chainId: Number(network.chainId),
      latency: `${latency}ms`,
      rpc: process.env.SEPOLIA_RPC_URL.split('/')[2] // Show domain only
    };
  } catch (err) {
    health.services.blockchain = {
      status: 'error',
      message: err.message
    };
    health.status = 'degraded';
  }

  // Check Memory Usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  // Determine HTTP status
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /api/health/ready
 * Simple readiness check (for load balancers)
 */
router.get('/health/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

/**
 * GET /api/health/live
 * Simple liveness check (for Kubernetes)
 */
router.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

module.exports = router;
