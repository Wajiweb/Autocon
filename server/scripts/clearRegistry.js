'use strict';

/**
 * clearRegistry.js
 *
 * Clears saved AutoCon deployment registry records and related background jobs.
 * This does not and cannot delete already deployed on-chain contracts.
 *
 * Usage:
 *   node scripts/clearRegistry.js --yes
 *   node scripts/clearRegistry.js --wallet 0xYourWalletAddress --yes
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Contract = require('../models/Contract');
const Job = require('../models/Job');
const AuditReport = require('../models/AuditReport');

function getArgValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

async function clearRegistry() {
  if (!process.argv.includes('--yes')) {
    throw new Error('Refusing to clear registry without --yes.');
  }

  const wallet = getArgValue('--wallet')?.toLowerCase();
  const filter = wallet ? { ownerAddress: wallet } : {};

  await mongoose.connect(process.env.MONGO_URI);

  const contracts = await Contract.find(filter).select('_id').lean();
  const contractIds = contracts.map((contract) => contract._id);

  const [auditReportsResult, contractsResult, jobsResult] = await Promise.all([
    contractIds.length
      ? AuditReport.deleteMany({ contractId: { $in: contractIds } })
      : Promise.resolve({ deletedCount: 0 }),
    Contract.deleteMany(filter),
    Job.deleteMany(wallet ? { ownerAddress: wallet } : {}),
  ]);

  console.log(JSON.stringify({
    wallet: wallet || 'all',
    deletedContracts: contractsResult.deletedCount || 0,
    deletedJobs: jobsResult.deletedCount || 0,
    deletedAuditReports: auditReportsResult.deletedCount || 0,
  }, null, 2));
}

clearRegistry()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
