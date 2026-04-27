const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function test() {
    console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an expert Web3 smart contract architect.
The user wants to configure a Token contract.
Their description of what they want: "Make a doge meme coin"
Current inputs they have already filled (if any): {}

Based on this, suggest optimal smart contract parameters.
Return ONLY a valid JSON object matching this schema exactly. Only include properties relevant to Token:
{
  "suggestions": {
    "supply": 1000000,
    "decimals": 18,
    "mintPrice": "0.05",
    "maxSupply": 10000,
    "duration": 7,
    "minimumBid": "0.1",
    "isMintable": true,
    "isBurnable": false,
    "hasTax": true,
    "taxRate": 5
  },
  "reasoning": "A concise 1-2 sentence explanation of why you chose these parameters."
}`;

    try {
        const result = await model.generateContent(prompt);
        console.log("Result:", result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
