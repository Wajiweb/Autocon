# AutoCon — Automated Smart Contract Generator

<div align="center">
  <img src="Autocon/public/autocon-logo.png" alt="AutoCon Logo" width="120" />

  <h3>No-Code Web3 Smart Contract Platform</h3>
  <p>Deploy ERC-20 tokens, NFT collections, and auction contracts in minutes — no Solidity expertise required.</p>

  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
  ![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)
  ![MetaMask](https://img.shields.io/badge/MetaMask-Auth-F6851B?logo=metamask)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [Pages & Screens](#-pages--screens)
- [API Reference](#-api-reference)
- [Authentication Flow](#-authentication-flow)
- [Smart Contract Types](#-smart-contract-types)
- [Security Features](#-security-features)
- [Design System](#-design-system)
- [Contributing](#-contributing)

---

## 🌐 Overview

**AutoCon** is a full-stack Web3 SaaS platform that lets users generate, audit, and deploy Ethereum smart contracts without writing any Solidity code. Built for the Sepolia testnet, it leverages MetaMask for authentication and ethers.js for blockchain interactions.

Users connect their wallet, fill out a form, and receive a deployable Solidity contract — ready to go live on the blockchain in under 30 seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🪙 **ERC-20 Token Generator** | Create custom fungible tokens with mint controls, supply cap, and ownership |
| 🎨 **NFT Generator** | Deploy ERC-721 collections with IPFS metadata, paid minting, and burn support |
| 🔨 **Auction Generator** | Launch decentralized English auctions with timed bidding and auto-refunds |
| 🛡️ **Security Audit** | AI-powered Solidity vulnerability scanner (reentrancy, overflow, access control) |
| 🤖 **AI Assistant** | On-platform chatbot for Web3 & Solidity questions |
| 📚 **Template Library** | Pre-built contract templates for common use cases |
| 🔗 **Contract Explorer** | Interact with any deployed contract via ABI interface |
| ⛽ **Gas Estimator** | Real-time deployment cost estimation before spending ETH |
| 🌐 **Hosted Mini-Sites** | Auto-generated shareable interfaces for every deployed contract |
| ✅ **Etherscan Verification** | Automated post-deployment contract verification |
| 📊 **Analytics Dashboard** | Charts and stats for all deployed contracts |
| 📄 **CSV / PDF Export** | Export deployment history in multiple formats |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| ethers.js | 6 | Blockchain/wallet interaction |
| react-hot-toast | 2 | Toast notifications |
| chart.js + react-chartjs-2 | 4/5 | Dashboard analytics charts |
| canvas-confetti | 1.9 | Deployment celebration |
| TailwindCSS | 4 | Utility styles |
| Inter / Space Grotesk | — | Typography (Google Fonts) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5 | REST API server |
| MongoDB + Mongoose | 9 | Database |
| jsonwebtoken | 9 | JWT authentication |
| solc | 0.8.20 | On-server Solidity compilation |
| ethers.js | 6 | Contract deployment & gas estimates |
| multer | 2 | IPFS file uploads |
| helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | Brute-force protection |
| cors | 2 | Cross-origin requests |

### Blockchain
| | |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Wallet** | MetaMask (via `window.ethereum`) |
| **Auth** | Sign-In with Ethereum (nonce-based message signing) |
| **Standards** | ERC-20, ERC-721 (OpenZeppelin v5) |

---

## 📁 Project Structure

```
Autocon-fyp/
├── Autocon/                    # Frontend (React + Vite)
│   ├── public/
│   │   └── autocon-logo.png    # App logo
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx     # Collapsible navigation sidebar
│       │   ├── Navbar.jsx      # Sticky top navigation bar
│       │   ├── GasWidget.jsx   # Live gas price tracker
│       │   └── CodeExportTools.jsx  # Copy/download contract code
│       ├── context/
│       │   ├── AuthContext.jsx     # MetaMask auth + JWT state
│       │   ├── ThemeContext.jsx    # Dark/Light mode
│       │   └── NetworkContext.jsx  # Multi-chain network selector
│       ├── hooks/
│       │   ├── useWeb3.js      # Token contract deploy hook
│       │   ├── useNFT.js       # NFT contract deploy hook
│       │   └── useAuction.js   # Auction contract deploy hook
│       ├── pages/
│       │   ├── LandingPage.jsx     # Public marketing page
│       │   ├── LoginPage.jsx       # MetaMask sign-in
│       │   ├── Dashboard.jsx       # Main overview + analytics
│       │   ├── TokenGenerator.jsx  # ERC-20 generator form
│       │   ├── NFTGenerator.jsx    # ERC-721 generator form
│       │   ├── AuctionGenerator.jsx # Auction generator form
│       │   ├── AuditPage.jsx       # AI security scanner
│       │   ├── ChatbotPage.jsx     # AI assistant chat
│       │   ├── ContractInteraction.jsx  # Contract explorer
│       │   ├── ProfilePage.jsx     # User profile + history
│       │   └── TemplateLibrary.jsx # Pre-built templates
│       ├── utils/              # Helpers and utilities
│       ├── config.js           # API base URL config
│       ├── App.jsx             # Root app + routing
│       └── index.css           # Global design system tokens
│
└── server/                     # Backend (Node.js + Express)
    ├── routes/
    │   ├── authRoutes.js       # Sign-in / nonce / verify
    │   ├── nftRoutes.js        # NFT generation & deployment
    │   ├── auctionRoutes.js    # Auction generation & deployment
    │   ├── auditRoutes.js      # Solidity security audit
    │   ├── chatRoutes.js       # AI chatbot
    │   ├── gasRoutes.js        # Gas estimation
    │   ├── ipfsRoutes.js       # IPFS file upload
    │   ├── verifyRoutes.js     # Etherscan verification
    │   └── siteRoutes.js       # Hosted contract mini-sites
    ├── models/                 # Mongoose DB schemas
    ├── middleware/
    │   ├── auth.js             # JWT auth middleware
    │   └── rateLimiter.js      # Rate-limit configurations
    ├── templates/              # Solidity contract templates
    ├── index.js                # Express app entry point
    └── .env                    # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MetaMask** browser extension
- A **MongoDB Atlas** account (or local MongoDB)
- **Sepolia testnet ETH** (get from [sepoliafaucet.com](https://sepoliafaucet.com))

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Wajiweb/Autocon.git
cd Autocon-fyp
```

**2. Install backend dependencies**
```bash
cd server
npm install
```

**3. Install frontend dependencies**
```bash
cd ../Autocon
npm install
```

---

### Environment Variables

Create a `.env` file inside the `server/` directory:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/autocon_db

# JWT secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Allowed frontend origins (CORS)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Ethereum Sepolia RPC endpoint
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Environment
NODE_ENV=development
```

> **Note:** Never commit your `.env` file. It is already in `.gitignore`.

---

### Running the Project

**Terminal 1 — Start the backend server:**
```bash
cd server
node index.js
```
Output:
```
🚀 Server running on port 5000
✅ Connected to MongoDB Atlas!
```

**Terminal 2 — Start the frontend dev server:**
```bash
cd Autocon
npm run dev
```
Output:
```
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 📱 Pages & Screens

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Public marketing homepage |
| `/login` | Login | MetaMask wallet sign-in |
| `/dashboard` | Dashboard | Overview, stats, deployment history |
| `/dashboard → token` | Token Generator | ERC-20 creation form |
| `/dashboard → nft` | NFT Generator | ERC-721 collection form with IPFS |
| `/dashboard → auction` | Auction Generator | English auction contract form |
| `/dashboard → audit` | Security Audit | AI Solidity vulnerability scanner |
| `/dashboard → chatbot` | AI Assistant | Web3 Q&A chatbot |
| `/dashboard → interact` | Contract Explorer | Read/write to any deployed contract |
| `/dashboard → templates` | Template Library | Pre-built contract templates |
| `/dashboard → profile` | My Profile | User info, wallet, contract history |

---

## 🔌 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/nonce/:address` | ❌ | Get a sign-in nonce for a wallet |
| `POST` | `/verify` | ❌ | Verify signature → return JWT |
| `GET` | `/me` | ✅ | Get current user info |

### Token Routes — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate-token` | ✅ | Generate & compile ERC-20 Solidity |
| `POST` | `/deploy-token` | ✅ | Deploy ERC-20 to blockchain |
| `POST` | `/estimate-gas` | ✅ | Estimate token deployment gas cost |
| `GET` | `/tokens` | ✅ | Get user's deployed tokens |
| `DELETE` | `/tokens/:id` | ✅ | Delete a token record |

### NFT Routes — `/api/nft`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate` | ✅ | Generate ERC-721 Solidity code |
| `POST` | `/deploy` | ✅ | Deploy NFT collection |
| `POST` | `/estimate-gas` | ✅ | Estimate NFT deployment gas |
| `GET` | `/list` | ✅ | Get user's deployed NFTs |
| `DELETE` | `/:id` | ✅ | Delete NFT record |

### Auction Routes — `/api/auction`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate` | ✅ | Generate auction contract code |
| `POST` | `/deploy` | ✅ | Deploy auction to blockchain |
| `POST` | `/estimate-gas` | ✅ | Estimate auction deployment gas |
| `GET` | `/list` | ✅ | Get user's deployed auctions |
| `DELETE` | `/:id` | ✅ | Delete auction record |

### Other Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/audit` | ✅ | AI security scan of Solidity code |
| `POST` | `/api/chat` | ✅ | AI chatbot message |
| `GET` | `/api/gas/estimate` | ✅ | Live gas price from network |
| `POST` | `/api/ipfs/upload` | ✅ | Upload file to IPFS |
| `POST` | `/api/verify` | ✅ | Verify contract on Etherscan |
| `GET` | `/api/site/view` | ❌ | Render hosted contract mini-site |
| `GET` | `/api/health` | ❌ | Server health check |

---

## 🔐 Authentication Flow

AutoCon uses **Sign-In With Ethereum (SIWE)** — a cryptographic, passwordless login:

```
1. User clicks "Sign In with MetaMask"
2. Frontend requests accounts via MetaMask (eth_requestAccounts)
3. Frontend fetches a random nonce from GET /api/auth/nonce/:address
4. MetaMask asks user to sign the nonce message
5. Signed message is sent to POST /api/auth/verify
6. Server recovers the signing address using ethers.recoverAddress()
7. If address matches → generate JWT token → return to client
8. JWT is stored in localStorage and sent as Bearer token on all future requests
```

> Sessions expire automatically. Users are redirected to login on 401 responses.

---

## 📜 Smart Contract Types

### ERC-20 Token
```
Fields: Name, Symbol, Initial Supply, Decimals, Owner Address
Features: Mintable, Burnable, Transfer, Approve/Allowance
Standard: OpenZeppelin ERC20 v5
```

### ERC-721 NFT Collection
```
Fields: Collection Name, Symbol, Max Supply, Mint Price, Base URI, Owner
Features: Paid minting, IPFS metadata, burn support, owner withdraw
Standard: OpenZeppelin ERC721URIStorage v5
Upload: IPFS via Pinata (with local fallback)
```

### English Auction
```
Fields: Contract Name, Item Name/Description, Duration, Minimum Bid, Owner
Features: Timed bidding, auto-refund for outbid users, time extension, withdraw
Logic: Highest bid wins, all losing bids auto-refunded
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| **Input Sanitization** | All user inputs sanitized with regex before compilation |
| **JWT Authentication** | HS256 signed tokens, 7-day expiry |
| **Rate Limiting** | 100 req/min general, 5 req/min on auth endpoints |
| **CORS Protection** | Strict origin whitelist from `.env` |
| **HTTP Headers** | Helmet middleware sets security headers |
| **ObjectId Validation** | `mongoose.Types.ObjectId.isValid()` on all delete endpoints |
| **Address Validation** | `ethers.isAddress()` on all contract save endpoints |
| **RegExp Safety** | No dynamic regex from user input |

---

## 🎨 Design System

AutoCon uses the **"Kinetic Ether"** design system — a Stripe/Vercel/ChainGPT-inspired dark Web3 aesthetic.

### Color Tokens
```css
--bg:              #080c14   /* Deep space background */
--surface-high:    #161d2b   /* Card surfaces */
--primary:         #a78bfa   /* Purple accent */
--primary-gradient: linear-gradient(135deg, #7C3AED, #2563EB, #06B6D4)
--tertiary:        #67e8f9   /* Cyan accent */
--success:         #10b981
--error:           #ef4444
```

### Typography
- **Font:** Inter (primary), Space Grotesk (headings)
- **H1:** 900 weight, -0.04em letter-spacing, clamp(2.5rem, 6vw, 5rem)
- **Body:** 0.9rem, 1.6 line-height

### Key Components
- **Cards:** `backdrop-filter: blur(16px)` glassmorphism with gradient top-line
- **Buttons:** Gradient primary, transparent ghost, danger variants
- **Sidebar:** Collapsible 252px ↔ 72px with smooth transition
- **Navbar:** Sticky 64px with heavy blur backdrop

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request**

---

## 📄 License

This project was built as a Final Year Project (FYP). All rights reserved.

---

<div align="center">
  <p>Built with ❤️ by the AutoCon Team</p>
  <p>
    <a href="http://localhost:5173">Live App</a> •
    <a href="http://localhost:5000/api/health">API Health</a>
  </p>
</div>
