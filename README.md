# AutoCon — Smart Contract Generator Platform

## Overview
AutoCon is an advanced Web3 SaaS platform designed to simplify and secure the smart contract lifecycle. It provides an intuitive, end-to-end environment for generating, auditing, and deploying smart contracts without requiring deep Solidity expertise. Powered by AI assistance, AutoCon ensures that developers and creators can launch secure, production-ready contracts efficiently.

## Features

### Core
- **Smart Contract Generation:** Instantly generate ERC20, NFT (ERC721), and English Auction contracts.
- **Live Code Preview:** View and interact with generated Solidity code in real-time.
- **Deployment via MetaMask:** Seamlessly deploy contracts directly to testnets and mainnets using MetaMask integration.

### Security
- **Hybrid Audit System:** Combines static analysis tools (like Slither) with AI-powered vulnerability explanations to ensure your contracts are secure before deployment.

### Integrations
- **IPFS (Pinata):** Built-in decentralized storage integration for NFT metadata.
- **Contract Verification:** Automated verification workflows for block explorers like Etherscan and Polygonscan.

### AI Layer
- **"Suggest for Me":** Auto-configure token and NFT properties based on high-level descriptions.
- **Audit Explanation:** AI-driven breakdown of complex security vulnerabilities into easily understandable language.

### Developer Mode
- **Monaco Editor:** A fully-featured IDE experience right in the browser.
- **Export Center:** Download ABI, raw Solidity code, or complete Hardhat project scaffolding in one click.
- **Contract Reports:** Generate professional PDF reports summarizing your contract's parameters, security posture, and deployment details.

## System Architecture

The AutoCon platform follows a streamlined operational flow:
`User Configuration → Code Generation → AI Security Audit → Deployment → Blockchain Verification → Dashboard Tracking → Project Export`

## Tech Stack

### Frontend
- **Framework:** React
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Editor:** Monaco Editor

### Backend
- **Environment:** Node.js
- **Framework:** Express

### Web3 & Storage
- **Libraries:** ethers.js, MetaMask
- **Decentralized Storage:** IPFS via Pinata

### AI Integration
- **LLMs:** OpenAI / Gemini API

## Installation

### Prerequisites
- Node.js (v16+)
- Git

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/autocon.git
   cd autocon
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd Autocon
   npm install
   ```

3. **Setup environment variables:**
   Create `.env` files in both the root directory and the `Autocon` frontend directory. See the [Environment Variables](#environment-variables-safe) section below for required placeholders.

4. **Run the application:**
   ```bash
   # Run the backend server (from root)
   npm run server
   
   # Run the frontend application (from /Autocon)
   npm run dev
   ```

## Environment Variables (Safe)

**Backend `.env` (Root):**
```env
PORT=5000
MONGO_URI=YOUR_MONGO_DB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
OPENAI_API_KEY=YOUR_API_KEY
PINATA_API_KEY=YOUR_API_KEY
PINATA_SECRET_API_KEY=YOUR_API_KEY
```

**Frontend `.env` (`/Autocon`):**
```env
VITE_API_URL=http://localhost:5000
VITE_RPC_URL=YOUR_RPC_URL
```
*(Do not commit your `.env` files. Ensure they are listed in your `.gitignore`.)*

## Usage

1. **Generate Contract:** Navigate to the desired generator (Token, NFT, Auction) and fill in the required parameters, or use the "Suggest for Me" AI feature.
2. **Audit & Review:** Once the code is generated, use the built-in Security Scanner to audit the contract.
3. **Deploy:** Connect your MetaMask wallet, review the estimated gas costs, and click "Deploy".
4. **Developer Export:** Toggle Developer Mode to view the raw Solidity code, and use the Export Center to download ABIs or Hardhat setups.

## Project Structure

```
autocon/
├── server/            # Node.js Express backend
│   ├── controllers/   # API route logic
│   ├── models/        # Database schemas
│   ├── routes/        # API endpoints
│   └── services/      # Business logic (AI, IPFS, Audit)
└── Autocon/           # React frontend
    ├── src/
    │   ├── components/# Reusable UI components
    │   ├── hooks/     # Custom React hooks (Web3, UI logic)
    │   ├── pages/     # Main route views
    │   ├── store/     # Zustand state management
    │   └── utils/     # Shared utility functions
```

## Future Improvements

- **Subscription System:** Premium tiers for advanced audits and high-frequency deployment.
- **Advanced Analytics:** In-depth dashboard analytics for deployed contract interaction.
- **Multi-Chain Expansion:** Broader support for various EVM and non-EVM compatible blockchains.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
