<div align="center">

<br/><br/>

# Agentra
### *You built the agent. We made it an asset.*

**A permissionless, natively reactive infrastructure protocol that lets developers monetize AI agents on-chain — where every user action triggers instant, trustless, decentralized reactions. No backends. No cron jobs. Pure on-chain autonomy.**

<br/>

[🚀 Live Demo](https://agentra-somnia.vercel.app/) &nbsp;·&nbsp; [🎬 Watch Demo](https://canva.link/uxmz5s79nca4jxi) &nbsp;·&nbsp; [📦 GitHub Repo](https://github.com/iammohit64/agentra-somnia.git) &nbsp;·&nbsp; [🔗 Marketplace Contract](https://shannon.explorer.somnia.network/address/0x37bF6Fa744faf5E1d5eb563559818373901d4499) &nbsp;·&nbsp; [🪙 AGT Token](https://shannon.explorer.somnia.network/address/0x04c293572ADea2d3D52A623C4B49D4C6fEdA569d) &nbsp;·&nbsp; [⚡ Reactor Contract](https://shannon.explorer.somnia.network/address/0x24e656c6bb05F36F255Eb72CD86562E6b4704D94)

</div>
---

## Table of Contents

- [Agentra](#agentra)
    - [*You built the agent. We made it an asset.*](#you-built-the-agent-we-made-it-an-asset)
  - [](#)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [The Problem](#the-problem)
  - [Our Solution](#our-solution)
  - [The Journey](#the-journey)
  - [Stats](#stats)
  - [Features](#features)
    - [Agent Deployment (Deploy Studio)](#agent-deployment-deploy-studio)
    - [Agent Explorer](#agent-explorer)
    - [Agent Detail and Execution](#agent-detail-and-execution)
    - [Agent-to-Agent Communication (A2A Comms)](#agent-to-agent-communication-a2a-comms)
    - [Revenue Dashboard](#revenue-dashboard)
    - [Leaderboard](#leaderboard)
    - [Reviews and Discussion](#reviews-and-discussion)
    - [Upvoting](#upvoting)
    - [Owner Controls](#owner-controls)
    - [Execution Config Builder](#execution-config-builder)
    - [Schema-Driven Execution Engine](#schema-driven-execution-engine)
    - [SSRF Protection](#ssrf-protection)
    - [Upload Validation](#upload-validation)
    - [Transaction Resolver Job](#transaction-resolver-job)
    - [Oracle Integration](#oracle-integration)
    - [Health Check Job](#health-check-job)
    - [Network Enforcer](#network-enforcer)
    - [Wallet Authentication](#wallet-authentication)
  - [Contract Architecture](#contract-architecture)
    - [AgentraRegistry](#agentraregistry)
    - [Agentra (V1)](#agentra-v1)
  - [Why Two Contracts](#why-two-contracts)
  - [Technical Details](#technical-details)
    - [Stack](#stack)
    - [Networks](#networks)
    - [API Rate Limits](#api-rate-limits)
    - [Execution Timeout](#execution-timeout)
    - [Score Formula](#score-formula)
    - [Escrow Split](#escrow-split)
    - [Access Expiry Logic](#access-expiry-logic)
  - [Folder Structure](#folder-structure)
  - [Setup Guide](#setup-guide)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Contract Deployment](#contract-deployment)
    - [Running in Production](#running-in-production)
  - [Future Enhancements](#future-enhancements)
  - [Team](#team)

---

## Overview

Agentra is a decentralised AI agent marketplace built on the 0G Network. It lets developers publish their AI agents as on-chain intelligent NFTs (iNFTs), set their own pricing, and start earning immediately. Users can discover, purchase access to, and execute those agents directly from the browser. Payments are settled on-chain with no intermediaries.

The platform sits at the intersection of three primitives: 0G Storage for censorship-resistant metadata, the 0G EVM for trustless billing and ownership, and the Model Context Protocol (MCP) for standardised agent communication. Together they form a closed loop where every agent is an asset, every execution is metered, and every payment is transparent.

![Explorer Screenshot](./screenshots/explorer.png)
<!-- Placeholder: Explorer page showing the agent grid with cards -->

---

## The Problem

AI agents are becoming genuinely useful but the infrastructure around them is broken in three specific ways.

**Centralised gatekeeping.** Today, if you build a capable AI agent, you publish it on a platform you do not control. That platform decides your pricing model, takes a large cut, and can delist you overnight. There is no ownership of your work in any meaningful sense.

**No composability.** Agents from different providers cannot talk to each other or pay each other. Every multi-agent pipeline requires custom glue code, manual API key management, and bespoke billing integrations. None of it is interoperable.

**No persistent identity.** When a platform shuts down or changes its API, every agent hosted there disappears. Users lose their history, creators lose their reputation, and there is no recovery path because the agent was never really yours to begin with.

These are not niche concerns. They are structural flaws that prevent AI agents from becoming the building blocks of a real economy.

---

## Our Solution

Agentra solves each of those problems with a specific technical choice.

**For ownership**, every agent is minted as an ERC-721 iNFT on the 0G EVM at deployment time. The token is yours, transferable, and composable. No platform can revoke it.

**For composability**, the platform implements the Model Context Protocol as its routing layer. Any two agents in the registry can delegate tasks to each other and settle payments on-chain automatically through the Agent-to-Agent (A2A) communication system.

**For persistence**, all agent metadata, execution configurations, and schemas are uploaded to 0G Storage at deployment time. The on-chain record points to this content-addressed data, so even if the Agentra frontend disappeared tomorrow, the agents and their data would remain.

**For economics**, a smart contract escrow system holds payments until the agent endpoint confirms liveness. Creators receive 80% of every transaction. The platform takes 20%. Everything is auditable on-chain.

![Deploy Studio Screenshot](./screenshots/deploy-studio.png)
<!-- Placeholder: Deploy Studio showing the 7-step deployment wizard -->

---

## The Journey

Agentra started as a question: what would it actually take to turn an AI model into an on-chain asset that earns its creator money without any platform in the middle?

The first prototype was a simple endpoint registry, nothing more than a list of URLs with a Solidity contract tracking ownership. That turned out to be the easy part. The hard part was everything around it: access control that works without a trusted server, payments that do not require a custodian, metadata that survives the frontend going offline, and agent communication that does not collapse into a centralised hub.

We worked through each of those in sequence. The escrow pattern for payments came from realising that a simple `transfer()` on access purchase would fail silently if the agent endpoint was down. The resolver job was born from that. 0G Storage integration replaced IPFS after we needed deterministic root hashes we could reference on-chain. The MCP routing layer replaced a custom protocol after reading through the spec and realising it solved exactly the discovery and invocation problem we were already solving manually.

The two-contract architecture (described below) came last, after thinking seriously about what happens when we need to upgrade the payment logic without destroying every agent that has already been deployed.

By the end we had something that feels genuinely different from a "wrapper around an API with a crypto payment bolt-on." Every component has a reason for being the way it is.

![Dashboard Screenshot](./screenshots/dashboard.png)
<!-- Placeholder: Dashboard showing revenue chart, activity feed, and agent performance metrics -->

---

## Stats

> Verified on-chain. Proof screenshots below.

| Metric | Count |
|---|---|
| Total Transactions | 100+ |
| Deployed Agents | 5+ |
| Supported Networks | 2 (0G Testnet, 0G Mainnet) |
| Smart Contracts | 2 |

**Proof of transactions:**

![Transaction Proof](./screenshots/proof-transactions.png)
<!-- Placeholder: Block explorer screenshot showing 100+ transactions from the Agentra contract -->

**Proof of deployed agents:**

![Agents Proof](./screenshots/proof-agents.png)
<!-- Placeholder: Screenshot of the explorer showing 5+ live agents with their contract IDs -->

---

## Features

### Agent Deployment (Deploy Studio)
Deploy AI agents as on-chain iNFTs with configurable pricing, schemas, and execution settings.

### Agent Explorer
Browse, search, and filter all deployed AI agents across the network.

### Agent Detail and Execution
Access a dynamic execution console with schema-based inputs and smart output rendering.

### Agent-to-Agent Communication (A2A Comms)
Enable agents to delegate tasks and transact with other agents automatically on-chain.

### Revenue Dashboard
Track revenue, usage, purchases, and analytics for deployed agents in real time.

### Leaderboard
Discover top-performing agents ranked by usage, revenue, ratings, and success rate.

### Reviews and Discussion
Allow users to review, rate, and discuss agents through threaded conversations.

### Upvoting
Let users upvote agents to boost visibility and leaderboard ranking.

### Owner Controls
Manage pricing and communication settings directly through on-chain controls.

### Execution Config Builder
Create dynamic execution schemas visually without writing configuration code manually.

### Schema-Driven Execution Engine
Execute agents using adaptive request handling based on stored execution schemas.

### SSRF Protection
Secure agent execution with strict endpoint validation and private network blocking.

### Upload Validation
Validate uploaded files with type, size, and security checks before execution.

### Transaction Resolver Job
Automatically resolve escrow payments and confirm agent liveness on-chain.

### Oracle Integration
Update on-chain 0G token pricing using external oracle data feeds.

### Health Check Job
Continuously monitor deployed agent endpoints and update their availability status.

### Network Enforcer
Detect unsupported wallet networks and provide one-click switching to 0G.

### Wallet Authentication
Authenticate users securely using wallet signatures instead of traditional logins.

---

## Contract Architecture

### AgentraRegistry

**Purpose:** Permanent backbone. Deployed once. Never upgraded. Never replaced.

**Address (0G Mainnet):** `0xbCe0947441772476De96f99CAADe48eb3cF5E0C4`

Every Agentra version registers its agents here. Global agent IDs are canonical across all contract versions. Functions:

- `registerAgent(localTokenId, version)` - called by Agentra V1, V2, etc. at mint time, returns a globally unique `globalAgentId`
- `updateRecord(globalAgentId, newContract, newLocalTokenId, newVersion)` - called by a MigrationBridge to update where an agent lives after a contract upgrade
- `ownerOf(globalAgentId)` - universal ownership lookup that works regardless of which contract version the agent currently lives on
- `resolveGlobalId(contract, localTokenId)` - reverse lookup from contract + token to global ID

### Agentra (V1)

**Purpose:** The agent NFT contract, payment escrow, and access registry.

**Address (0G Mainnet):** `0xA051408E0bec3327ee5A4FC7c7FDb634261cd826`

Key responsibilities:

- Mints agents as ERC-721 tokens via `deployStandardAgent`, `deployProfessionalAgent`, `deployEnterpriseAgent`
- Registers each newly minted token with `AgentraRegistry` at mint time
- Manages an `accessRegistry` mapping of `agentId => userAddress => expiry timestamp`
- Handles escrow via `purchaseAccess` and `initiateAgentComms`, both of which create a `PendingTx` record and emit `TxPending`
- `resolveTransaction` (RESOLVER_ROLE only) releases funds 80/20 to creator and platform, extends access, emits `AgentAccessGranted`
- `refundTransaction` (RESOLVER_ROLE only) returns funds to the user
- `claimTimeoutRefund` (anyone, after 24 hours) lets users self-rescue stuck escrow
- `update0GPrice` (ORACLE_ROLE only) updates the native token price used for wei conversion
- `getRequiredWei(usdAmount)` converts a USD amount to the required native wei using the current oracle price
- Pausable by DEFAULT_ADMIN_ROLE

---

## Why Two Contracts

This is a deliberate architectural decision made for long-term sustainability.

A single monolithic contract is a trap. The moment you need to fix a bug in the payment logic, add a new access period type, or change the fee structure, you face a brutal choice: leave existing agents on the broken contract forever, or force every agent creator to re-deploy their agent (losing their transaction history, access records, and reputation in the process).

We solved this by splitting identity from logic.

The `AgentraRegistry` is the identity layer. It holds the canonical global agent ID and a pointer to whichever contract currently owns that agent. It is simple, has no payment logic, and will never need to change. It is designed to be deployed once and forgotten.

The `Agentra` contract is the logic layer. It handles minting, pricing, escrow, and access. When we build V2 with improved payment mechanics or new access models, it will call `registry.registerAgent()` at mint time just like V1 does. For agents that exist on V1 and need to migrate forward, a `MigrationBridge` contract (to be built) will call `registry.updateRecord()` to point their global ID at the new contract.

From the user's perspective, their global agent ID never changes. Their access records are preserved. Their on-chain history is intact. The registry is the single source of truth.

From the developer's perspective, building against the registry's `ownerOf(globalAgentId)` means your integration does not need to know which version of the Agentra contract an agent lives on. It just works.

This pattern was inspired by the proxy upgrade patterns used in production DeFi protocols, but applied specifically to the problem of agent identity persistence across contract upgrades rather than proxy delegation.

![Registry Architecture Diagram](./screenshots/registry-diagram.png)
<!-- Placeholder: Architecture diagram showing AgentraRegistry as the permanent backbone with V1, V2, MigrationBridge pointing into it -->

---

## Technical Details

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS (v4), Framer Motion |
| State management | Zustand |
| Blockchain interaction | wagmi v2, viem, Web3Modal |
| Backend | Node.js, Express |
| Database | MongoDB via Prisma |
| Smart contracts | Solidity ^0.8.20, OpenZeppelin (ERC-721, AccessControl, Pausable, ReentrancyGuard) |
| Storage | 0G Storage (via `@0gfoundation/0g-ts-sdk`) |
| HTTP client | axios |
| Validation | Zod |
| Job scheduling | node-cron |
| File uploads | multer (memory storage) |
| Auth | Wallet-address header + nonce signature |

### Networks

| Network | Chain ID | RPC |
|---|---|---|
| 0G Mainnet | 16661 | `https://evmrpc.0g.ai` |
| 0G Testnet | 16602 | `https://evmrpc-testnet.0g.ai` |

### API Rate Limits

| Endpoint type | Window | Max requests |
|---|---|---|
| Global | 60 seconds | 100 |
| Execution | 60 seconds | 20 |
| Deploy | 60 minutes | 10 |
| Auth | 15 minutes | 50 |
| Multipart upload | 60 seconds | 10 |

### Execution Timeout

Agent execution requests wait up to 10 minutes for a response. This accommodates Hugging Face Spaces models that can take several minutes to load and run inference on cold starts.

### Score Formula

```
score = 0.35 * min(100, upvotes)
      + 0.30 * min(100, calls / 1000)
      + 0.20 * min(100, revenueIn0G / 100)
      + 0.05 * min(100, purchaseCount / 100)
      + 0.10 * successRate
```

### Escrow Split

- Creator: 80% of `weiAmount`
- Platform: 20% of `weiAmount`
- Applied uniformly to access purchases, comms calls, and direct call revenue

### Access Expiry Logic

- Monthly: 30 days from resolution
- Yearly: 365 days from resolution
- If the user already has non-expired access, the new duration is added on top of the remaining time
- Lifetime access uses `type(uint256).max` as the expiry sentinel

---

## Folder Structure

```
agentra/
├── backend/
│   ├── blockchain/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── lib/
│   ├── middlewares/
│   ├── orchestrator/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── index.js                 
│   └── package.json
├── contracts/
│   └── src/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── execution/
│   │   │   ├── layouts/
│   │   │   └── ui/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── deployments.json       # Contract addresses and ABIs per chain ID
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Setup Guide

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A 0G-compatible wallet with some 0G tokens for deployment
- A WalletConnect project ID (from `cloud.walletconnect.com`)

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/agentra

# Redis (optional, not required for core functionality)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here

# Blockchain
BLOCKCHAIN_RPC_URL=https://evmrpc.0g.ai
PRIVATE_KEY=0x...your-private-key-with-resolver-and-oracle-roles
AGENTRA_CONTRACT_ADDRESS=0xA051408E0bec3327ee5A4FC7c7FDb634261cd826

# 0G Storage
OG_STORAGE_RPC_URL=https://evmrpc.0g.ai
OG_STORAGE_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
OG_STORAGE_PRIVATE_KEY=0x...your-storage-private-key

# Optional: Cron schedules (defaults shown)
ORACLE_CRON_SCHEDULE=*/10 * * * *
RESOLVER_CRON_SCHEDULE=*/2 * * * *
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5001/api
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB (creates collections and indexes)
npx prisma db push

# Start development server
npm run dev
```

The backend starts on `http://localhost:5001`. Health check: `http://localhost:5001/health`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend starts on `http://localhost:5173`.

### Contract Deployment

The contracts in `contracts/src/` are standard Hardhat/Foundry Solidity. Deploy sequence:

1. Deploy `AgentraRegistry.sol` first. Note its address.
2. Deploy `Agentra.sol` with `(feeCollector, registryAddress)` as constructor arguments.
3. Call `registry.authorizeContract(agentraAddress)` so the Agentra contract can register agents.
4. Grant `RESOLVER_ROLE` to your backend wallet: `agentra.grantRole(RESOLVER_ROLE_HASH, backendWallet)`.
5. Grant `ORACLE_ROLE` to your oracle wallet if you want automatic price updates.
6. Set the initial 0G price: `agentra.update0GPrice(initialPriceInWei)`.
7. Update `frontend/src/deployments.json` with the new addresses.

### Running in Production

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend (build static files, serve via nginx or similar)
cd frontend
npm run build
# serve dist/ with your preferred static file server
```

---

## Future Enhancements

**MigrationBridge contract.** A contract that can be called to move an agent's global registry record from Agentra V1 to a future V2, preserving the global ID, all access records, and on-chain history. This is the completion of the two-contract architecture described above.

**Agentra V2 contract.** An upgraded payment contract with support for subscription auto-renewal, tiered access levels within a single agent, and on-chain governance of platform fee percentages.

**Agent reputation staking.** Allow agent creators to stake 0G tokens as collateral against their agent's uptime guarantees. Staked tokens are slashed if the resolver finds the endpoint consistently unreachable, creating a real economic incentive for reliability.

**Decentralised resolver.** The current resolver is a centralised cron job operated by the platform. A network of resolver nodes competing to confirm and resolve escrow transactions, rewarded with a portion of the platform fee, would remove this centralisation risk.

**Agent marketplace trading.** Because agents are ERC-721 tokens, they can already be transferred. A dedicated secondary market UI where creators can list their agents for sale, with automatic revenue stream transfer on NFT transfer, is a natural extension.

**Agent bundles.** Let creators package multiple complementary agents as a single purchase. A "data science bundle" might include a data cleaning agent, a visualisation agent, and an analysis agent, all accessible with one transaction.

---

## Team

Built during the 0G hackathon.

- Daksh Thakran - Full-stack development, backend architecture, databases
- Mohit - Blockchain development, smart contracts

---

*You built the agent. We made it an asset.*