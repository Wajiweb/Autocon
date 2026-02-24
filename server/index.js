const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: "AutoCon Backend is Alive and Running!" });
});

// 2. Token Generation Route (Must be BEFORE app.listen)
app.post('/api/generate-token', (req, res) => {
    console.log("--- New Request Received ---");
    console.log("Data:", req.body);

    const { name, symbol, supply, ownerAddress } = req.body;

    try {
        const templatePath = path.join(__dirname, 'templates', 'ERC20Template.txt');
        let contractCode = fs.readFileSync(templatePath, 'utf8');

        // Clean name for the Contract Class
        const className = name.replace(/\s+/g, '');

        // Perform Replacements
        let result = contractCode
            .replace(/{{CONTRACT_NAME}}/g, className)
            .replace(/{{TOKEN_NAME}}/g, name)
            .replace(/{{TOKEN_SYMBOL}}/g, symbol)
            .replace(/{{SUPPLY}}/g, supply)
            // Match the variables in your specific constructor
            .replace(/initialOwner/g, ownerAddress)
            .replace(/initialSupply/g, supply)
            // Clean up unused placeholders
            .replace(/{{IMPORT_BURNABLE}}/g, "")
            .replace(/{{IMPORT_PAUSABLE}}/g, "")
            .replace(/{{INHERIT_BURNABLE}}/g, "")
            .replace(/{{INHERIT_PAUSABLE}}/g, "")
            .replace(/{{FUNCTION_MINT}}/g, "")
            .replace(/{{FUNCTION_PAUSE}}/g, "");

        console.log("--- Contract Generated Successfully ---");
        res.json({ success: true, contractCode: result });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ success: false, error: "Generation failed" });
    }
});

// 3. Start Server (This should always be at the bottom)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
    console.log(`Ready to generate contracts!`);
});