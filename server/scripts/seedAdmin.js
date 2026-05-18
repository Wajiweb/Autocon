'use strict';

/**
 * seedAdmin.js
 * 
 * Usage: node server/scripts/seedAdmin.js 0xYourWalletAddress
 * 
 * Grants admin role to the specified wallet address.
 * Idempotent - safe to run multiple times.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const walletAddress = process.argv[2];

if (!walletAddress) {
    console.error('❌ Usage: node server/scripts/seedAdmin.js 0xYourWalletAddress');
    process.exit(1);
}

// Validate Ethereum address format
if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    console.error('❌ Invalid Ethereum address format.');
    process.exit(1);
}

const lowerAddress = walletAddress.toLowerCase();

async function seedAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const user = await User.findOne({ walletAddress: lowerAddress });

        if (!user) {
            console.error(`❌ User not found: ${lowerAddress}`);
            console.log('💡 Please sign up first, then run this script.');
            await mongoose.disconnect();
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`✅ User ${lowerAddress} is already an admin.`);
            await mongoose.disconnect();
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Successfully promoted ${lowerAddress} to admin!`);
        console.log('💡 You can now login and see the Admin Panel in the sidebar.');
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedAdmin();
