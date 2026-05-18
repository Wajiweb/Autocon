'use strict';

/**
 * migrateTokenVersion.js
 * 
 * Usage: node server/scripts/migrateTokenVersion.js
 * 
 * Adds tokenVersion field to all existing users who don't have it.
 * Safe to run multiple times.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function migrateTokenVersion() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Find users without tokenVersion or with tokenVersion = 0
        const users = await User.find({
            $or: [
                { tokenVersion: { $exists: false } },
                { tokenVersion: 0 },
            ]
        });

        console.log(`📊 Found ${users.length} users that need migration.`);

        if (users.length === 0) {
            console.log('✅ All users already have tokenVersion set.');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Update each user
        let updated = 0;
        for (const user of users) {
            if (!user.tokenVersion) {
                user.tokenVersion = 0;
                await user.save();
                updated++;
            }
        }

        console.log(`✅ Successfully migrated ${updated} users!`);
        console.log('💡 All users now have tokenVersion field set to 0.');
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrateTokenVersion();
