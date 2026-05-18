# Contract Verification Fix - Implementation Plan

## Root Cause
Bytecode mismatch because frontend sends hardcoded compiler version `v0.8.20+commit.a1b79de6` to Etherscan, but backend actually compiles with `solc@0.8.35`.

## Changes Required

---

### 1. `server/controllers/tokenController.js` (Line 148-150)

**Current:**
```javascript
const { abi, bytecode, ast } = compileContract(finalCode, 'Token.sol', className, true);

return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, ast } });
```

**Change to:**
```javascript
const { abi, bytecode, ast, compilerVersion } = compileContract(finalCode, 'Token.sol', className, true);

return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, ast, compilerVersion } });
```

---

### 2. `server/controllers/nftController.js` (Line 170-172)

**Current:**
```javascript
const { abi, bytecode } = compileContract(finalCode, 'NFT.sol', className);

return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className } });
```

**Change to:**
```javascript
const { abi, bytecode, compilerVersion } = compileContract(finalCode, 'NFT.sol', className);

return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className, compilerVersion } });
```

---

### 3. `server/controllers/auctionController.js` (Find compile line)

**Change:**
```javascript
// Find: const { abi, bytecode } = compileContract(finalCode, 'Auction.sol', className);
// Change to:
const { abi, bytecode, compilerVersion } = compileContract(finalCode, 'Auction.sol', className);

// Add compilerVersion to response:
return res.json({ success: true, data: { contractCode: finalCode, abi, bytecode, contractName: className, compilerVersion } });
```

---

### 4. `server/workers/verification.worker.js` (Line 183)

**Current:**
```javascript
params.append('constructorArguements', clean);
```

**Change to:**
```javascript
params.append('constructorArguments', clean);
```

---

### 5. `server/controllers/verify.controller.js` (Line 84)

**Current:**
```javascript
params.append('constructorArguements', cleanArgs);
```

**Change to:**
```javascript
params.append('constructorArguments', cleanArgs);
```

---

### 6. `server/services/compilerService.js` (Line 34-46)

**Current:**
```javascript
const input = {
    language: 'Solidity',
    sources: { [fileName]: { content: sourceCode } },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            '*': { '*': ['abi', 'evm.bytecode.object'] },
            ...(includeAST ? { '': { '': ['ast'] } } : {})
        }
    }
};
```

**Change to:**
```javascript
const input = {
    language: 'Solidity',
    sources: { [fileName]: { content: sourceCode } },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        evmVersion: 'paris',
        outputSelection: {
            '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] },
            ...(includeAST ? { '': { '': ['ast'] } } : {})
        }
    }
};
```

---

### 7. `server/workers/verification.worker.js` (Line 107-125)

**Current:**
```javascript
const standardJson = {
    language: "Solidity",
    sources: sources,
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            "*": {
                "*": [
                    "evm.bytecode",
                    "evm.deployedBytecode",
                    "abi"
                ]
            }
        }
    }
};
```

**Change to:**
```javascript
const standardJson = {
    language: "Solidity",
    sources: sources,
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        evmVersion: 'paris',
        outputSelection: {
            "*": {
                "*": [
                    "evm.bytecode",
                    "evm.deployedBytecode",
                    "abi"
                ]
            }
        }
    }
};
```

---

### 8. `Autocon/src/hooks/useWeb3.js` (Lines 219, 244)

**Current:**
```javascript
compilerVersion: 'v0.8.20+commit.a1b79de6',
```

**Change to:**
```javascript
compilerVersion: contractData.compilerVersion || 'v0.8.20+commit.a1b79de6',
```

Apply this change in BOTH places (lines 219 and 244).

---

### 9. `Autocon/src/components/dashboard/DeploymentTable.jsx` (Line 89)

**Current:**
```javascript
compilerVersion: item.compilerVersion || 'v0.8.20+commit.a1b79de6',
```

**Change to:**
```javascript
compilerVersion: item.compilerVersion || 'v0.8.35+commit.0a736e7a',
```

---

### 10. `Autocon/src/pages/WizardComponents.jsx` (Lines 416, 531)

**Current:**
```javascript
compilerVersion: 'v0.8.20+commit.a1b79de6',
```

**Change to:**
```javascript
compilerVersion: 'v0.8.35+commit.0a736e7a',
```

Apply in BOTH places.

---

### 11. `Autocon/src/components/deploy/DeploySuccessModal.jsx`

**Find where compilerVersion is used and ensure it comes from props, not hardcoded.**

---

## Verification After Changes

1. Restart backend: `cd server && npm start`
2. Deploy a new contract
3. Check that `compilerVersion` in the response matches actual solc version
4. Try verification - should now succeed

## Why This Fixes It

| Before | After |
|--------|-------|
| Etherscan compiles with v0.8.20 | Etherscan compiles with v0.8.35 (actual version) |
| Bytecode differs | Bytecode matches exactly |
| Verification fails | Verification succeeds |
