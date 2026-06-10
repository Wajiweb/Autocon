'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigration() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas!');

    const db = mongoose.connection.db;
    
    // Find documents that have apiKey: null or explicitly set to null
    const query = { apiKey: null };
    const countBefore = await db.collection('users').countDocuments(query);
    console.log(`🔍 Found ${countBefore} users with apiKey set to null.`);

    if (countBefore > 0) {
        console.log('⚡ Unsetting apiKey field on those documents...');
        const result = await db.collection('users').updateMany(query, {
            $unset: { apiKey: "" }
        });
        console.log(`✅ Successfully updated ${result.modifiedCount} user documents!`);
    } else {
        console.log('ℹ️ No documents with apiKey: null found. Nothing to update.');
    }

    // Verify index exists and check state of all users
    const usersAfter = await db.collection('users').find({}).toArray();
    console.log('\n--- VERIFYING USER DOCUMENTS IN DB ---');
    usersAfter.forEach(u => {
        console.log(`Wallet: "${u.walletAddress}", apiKey: ${u.apiKey === undefined ? 'undefined (OMITTED)' : JSON.stringify(u.apiKey)}`);
    });
    console.log('--------------------------------------');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB. Migration completed successfully!');
}

runMigration().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
