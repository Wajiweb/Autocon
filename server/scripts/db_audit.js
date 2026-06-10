'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function audit() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log('====================================');
    console.log('   AutoCon DB Security Audit');
    console.log('====================================\n');

    // 1. Indexes on contracts
    const indexes = await db.collection('contracts').indexes();
    console.log('1. INDEXES on contracts:');
    indexes.forEach(i => {
        const unique = i.unique ? ' [UNIQUE]' : '';
        console.log('  ', JSON.stringify(i.key), '|', i.name, unique);
    });

    // 2. Unique constraint test
    console.log('\n2. DUPLICATE CONTRACT PREVENTION:');
    try {
        await db.collection('contracts').insertOne({ 
            contractAddress: '0x3Db608F17651Cf9329f84f0A0a2fdf8be111737e',
            network: 'Sepolia', name: 'DUPE TEST',
            userId: new mongoose.Types.ObjectId(),
            ownerAddress: '0xtest',
            contractType: 'ERC20'
        });
        console.log('   FAIL: Duplicate was allowed!');
    } catch(e) {
        if (e.code === 11000) console.log('   PASS: Duplicate contract correctly rejected');
        else console.log('   Unexpected error:', e.message);
    }

    // 3. Orphaned documents check
    const orphaned = await db.collection('contracts').countDocuments({ userId: null });
    console.log('\n3. ORPHANED DOCUMENTS:', orphaned === 0 ? 'None - OK' : orphaned + ' found!');

    // 4. Users
    const users = await db.collection('users').find({}).project({ 
        email:1, walletAddress:1, role:1, isActive:1, loginAttempts:1, password:1 
    }).toArray();
    console.log('\n4. USER ACCOUNTS (' + users.length + '):');
    users.forEach(u => {
        const passField = u.password || '';
        const isHashed = passField.startsWith('$2b$') || passField.startsWith('$2a$');
        console.log('   Email:', u.email);
        console.log('   Role:', u.role, '| Active:', u.isActive, '| Attempts:', u.loginAttempts || 0);
        console.log('   Password hashed (bcrypt):', isHashed ? 'YES - SAFE' : 'NO - PLAINTEXT DANGER');
        console.log('   Wallet:', u.walletAddress || 'none');
        console.log('');
    });

    // 5. Token blacklist
    const blacklisted = await db.collection('tokenblacklists').countDocuments();
    console.log('5. JWT BLACKLIST:', blacklisted, 'revoked tokens');

    // 6. Jobs
    const jobs = await db.collection('jobs').find({}).project({ status:1 }).toArray();
    const statusCounts = jobs.reduce((a, j) => { a[j.status] = (a[j.status]||0)+1; return a; }, {});
    console.log('\n6. COMPILE JOBS:', jobs.length, 'total |', JSON.stringify(statusCounts));

    // 7. Admin check
    const admins = await db.collection('users').countDocuments({ role: 'admin' });
    console.log('\n7. ADMIN USERS:', admins);

    // 8. Overall collection summary
    const colNames = ['contracts', 'tokens', 'nfts', 'auctions', 'users', 'jobs', 'auditreports'];
    console.log('\n8. ALL COLLECTIONS:');
    for (const col of colNames) {
        const n = await db.collection(col).countDocuments();
        console.log('  ', col.padEnd(15), n, 'docs');
    }

    console.log('\n====================================');
    console.log('   RESULT: Ready for evaluation?');
    console.log('====================================');
    
    await mongoose.disconnect();
}

audit().catch(err => {
    console.error('Audit failed:', err.message);
    process.exit(1);
});
