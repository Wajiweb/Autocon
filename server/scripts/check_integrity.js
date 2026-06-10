'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    
    // Actual user schema check
    const user = await db.collection('users').findOne({});
    console.log('User document fields:', Object.keys(user || {}));
    console.log('Sample user:', JSON.stringify({
        walletAddress: user.walletAddress,
        role: user.role,
        nonceExists: !!user.nonce,
        tokenVersion: user.tokenVersion,
        usage: user.usage,
        createdAt: user.createdAt
    }, null, 2));
    
    // Check actual auth method - wallet-based, no password
    const hasPassword = !!(user && user.password);
    console.log('\nPassword field in user doc:', hasPassword ? 'EXISTS' : 'NONE (wallet-only auth)');
    console.log('Nonce field exists:', !!user.nonce, '(used for MetaMask signature auth)');
    
    // Check contract userId integrity
    const allContracts = await db.collection('contracts').find({}).project({ userId: 1, name: 1 }).toArray();
    let validUserId = 0, invalidUserId = 0;
    allContracts.forEach(c => {
        if (c.userId && c.userId.toString().length === 24) validUserId++;
        else invalidUserId++;
    });
    console.log('\nContracts with valid ObjectId userId:', validUserId);
    console.log('Contracts with missing/invalid userId:', invalidUserId);

    // Check migrated contracts specifically
    const migratedContracts = await db.collection('contracts').find({}).project({ name:1, userId:1 }).toArray();
    console.log('\nAll contracts + userId:');
    migratedContracts.forEach(c => console.log(' ', c.name, '| userId:', c.userId ? c.userId.toString() : 'MISSING'));
    
    await mongoose.disconnect();
}).catch(console.error);
