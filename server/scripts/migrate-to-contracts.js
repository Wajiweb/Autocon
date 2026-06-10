'use strict';
/**
 * Migration: Move tokens, nfts, and auctions collections → unified `contracts` collection
 * Safe to run multiple times (skips duplicates via contractAddress+network unique index).
 */
module.paths.push('d:/Autocon-fyp/server/node_modules');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/Autocon-fyp/server/.env' });

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    console.log('Connected to MongoDB\n');

    const contracts  = db.collection('contracts');
    const tokens     = db.collection('tokens');
    const nfts       = db.collection('nfts');
    const auctions   = db.collection('auctions');

    let migrated = 0, skipped = 0;

    // ── Migrate tokens (ERC20) ───────────────────────────────────────────────
    const tokenDocs = await tokens.find({}).toArray();
    console.log(`Found ${tokenDocs.length} tokens to migrate...`);
    for (const t of tokenDocs) {
        const network = t.network || 'Sepolia';
        try {
            await contracts.insertOne({
                _id:             new mongoose.Types.ObjectId(),
                userId:          t.userId,
                ownerAddress:    (t.ownerAddress || t.walletAddress || '').toLowerCase(),
                contractType:    'ERC20',
                name:            t.name,
                symbol:          t.symbol,
                contractAddress: t.contractAddress,
                network:         network,
                abi:             t.abi || null,
                txHash:          t.txHash || null,
                gasUsed:         t.gasUsed || null,
                blockNumber:     t.blockNumber || null,
                sourceCode:      t.sourceCode || '',
                contractName:    t.contractName || '',
                sourceFile:      t.sourceFile || 'Token.sol',
                compilerVersion: t.compilerVersion || '',
                optimizationUsed: t.optimizationUsed || 1,
                runs:            t.runs || 200,
                constructorArgs: t.constructorArgs || '',
                verified:        t.verified || false,
                verifiedAt:      t.verifiedAt || null,
                metadata:        { supply: t.supply },
                createdAt:       t.createdAt || new Date(),
                updatedAt:       t.updatedAt || new Date(),
            });
            migrated++;
            console.log(`  ✅ Migrated token: ${t.name} (${t.contractAddress})`);
        } catch (err) {
            if (err.code === 11000) {
                skipped++;
                console.log(`  ⏭  Skipped (duplicate): ${t.name} (${t.contractAddress})`);
            } else {
                console.error(`  ❌ Error migrating token ${t.name}:`, err.message);
            }
        }
    }

    // ── Migrate NFTs (ERC721) ────────────────────────────────────────────────
    const nftDocs = await nfts.find({}).toArray();
    console.log(`\nFound ${nftDocs.length} NFTs to migrate...`);
    for (const n of nftDocs) {
        try {
            await contracts.insertOne({
                _id:             new mongoose.Types.ObjectId(),
                userId:          n.userId,
                ownerAddress:    (n.ownerAddress || n.walletAddress || '').toLowerCase(),
                contractType:    'ERC721',
                name:            n.name,
                symbol:          n.symbol,
                contractAddress: n.contractAddress,
                network:         n.network || 'Sepolia',
                abi:             n.abi || null,
                txHash:          n.txHash || null,
                gasUsed:         n.gasUsed || null,
                blockNumber:     n.blockNumber || null,
                sourceCode:      n.sourceCode || '',
                contractName:    n.contractName || '',
                sourceFile:      n.sourceFile || 'NFT.sol',
                compilerVersion: n.compilerVersion || '',
                optimizationUsed: n.optimizationUsed || 1,
                runs:            n.runs || 200,
                constructorArgs: n.constructorArgs || '',
                verified:        n.verified || false,
                verifiedAt:      n.verifiedAt || null,
                metadata:        { maxSupply: n.maxSupply, mintPrice: n.mintPrice, baseURI: n.baseURI },
                createdAt:       n.createdAt || new Date(),
                updatedAt:       n.updatedAt || new Date(),
            });
            migrated++;
            console.log(`  ✅ Migrated NFT: ${n.name} (${n.contractAddress})`);
        } catch (err) {
            if (err.code === 11000) {
                skipped++;
                console.log(`  ⏭  Skipped (duplicate): ${n.name} (${n.contractAddress})`);
            } else {
                console.error(`  ❌ Error migrating NFT ${n.name}:`, err.message);
            }
        }
    }

    // ── Migrate Auctions ─────────────────────────────────────────────────────
    const auctionDocs = await auctions.find({}).toArray();
    console.log(`\nFound ${auctionDocs.length} auctions to migrate...`);
    for (const a of auctionDocs) {
        try {
            await contracts.insertOne({
                _id:             new mongoose.Types.ObjectId(),
                userId:          a.userId,
                ownerAddress:    (a.ownerAddress || a.walletAddress || '').toLowerCase(),
                contractType:    'AUCTION',
                name:            a.name,
                symbol:          null,
                contractAddress: a.contractAddress,
                network:         a.network || 'Sepolia',
                abi:             a.abi || null,
                txHash:          a.txHash || null,
                gasUsed:         a.gasUsed || null,
                blockNumber:     a.blockNumber || null,
                sourceCode:      a.sourceCode || '',
                contractName:    a.contractName || '',
                sourceFile:      a.sourceFile || 'Auction.sol',
                compilerVersion: a.compilerVersion || '',
                optimizationUsed: a.optimizationUsed || 1,
                runs:            a.runs || 200,
                constructorArgs: a.constructorArgs || '',
                verified:        a.verified || false,
                verifiedAt:      a.verifiedAt || null,
                metadata:        { itemName: a.itemName, itemDescription: a.itemDescription, duration: a.duration, minimumBid: a.minimumBid },
                createdAt:       a.createdAt || new Date(),
                updatedAt:       a.updatedAt || new Date(),
            });
            migrated++;
            console.log(`  ✅ Migrated auction: ${a.name} (${a.contractAddress})`);
        } catch (err) {
            if (err.code === 11000) {
                skipped++;
                console.log(`  ⏭  Skipped (duplicate): ${a.name} (${a.contractAddress})`);
            } else {
                console.error(`  ❌ Error migrating auction ${a.name}:`, err.message);
            }
        }
    }

    // ── Final count ──────────────────────────────────────────────────────────
    const totalContracts = await contracts.countDocuments();
    console.log(`\n🎉 Migration complete!`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped (duplicates): ${skipped}`);
    console.log(`   Total in contracts collection: ${totalContracts}`);

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
