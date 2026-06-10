'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const contracts = await db.collection('contracts').find({}).toArray();
    console.log('--- ALL CONTRACTS IN DB ---');
    contracts.forEach(c => {
        console.log(`Name: "${c.name}", Type: "${c.contractType}", Symbol: "${c.symbol}", Network: "${c.network}", Address: "${c.contractAddress}"`);
    });
    console.log('---------------------------');
    await mongoose.disconnect();
}).catch(console.error);
