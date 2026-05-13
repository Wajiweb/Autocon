# AutoCon — No-Code Smart Contract Platform

<div align="center">

![AutoCon Logo](Autocon/public/autocon-logo.png)

**Deploy production-ready smart contracts in minutes — no Solidity experience required.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6-3C3C3D?logo=ethereum&logoColor=white)](https://ethers.org)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/Wajiweb/Autocon/issues) · [Documentation](#architecture-overview)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
- [Platform Walkthrough](#platform-walkthrough)
  - [Landing Page](#landing-page)
  - [Authentication](#authentication)
  - [Dashboard](#dashboard)
  - [Contract Wizard](#contract-wizard)
  - [AI Security Audit](#ai-security-audit)
  - [Deployment Registry](#deployment-registry)
  - [Analytics Page](#analytics-page)
- [Supported Networks](#supported-networks)
- [Smart Contract Templates](#smart-contract-templates)
- [Security Model](#security-model)
- [FYP Context](#fyp-context)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

**AutoCon** is a full-stack Web3 platform that eliminates the technical barrier to smart contract development. It enables developers, entrepreneurs, and students to:

1. **Generate** production-ready Solidity smart contracts using a guided no-code wizard.
2. **Audit** every contract automatically using a Gemini-powered AI security engine before deployment.
3. **Deploy** contracts directly to EVM-compatible testnets via MetaMask with a single click.
4. **Manage** all deployed contracts through a live deployment registry with explorer links and status tracking.
5. **Monitor** on-chain analytics including live block data, gas fees, and contract event feeds.

AutoCon was built as a Final Year Project (FYP) to demonstrate the convergence of AI, blockchain, and modern full-stack web development into a coherent, production-grade developer tool.

---

## Key Features

| Feature | Description |
|---|---|
| 🧙 **No-Code Contract Wizard** | 4-step guided wizard to configure and generate ERC-20, ERC-721, or Auction contracts |
| 🤖 **AI Security Audit** | Gemini-powered audit engine that scans every contract for vulnerabilities before deployment |
| 🚀 **One-Click Deployment** | MetaMask-integrated deployment directly from the browser to Sepolia or BNB Testnet |
| 📋 **Deployment Registry** | Persistent log of all deployed contracts with explorer links, status badges, and metadata |
| 📊 **Live Analytics** | Real-time Ethereum network data — block height, base fee, gas prices, and event feeds |
| 🎨 **Monaco Code Editor** | Full Solidity syntax highlighting and inline linting in the Review step |
| 🔒 **Wallet-Based Auth** | Non-custodial, nonce-signed MetaMask authentication — no passwords, no custody |
| 🌐 **Multi-Chain** | Deploy to Sepolia (Ethereum L1) and BNB Testnet (BNB Chain L1) |
| 🧩 **Template Library** | Pre-built, audited contract templates for rapid deployment |
| 🎓 **Onboarding Tour** | Interactive Driver.js guided tour for first-time users |
| 📱 **Responsive UI** | Collapsible sidebar, responsive grid layouts, mobile-first design |
| 🌙 **Dark Mode** | Premium glassmorphic dark theme throughout |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 7 | Build tool & dev server |
| **React Router DOM** | 7 | Client-side routing |
| **Ethers.js** | 6 | Blockchain interaction, wallet, deployment |
| **Framer Motion** | 12 | Animations and transitions |
| **Zustand** | 5 | Lightweight global state management |
| **TanStack Query** | 5 | Server state, caching, background refetching |
| **Chart.js + react-chartjs-2** | 4 | Live analytics charts |
| **Monaco Editor** | 4 | Solidity code preview with linting |
| **Driver.js** | 1 | Interactive onboarding tour |
| **Lucide React** | 0.57 | Icon system |
| **Tailwind CSS** | 4 | Utility styling |
| **react-hot-toast** | 2 | Toast notification system |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Contract metadata and user data persistence |
| **Google Gemini API** | AI-powered security audit engine |
| **Hardhat / solc** | Solidity compilation and bytecode generation |
| **Etherscan/BscScan API** | Contract verification on-chain |
| **JWT + Nonce Auth** | Wallet-based authentication tokens |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     BROWSER                         │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐  │
│  │  React SPA   │◄──►│   MetaMask Extension     │  │
│  │  (Vite)      │    │   (Wallet / Signer)      │  │
│  └──────┬───────┘    └──────────────────────────┘  │
│         │                                           │
└─────────┼───────────────────────────────────────────┘
          │ HTTPS / REST API
          ▼
┌─────────────────────────────────────────────────────┐
│               EXPRESS BACKEND (Node.js)             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  /api/   │  │  /api/   │  │     /api/        │  │
│  │  token   │  │   nft    │  │     audit        │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │             │                 │             │
│  ┌────▼─────────────▼─────┐    ┌──────▼──────────┐  │
│  │    Solidity Compiler   │    │  Gemini AI API  │  │
│  │    (solc / Hardhat)    │    │  (Audit Engine) │  │
│  └────────────┬───────────┘    └─────────────────┘  │
│               │                                     │
│  ┌────────────▼───────────┐                         │
│  │       MongoDB          │                         │
│  │  (Contracts, Users,    │                         │
│  │   Audit Reports)       │                         │
│  └────────────────────────┘                         │
└─────────────────────────────────────────────────────┘
          │
          │ RPC calls (ethers.js)
          ▼
┌─────────────────────────────────────────────────────┐
│               EVM TESTNETS                          │
│                                                     │
│   ┌─────────────────┐    ┌─────────────────────┐   │
│   │  Sepolia         │    │   BNB Testnet        │   │
│   │  (Ethereum L1)   │    │   (BNB Chain L1)     │   │
│   └─────────────────┘    └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Data Flow: Contract Deployment

```
User fills Wizard → Backend generates Solidity → AI audits code
→ Frontend shows Monaco preview → User clicks Deploy
→ ethers.js compiles & sends via MetaMask → On-chain confirmation
→ Backend saves to MongoDB → Registry updated instantly
```

---

## Project Structure

```
Autocon-fyp/
├── Autocon/                    # Frontend (React + Vite)
│   ├── public/
│   │   └── autocon-logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # Sidebar, TopBar, DeploymentTable, AssetCard
│   │   │   ├── deploy/         # DeploySuccessModal, MiniSiteGenerator
│   │   │   ├── layout/         # Container, PageWrapper
│   │   │   ├── sections/       # Landing page sections (Hero, Features, FAQ...)
│   │   │   └── ui/             # Shared UI primitives (Sparkline, Badge, etc.)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Wallet-based auth (sign/verify nonce)
│   │   │   ├── NetworkContext.jsx  # Active network state, MetaMask sync
│   │   │   └── ThemeContext.jsx    # Light/dark theme
│   │   ├── hooks/
│   │   │   ├── useWallet.js        # MetaMask connect, account, chain
│   │   │   ├── useWeb3.js          # ERC-20 deployment helpers
│   │   │   ├── useNFT.js           # ERC-721 deployment helpers
│   │   │   └── useLandingQuery.js  # Landing page static data
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Public marketing page
│   │   │   ├── LoginPage.jsx       # MetaMask auth UI
│   │   │   ├── Dashboard.jsx       # Executive overview
│   │   │   ├── ContractWizard.jsx  # Main wizard shell
│   │   │   ├── WizardComponents.jsx# Wizard steps 1-4
│   │   │   ├── AuditPage.jsx       # AI security audit interface
│   │   │   ├── AnalyticsPage.jsx   # Live blockchain analytics
│   │   │   ├── TemplateLibrary.jsx # Pre-built contract templates
│   │   │   ├── JobsPage.jsx        # Background job monitor
│   │   │   └── ProfilePage.jsx     # User profile & settings
│   │   ├── store/
│   │   │   ├── useWizardStore.js   # Wizard session state (Zustand)
│   │   │   └── useTransactionStore.js # Transaction history (Zustand)
│   │   ├── services/               # API client utilities
│   │   ├── lib/                    # Motion variants, helpers
│   │   ├── utils/                  # Asset tokens, formatters
│   │   ├── App.jsx                 # Root layout, routing, sidebar state
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global design system tokens
│   ├── package.json
│   └── vite.config.js
│
└── backend/                    # Backend (Node.js + Express)
    ├── controllers/
    │   ├── tokenController.js      # ERC-20 generation + save
    │   ├── nftController.js        # ERC-721 generation + save
    │   ├── auctionController.js    # Auction generation + save
    │   └── auditController.js      # Gemini AI audit pipeline
    ├── models/
    │   ├── Token.js                # ERC-20 MongoDB schema
    │   ├── NFT.js                  # ERC-721 MongoDB schema
    │   ├── Auction.js              # Auction MongoDB schema
    │   └── User.js                 # User (wallet) schema
    ├── routes/
    ├── middleware/
    │   └── auth.js                 # JWT verification middleware
    ├── workers/
    │   └── verificationWorker.js   # Background contract verification
    ├── .env.example
    └── server.js
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org)
- **npm** ≥ 9.x (comes with Node.js)
- **MongoDB** — Local instance or [MongoDB Atlas](https://cloud.mongodb.com) (free tier)
- **MetaMask** browser extension — [Install](https://metamask.io)
- **Git** — [Download](https://git-scm.com)

You will also need API keys for:
- **Google Gemini API** — [Get key](https://aistudio.google.com)
- **Etherscan API** (optional, for verification) — [Get key](https://etherscan.io/apis)
- **BscScan API** (optional) — [Get key](https://bscscan.com/apis)

---

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Wajiweb/Autocon.git
cd Autocon/Autocon

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

### Backend Setup

```bash
# Navigate to the backend directory
cd ../backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials (see below)

# Start the backend server
npm run dev
```

The backend API will be available at **http://localhost:5000**

---

### Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/autocon
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/autocon

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI (for security audits)
GEMINI_API_KEY=your_gemini_api_key_here

# Contract Verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Platform Walkthrough

### Landing Page
The public-facing marketing page (`/`) showcases AutoCon's capabilities with:
- Animated hero section with live stats
- Feature grid (No-Code Deploy, AI Audit, Multi-Chain, Templates)
- Platform comparison table vs. manual development
- FAQ section
- CTA sections

### Authentication
AutoCon uses **non-custodial wallet authentication**:

1. User clicks "Sign In with MetaMask"
2. Backend generates a one-time **nonce** for the wallet address
3. MetaMask signs the nonce (no gas required)
4. Backend verifies the signature and issues a **JWT**
5. All subsequent API calls use the JWT for authorization

No passwords. No seed phrase exposure. No custody.

### Dashboard
The main hub (`/dashboard`) displays:
- **Executive Overview Cards** — Total deployments, contracts, audit status
- **Network status** — Live chain indicator with active network
- **Deployment Registry** — Paginated table of all deployed contracts
- **System notifications** — Audit and deployment activity feed

The sidebar is **fully collapsible** — click the `«` toggle to compress it to icon-only mode for maximum workspace.

### Contract Wizard
The 4-step guided wizard (`/wizard`) supports three contract types:

#### Step 1: Select Type
Choose from:
- **ERC-20 Token** — Fungible token with optional mint, burn, pause, anti-whale, and tax features
- **NFT Collection (ERC-721)** — Full NFT collection with IPFS metadata, reveal mechanics, enumerable supply
- **Auction Contract** — On-chain English auction with reserve price, anti-snipe, and time extension

#### Step 2: Configure Parameters
Fill in contract parameters via a clean form interface. Fields vary by type:
- ERC-20: Name, Symbol, Total Supply, Decimals, optional features
- ERC-721: Collection Name, Symbol, Max Supply, Mint Price, Base URI, optional features
- Auction: Auction Name, Item Name, Duration, Minimum Bid, Reserve Price

#### Step 3: Review & Generate
- Click **"Generate & Audit Contract"** — the backend compiles Solidity and runs the AI audit in one step
- View the generated Solidity code in the **Monaco Editor** with full syntax highlighting
- Inline linting flags common issues: `tx.origin` usage, `selfdestruct`, floating pragma versions

#### Step 4: Deploy
1. Select target network: **Sepolia** or **BNB Testnet**
2. Connect your MetaMask wallet
3. Click **"Deploy Contract"**
4. MetaMask prompts for transaction approval
5. AutoCon waits for on-chain confirmation
6. Contract is automatically saved to MongoDB
7. Registry is updated instantly

### AI Security Audit
The audit engine (`/audit`) runs every generated contract through a **Gemini-powered analysis pipeline**:

- **Reentrancy vulnerabilities**
- **Integer overflow/underflow checks**
- **Access control weaknesses**
- **Unchecked external calls**
- **Gas optimization opportunities**
- **Business logic issues**

Results are categorized by severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low / ℹ️ Info

### Deployment Registry
A comprehensive table (`/dashboard`) of all contracts deployed through AutoCon, featuring:
- Contract address with explorer link (Etherscan / BscScan)
- Contract type badge (ERC-20 / ERC-721 / Auction)
- Network indicator
- Deployment timestamp
- Verification status
- Quick actions: Copy address, View on explorer, Download ABI

### Analytics Page
Real-time Ethereum network data fetched via `ethers.js`:
- **Live Block Height** — Current mainnet/testnet block number
- **Base Fee** — Current EIP-1559 base fee in Gwei
- **Gas Price History** — Rolling chart of gas fee trends
- **Recent Block Feed** — Latest block timestamps and sizes
- **Contract Events** — Live event log for user-deployed contracts

---

## Supported Networks

| Network | Chain ID | Currency | Explorer | Faucet |
|---|---|---|---|---|
| **Sepolia** | 11155111 | ETH | [sepolia.etherscan.io](https://sepolia.etherscan.io) | [sepoliafaucet.com](https://sepoliafaucet.com) |
| **BNB Testnet** | 97 | tBNB | [testnet.bscscan.com](https://testnet.bscscan.com) | [testnet.bnbchain.org/faucet-smart](https://testnet.bnbchain.org/faucet-smart) |

> **Getting test tokens:** For Sepolia, visit [sepoliafaucet.com](https://sepoliafaucet.com) with your wallet address. For BNB Testnet, use the official BNB faucet — no social login required.

---

## Smart Contract Templates

AutoCon generates and deploys three battle-tested contract archetypes:

### ERC-20 Token
Based on OpenZeppelin's ERC-20 standard with optional extensions:
- `ERC20Mintable` — Owner can mint new tokens
- `ERC20Burnable` — Token holders can burn their tokens
- `ERC20Pausable` — Emergency pause mechanism
- `ERC20Capped` — Maximum supply enforcement
- Anti-whale mechanism — Maximum transaction/wallet limits
- Tax/fee mechanism — Configurable transfer tax

### NFT Collection (ERC-721)
Based on OpenZeppelin's ERC-721 standard with extensions:
- `ERC721Enumerable` — On-chain token enumeration
- `ERC721Burnable` — Token burning support
- Reveal mechanic — Pre-reveal placeholder URI, owner-triggered reveal
- IPFS metadata — Configurable base URI for decentralized metadata
- Mint price — Configurable ETH price per mint

### Auction Contract
A trustless English auction with advanced features:
- Reserve price — Minimum acceptable final bid
- Anti-snipe protection — Automatic time extension on last-minute bids
- Time extension — Configurable extension window
- Permissionless bid withdrawal — Losers can withdraw anytime
- Owner payout — Automatic settlement to auction creator

---

## Security Model

### Authentication
- **No passwords stored** — Authentication is purely cryptographic
- **Nonce-based signing** — Each login uses a fresh random nonce
- **JWT expiry** — Tokens expire and must be renewed
- **No seed phrase access** — MetaMask never exposes private keys to AutoCon

### Smart Contract Generation
- All generated contracts use **OpenZeppelin** audited base contracts
- Every contract is scanned by the **Gemini AI audit engine** before deployment is enabled
- The Monaco editor inline linter flags common anti-patterns at review time

### API Security
- All dashboard API routes require a valid JWT
- MongoDB queries use parameterized inputs (no injection vectors)
- CORS restricted to the frontend origin

---

## FYP Context

**Project Title:** AutoCon — A No-Code Smart Contract Deployment Platform with AI-Powered Security Auditing

**University:** [Your University Name]

**Supervisor:** [Your Supervisor Name]

**Academic Year:** 2025–2026

### Problem Statement
The blockchain ecosystem has a significant adoption barrier: deploying smart contracts requires deep Solidity expertise, security knowledge, and familiarity with developer toolchains. This excludes a large majority of potential users who could benefit from decentralized technology.

### Solution
AutoCon provides a complete end-to-end no-code pipeline — from contract configuration through AI security auditing to on-chain deployment — making smart contract development accessible to non-technical users while maintaining professional-grade security standards.

### Key Technical Contributions
1. **AI-integrated compilation pipeline** — First-pass AI security audit baked directly into the generation workflow
2. **Non-custodial wallet authentication** — Production-safe wallet auth without custody or password risks
3. **Multi-chain deployment abstraction** — Single interface for deploying to multiple EVM networks
4. **Real-time on-chain analytics** — Live blockchain data integrated into the dashboard
5. **Dynamic collapsible dashboard** — CSS-variable-driven responsive layout system

---

## Contributing

This project was built as a Final Year Project. Contributions, suggestions, and bug reports are welcome via GitHub Issues.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for the Web3 ecosystem**

[⬆ Back to top](#autocon--no-code-smart-contract-platform)

</div>
