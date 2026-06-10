'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => {
        console.log(`Wallet: "${u.walletAddress}", Role: ${u.role}, ID: ${u._id}, apiKey: ${u.apiKey === undefined ? 'undefined' : JSON.stringify(u.apiKey)}`);
    });
    console.log('--- INDEXES ---');
    const indexes = await db.collection('users').indexes();
    console.log(JSON.stringify(indexes, null, 2));
    await mongoose.disconnect();
}).catch(console.error);
