'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const contract = await db.collection('contracts').findOne({ name: 'mantel' });
    if (!contract) {
        console.log('Contract "mantel" not found.');
    } else {
        console.log('--- MANTEL SOURCE CODE ---');
        console.log(contract.sourceCode);
        console.log('---------------------------');
        console.log('ABI functions:', contract.abi.filter(x => x.type === 'function').map(x => x.name));
    }
    await mongoose.disconnect();
}).catch(console.error);
