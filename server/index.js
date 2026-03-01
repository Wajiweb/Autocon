require('dotenv').config(); // MUST BE AT THE VERY TOP
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const solc = require('solc'); // The compiler you just installed
const mongoose = require('mongoose'); // NEW: Import Mongoose
const Token = require('./models/Token'); // ADD THIS LINE

const app = express();
app.use(cors()); 
app.use(express.json()); 
// --- NEW: MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
// ------------------------------

// ... (keep the rest of your api routes below here)

app.get('/api/health', (req, res) => {
    res.json({ message: "AutoCon Backend is Alive and Running!" });
});

app.post('/api/generate-token', (req, res) => {
    console.log("--- Compiling Contract ---");
    const { name, symbol, supply, ownerAddress } = req.body;

    try {
        const templatePath = path.join(__dirname, 'templates', 'ERC20Template.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');
        const className = name.replace(/\s+/g, '');

        // 1. Generate the Text
        let finalCode = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{TOKEN_NAME}}/g, name)
            .replace(/{{TOKEN_SYMBOL}}/g, symbol)
            .replace(/{{SUPPLY}}/g, supply)
            //.replace(/initialOwner/g, ownerAddress)
            //.replace(/initialSupply/g, supply)
            // Cleanup template placeholders
            .replace(/{{IMPORT_BURNABLE}}/g, "").replace(/{{IMPORT_PAUSABLE}}/g, "")
            .replace(/{{INHERIT_BURNABLE}}/g, "").replace(/{{INHERIT_PAUSABLE}}/g, "")
            .replace(/{{FUNCTION_MINT}}/g, "").replace(/{{FUNCTION_PAUSE}}/g, "");

     // Inside your app.post('/api/generate-token'...)
// Replace the Compilation Logic section with this:

const input = {
    language: 'Solidity',
    sources: { 'Token.sol': { content: finalCode } },
    settings: {
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } }
    }
};

// This function helps the compiler find OpenZeppelin files on your computer
function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const actualPath = path.resolve(__dirname, 'node_modules', importPath);
            return { contents: fs.readFileSync(actualPath, 'utf8') };
        }
        return { error: 'File not found' };
    } catch (e) {
        return { error: 'File not found: ' + e.message };
    }
}

// Compile with the Resolver
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
        console.error("COMPILATION ERRORS:", errors);
        return res.status(500).json({ success: false, error: "Solidity Compilation Failed" });
    }
}

const contractData = output.contracts['Token.sol'][className];
        
        // Catch any Solidity syntax errors
        if (output.errors && output.errors.some(err => err.severity === 'error')) {
            console.error(output.errors);
            return res.status(500).json({ success: false, error: "Compilation Failed" });
        }

        // 3. Send all three pieces back to React
        res.json({ 
            success: true, 
            contractCode: finalCode,
            abi: contractData.abi,
            bytecode: contractData.evm.bytecode.object 
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "Generation failed" });
    }
});
// --- NEW: Save Deployed Token to Database ---
app.post('/api/save-token', async (req, res) => {
    try {
        const { name, symbol, contractAddress, ownerAddress, network } = req.body;

        // Create a new token record using your blueprint
        const newToken = new Token({
            name,
            symbol,
            contractAddress,
            ownerAddress,
            network
        });
               // Save it permanently to MongoDB Atlas
        await newToken.save();
        
        console.log(`💾 Saved ${name} to database!`);
        res.status(201).json({ success: true, message: 'Token saved successfully!' });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Failed to save token" });
    }
});

// --- NEW: Fetch Tokens for the Dashboard ---
app.get('/api/my-tokens/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Find all tokens that belong to this specific MetaMask wallet
        // .sort({ createdAt: -1 }) puts the newest tokens at the top of the list
        const userTokens = await Token.find({ 
            ownerAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
        }).sort({ createdAt: -1 });

        res.json({ success: true, tokens: userTokens });
        
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch tokens" });
    }
});
// --- NEW: Delete a Deployment ---
app.delete('/api/delete-token/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Token.findByIdAndDelete(id);
        
        console.log(`🗑️ Token ${id} deleted from database.`);
        res.json({ success: true, message: "Deployment removed from registry." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, error: "Failed to delete token." });
    }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));