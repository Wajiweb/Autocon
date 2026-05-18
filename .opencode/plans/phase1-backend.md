# Phase 1: Backend Foundation - Implementation Plan

## Step 1: Expose Role in Auth Response

**File:** `server/controllers/authController.js`
**Lines:** 37-40
**Change Type:** Modify existing function

### Current Code:
```javascript
const serializeUser = (user) => ({
    walletAddress: user.walletAddress,
    createdAt:     user.createdAt,
});
```

### New Code:
```javascript
const serializeUser = (user) => ({
    walletAddress: user.walletAddress,
    role:          user.role,
    createdAt:     user.createdAt,
});
```

### Impact:
- `/api/auth/signup` response now includes `user.role`
- `/api/auth/login` response now includes `user.role`
- `/api/auth/me` response now includes `user.role`
- Frontend will receive role on every auth operation

### Risk: ZERO (additive only, no breaking changes)

---

## Step 2: Create Admin Seed Script

**File:** `server/scripts/seedAdmin.js` (NEW)
**Purpose:** Grant admin role to a wallet address for demo

### Script Content:
```javascript
'use strict';

/**
 * seedAdmin.js
 * 
 * Usage: node server/scripts/seedAdmin.js 0xYourWalletAddress
 * 
 * Grants admin role to the specified wallet address.
 * Idempotent - safe to run multiple times.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const walletAddress = process.argv[2];

if (!walletAddress) {
    console.error('❌ Usage: node server/scripts/seedAdmin.js 0xYourWalletAddress');
    process.exit(1);
}

// Validate Ethereum address format
if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    console.error('❌ Invalid Ethereum address format.');
    process.exit(1);
}

const lowerAddress = walletAddress.toLowerCase();

async function seedAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const user = await User.findOne({ walletAddress: lowerAddress });

        if (!user) {
            console.error(`❌ User not found: ${lowerAddress}`);
            console.log('💡 Please sign up first, then run this script.');
            await mongoose.disconnect();
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`✅ User ${lowerAddress} is already an admin.`);
            await mongoose.disconnect();
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Successfully promoted ${lowerAddress} to admin!`);
        console.log('💡 You can now login and see the Admin Panel in the sidebar.');
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedAdmin();
```

### Usage:
```bash
node server/scripts/seedAdmin.js 0xYourWalletAddress
```

### Safety Features:
- Validates Ethereum address format
- Checks if user exists before modifying
- Idempotent (safe to run multiple times)
- Proper MongoDB connection cleanup
- Clear success/error messages

### Risk: ZERO (standalone script, doesn't affect running code)

---

## Verification Steps

After completing Phase 1:

1. **Test auth response includes role:**
   ```bash
   # Login and check response
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"walletAddress":"0x...","signature":"0x..."}'
   
   # Response should include: "role": "user" or "role": "admin"
   ```

2. **Test seed script:**
   ```bash
   node server/scripts/seedAdmin.js 0xYourWalletAddress
   # Should output: ✅ Successfully promoted to admin!
   ```

3. **Verify in MongoDB:**
   - Check MongoDB Atlas → `autocon_db` → `users` collection
   - Find your wallet document → `role` field should be `"admin"`

---

## Next Phase Preview

Once Phase 1 is complete and verified, Phase 2 will:
- Add `isAdmin` flag to `AuthContext.jsx`
- Create `AdminRoute.jsx` guard component
- Both changes are frontend-only, zero backend modifications
