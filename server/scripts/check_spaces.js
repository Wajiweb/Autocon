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
        const addr = contract.contractAddress;
        console.log('Address string:', JSON.stringify(addr));
        console.log('Length:', addr.length);
        console.log('Is exactly equal to 0x3Db608F17651Cf9329f84f0A0a2fdf8be111737e?', addr === '0x3Db608F17651Cf9329f84f0A0a2fdf8be111737e');
        
        // Print character codes
        const charCodes = [];
        for (let i = 0; i < addr.length; i++) {
            charCodes.push(addr.charCodeAt(i));
        }
        console.log('Character codes:', charCodes);
    }
    await mongoose.disconnect();
}).catch(console.error);
