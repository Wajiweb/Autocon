'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function verifyAuth() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    const randomWallet = '0x' + crypto.randomBytes(20).toString('hex');
    console.log(`🧪 Creating first test user with wallet address: ${randomWallet}`);
    
    let user1;
    try {
        user1 = await User.create({ walletAddress: randomWallet });
        console.log(`✅ Successfully created first test user! ID: ${user1._id}, apiKey: ${user1.apiKey}`);
    } catch (err) {
        console.error('❌ Failed to create first test user:', err);
        await mongoose.disconnect();
        process.exit(1);
    }

    const randomWallet2 = '0x' + crypto.randomBytes(20).toString('hex');
    console.log(`🧪 Creating second test user with wallet address: ${randomWallet2}`);
    
    let user2;
    try {
        user2 = await User.create({ walletAddress: randomWallet2 });
        console.log(`✅ Successfully created second test user! ID: ${user2._id}, apiKey: ${user2.apiKey}`);
    } catch (err) {
        console.error('❌ Failed to create second test user (this is the duplicate key bug!):', err);
        // Clean up first user before exiting
        if (user1) await User.deleteOne({ _id: user1._id });
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log('⚡ Both test users created successfully without duplicate key errors!');
    
    // Clean up
    console.log('🧹 Cleaning up test users...');
    await User.deleteOne({ _id: user1._id });
    await User.deleteOne({ _id: user2._id });
    console.log('✅ Cleanup complete!');

    await mongoose.disconnect();
    console.log('🎉 Verification successful!');
}

verifyAuth().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
