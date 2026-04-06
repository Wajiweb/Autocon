<div align="center">
  <img src="Autocon/public/autocon-logo.png" alt="AutoCon Logo" width="120" />
  <h1>AutoCon</h1>
  <p><strong>A No-Code Web3 Smart Contract SaaS Platform</strong></p>
  
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
  ![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)
</div>


 1. Project Overview

Purpose: 
AutoCon is an enterprise-grade, No-Code Web3 platform designed to demystify blockchain technology. It allows non-technical users and developers to generate, audit, and deploy Ethereum smart contracts seamlessly without writing a single line of Solidity code.

Goals:
(Accessibility): To democratize Web3 development by providing a no-code interface that eliminates the technical barriers of Solidity programming.

(Security & Trust): To ensure contract integrity through a secure deployment pipeline featuring AI-driven auditing and automated Etherscan verification.

(Educational Transparency): To bridge the blockchain knowledge gap using interactive visualizers that translate complex smart contract data into human-readable insights.

Core Features
1. Multi-Standard Asset Generators
Deploy industry-standard contracts in seconds through a guided visual interface:

ERC-20 Token Factory: Create fungible tokens with custom supply, decimals, and ownership logic.

ERC-721 NFT Collections: Launch NFT projects with integrated IPFS metadata support.

Decentralized English Auctions: Deploy time-bound bidding contracts for transparent asset sales.

2.  AI-Powered Security Audit
Safety-first deployment with an integrated vulnerability scanner:

Automated Scans: Detects reentrancy, overflow risks, and access control flaws before deployment.

PDF Audit Export: Generates professional security reports for every contract—perfect for project documentation.

3.  One-Click Etherscan Verification
Build trust instantly by making your code transparent:

Automated Verification: Uses the Etherscan API to verify and publish source code with a single click, obtaining the official "Green Checkmark."

4.  Deployment & Management Dashboard
Contract X-Ray: Provides a detailed breakdown of contract logic and state variables.

Live Gas Estimator: Real-time Gwei/ETH cost tracking based on current Sepolia network congestion.

Deployment Timeline: A step-by-step visual tracker that monitors the lifecycle of a transaction from "Pending" to "Confirmed."

5.  Modern, Theme-Aware UI
Built with React 19 and Tailwind CSS 4.

Dynamic Theming: Uses CSS custom variables (var(--bg), var(--on-surface)) for a consistent, accessible dark/light mode experience.

Smooth Motion: Powered by framer-motion for fluid state transitions and feedback.
2. Installation Guide

Follow these steps to set up the project locally on your machine.

 Prerequisites
Node.js (v18.x or higher)
npm (v9.x or higher)
A MongoDB Atlas URI (or local MongoDB instance)
MetaMask browser extension installed

 Step-by-Step Setup

1. Clone the repository
bash
git clone https://github.com/Wajiweb/Autocon.git
cd Autocon-fyp

2. Install Backend Dependencies
```bash
cd server
npm install
```

3. Configure Backend Environment**
Create a `.env` file inside the `server/` directory:
```env
# server/.env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/autocon_db
JWT_SECRET=your_super_secret_jwt_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
SEPOLIA_RPC_URL=https://rpc.sepolia.org
NODE_ENV=development
```

4. Install Frontend Dependencies
```bash
cd ../Autocon
npm install
```

5. Configure Frontend Environment
Create a `.env` file inside the `Autocon/` directory:
```env
# Autocon/.env
VITE_ETHERSCAN_ENABLED=true
VITE_API_URL=http://127.0.0.1:5000
```

---

 3. Usage Guide

 Running the Project Locally

You will need two terminal windows to run both the frontend and backend servers.

Terminal 1 — Backend:
```bash
cd server
node index.js
# Output:
#  Server running on port 5000
#  Connected to MongoDB Atlas!
```

Terminal 2 — Frontend:
```bash
cd Autocon
npm run dev
# Output:
# ➜  Local:   http://localhost:5173/
```

 Application Workflow Example (Deploying a Token)
1. Open `http://localhost:5173` in your browser.
2. Click **Connect Wallet** and sign the MetaMask message to securely authenticate (SIWE protocol).
3. Navigate to **Token Generator** from your Dashboard.
4. Fill in token details (Name, Symbol, Initial Supply).
5. The Live Code Preview will update instantly. View the visual **AST Graph** to understand the contract structure.
6. Click **Deploy**. The system will estimate gas fees, compile the Solidity code on the server, and prompt MetaMask for deployment.
7. Upon success, use the **Verify on Etherscan** and **Transaction Storyteller** features in the success modal.

