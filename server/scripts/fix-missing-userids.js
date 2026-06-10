'use strict';
/**
 * Fix: Backfill userId on the 8 migrated contracts that are missing it.
 * Matches contracts by ownerAddress → users.walletAddress to find the correct userId.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    console.log('Connected. Fixing missing userIds...\n');

    // Get all users indexed by walletAddress
    const users = await db.collection('users').find({}).project({ _id: 1, walletAddress: 1 }).toArray();
    const walletToUserId = {};
    users.forEach(u => { walletToUserId[u.walletAddress.toLowerCase()] = u._id; });
    console.log('Users available:', Object.keys(walletToUserId).map(w => w.slice(0,10)+'...'));

    // Get all contracts missing userId
    const broken = await db.collection('contracts').find({ userId: null }).toArray();
    console.log('\nContracts missing userId:', broken.length);

    let fixed = 0, unfixable = 0;
    for (const c of broken) {
        const owner = (c.ownerAddress || '').toLowerCase();
        const userId = walletToUserId[owner];
        
        if (userId) {
            await db.collection('contracts').updateOne(
                { _id: c._id },
                { $set: { userId } }
            );
            fixed++;
            console.log('  Fixed:', c.name, '(' + c.contractType + ') → userId:', userId.toString());
        } else {
            unfixable++;
            console.log('  Cannot fix:', c.name, '- owner wallet not in users:', owner.slice(0,14)+'...');
        }
    }

    // Verify
    const stillBroken = await db.collection('contracts').countDocuments({ userId: null });
    console.log('\nResults:');
    console.log('  Fixed:', fixed);
    console.log('  Unfixable (wallet not registered):', unfixable);
    console.log('  Still missing userId:', stillBroken);

    if (stillBroken === 0) {
        console.log('\n  All contracts now have a valid userId!');
    }

    await mongoose.disconnect();
}).catch(console.error);