---

 4. Architecture & Structure

AutoCon follows a decoupled Client-Server architecture utilizing standard REST APIs and Web3 JSON-RPC communication.

Workflow Architecture
- **Frontend (Client):** Manages wallet context, UI state, form inputs, and directs MetaMask to broadcast signed transactions directly to the Ethereum network.
- **Backend (Server):** Handles heavy computation like Solidity compilation (`solc`), AI audits, IPFS uploading, and stores historical deployment metadata securely in MongoDB.

 Folder Structure
```text
Autocon-fyp/
├── Autocon/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI (Cards, Modals, VerifyButton)
│   │   ├── context/             # React Context (Auth, Theme, Network)
│   │   ├── hooks/               # Custom logic (useWeb3, useWallet, useAuth)
│   │   ├── pages/               # Main routes (Dashboard, Generators, ASTPage)
│   │   └── utils/               # Helpers (ABI Detectors, AST Normalizers)
│   └── .env                     # Frontend configurations
│
└── server/                      # Node.js Backend (Express)
    ├── routes/                  # API endpoints (auth, token, nft, audit, verify)
    ├── models/                  # Mongoose Schemas (User, Token, Contract)
    ├── middleware/              # JWT Auth guards, Rate Limiters
    ├── templates/               # Base Solidity templates (.txt/.sol)
    ├── index.js                 # Entry point & Express configuration
    └── .env                     # Backend secrets
```

---

5. Technologies Used

Frontend:
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4, Framer Motion (Animations)
- **Web3 Interaction:** ethers.js v6
- **Data Visualization:** Chart.js, React-Three-Fiber (3D models)

Backend:
- **Server:** Node.js, Express 5
- **Database:** MongoDB Atlas, Mongoose v9
- **Compilation:** `solc` (Solidity Compiler)
- **Security:** Helmet, express-rate-limit, cors

Blockchain / DevOps:
- **Network:** Ethereum Sepolia Testnet
- **Authentication:** SIWE (Sign-In with Ethereum) utilizing JWTs.
- **Storage:** IPFS (via Pinata APIs)

---

6. API Documentation

Complete interaction with the AutoCon backend requires a Bearer JWT obtained during the MetaMask login flow.

### Setup Base URL
`http://127.0.0.1:5000/api`

 1. Authentication (SIWE)
- `GET /auth/nonce/:walletAddress`
  - **Purpose:** Fetches a cryptographic nonce for signing.
  - **Response:** `{ "success": true, "message": "Sign this message..." }`

- `POST /auth/verify`
  - **Purpose:** Verifies the signed message and returns a JWT.
  - **Body:** `{ "walletAddress": "0x...", "signature": "0x..." }`
  - **Response:** `{ "success": true, "token": "ey...", "user": {...} }`

 2. Contract Generation & Compilation
- **`POST /generate-token`** *(Auth required)*
  - **Purpose:** Injects parameters into the ERC-20 template and compiles via `solc`.
  - **Body:** `{ "name": "MyToken", "symbol": "MTK", "supply": 1000, "ownerAddress": "0x..." }`
  - **Response:** 
    ```json
    {
      "success": true,
      "abi": [...],
      "bytecode": "0x60806040...",
      "ast": {...}
    }
    ```
3. Analytics & Saving
- **`POST /deploy-token`** *(Auth required)*
  - **Purpose:** Saves the successfully deployed contract data to the user's dashboard.
  - **Body:** `{ "name": "...", "symbol": "...", "contractAddress": "0x...", "network": "Sepolia" }`

---
 8. Contributing Guidelines

We welcome community contributions! Please follow the steps below if you wish to help improve AutoCon.

1. **Fork the Repository:** Create your own branch from `main`.
2. **Create a Feature Branch:** 
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes:** Write clear, concise commit messages.
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request:** Navigate to the original repository and submit your PR for review. Ensure your code passes the existing ESLint configurations (`npm run lint`).

---
 9. License

This project is distributed under the **ISC License**. See the `LICENSE` file for more information.

*Built as a Final Year Project constraint for modern Web3 infrastructure automation.*
