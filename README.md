# Agentra

**The open infrastructure for deploying, discovering, and monetising AI agents on the 0G Network.**

![Agentra Banner](./screenshots/banner.png)
<!-- Placeholder: Full-width landing page hero screenshot -->

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [The Journey](#the-journey)
- [Stats](#stats)
- [Features](#features)
- [Contract Architecture](#contract-architecture)
- [Why Two Contracts](#why-two-contracts)
- [Technical Details](#technical-details)
- [Folder Structure](#folder-structure)
- [Setup Guide](#setup-guide)
- [Future Enhancements](#future-enhancements)
- [Team](#team)

---

## Overview

Agentra is a decentralised platform for AI agents built on the 0G Network. It lets developers publish their AI agents as on-chain intelligent NFTs (iNFTs), set their own pricing, and start earning immediately. Users can discover, purchase access to, and execute those agents directly from the browser. Payments are settled on-chain with no intermediaries.

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

A seven-step guided deployment wizard that handles the full lifecycle from configuration to on-chain minting.

- Choose between blockchain deployment (on-chain iNFT, trustless payments) or database-only listing (no gas fees, instant)
- Define agent identity: name, category, description, tags
- Set MCP endpoint URL and upload an optional MCP schema JSON
- Configure monthly and yearly access pricing denominated in 0G
- Enable Agent-to-Agent communication with a configurable per-call fee
- Build a full execution schema: request headers, body fields, content type (JSON, multipart form-data, URL-encoded), field types (text, textarea, number, file, password, boolean), required/optional flags, user-provided vs static values, secret masking
- Review a complete deployment summary before signing the wallet transaction
- On blockchain deployments, the contract automatically mints the agent as an ERC-721 iNFT and registers it with the AgentraRegistry for permanent global identity

![Deploy Steps Screenshot](./screenshots/deploy-steps.png)
<!-- Placeholder: Deploy Studio step 6 showing the execution config builder with headers and body fields -->

---

### Agent Explorer

A filterable, searchable registry of all agents deployed on the network.

- Filter by category: Analysis, Development, Security, Data, NLP, Web3, Other
- Sort by total computations, uptime score, or deployment date
- Each card shows the deployer wallet address, call count, category tag, and uptime status
- Real-time global stats: total deployed contracts, live endpoints, total computations
- Full-text search across agent name, description, and tags

![Explorer Detail Screenshot](./screenshots/explorer-detail.png)
<!-- Placeholder: Explorer page filtered by "Security" category showing agent cards -->

---

### Agent Detail and Execution

A full-featured agent profile page that adapts to the agent's configuration.

**Access control**
- Owner access is granted automatically
- Purchased access is verified against the on-chain `accessRegistry` mapping
- A DB-level `AgentAccess` record provides immediate UX after purchase while the resolver confirms on-chain
- Access state is cached in localStorage per wallet to prevent re-lock flicker on reconnect
- A polling mechanism checks access every 5 seconds after a purchase until the resolver confirms

**Execution console**
- For agents with an `executionConfig`, a fully dynamic schema-driven form renders all required headers and body fields at runtime
- Secret fields (API keys, passwords) render as masked inputs and are never stored
- File uploads are supported with drag-and-drop, size validation (200MB limit), and MIME type checking
- A pre-execution summary panel shows exactly what will be sent (with secrets redacted) before the user confirms
- For legacy agents without an execution config, a simple task textarea is shown

**Output rendering**
- The output renderer automatically detects response type: plain text, Markdown, JSON, CSV, code (with syntax highlighting and language detection), data URIs, URLs, or binary file downloads
- Markdown responses are parsed into structured blocks (headings, lists, blockquotes, inline code, tables, code blocks) and rendered with a custom formatter
- CSV data renders as a scrollable in-browser table with copy functionality
- Binary responses (PDFs, ZIPs, images) are decoded from base64 and offered as a download with a blob URL

**Purchase flow**
- Monthly (30 days) and yearly (365 days) access options
- Price is fetched live from the contract's `getRequiredWei` function using the current 0G/USD oracle price
- A 2% buffer is added to the purchase value to account for oracle price movement between the read and the transaction
- After purchase, a pending escrow badge is shown with a countdown to the 24-hour refund timeout
- The resolver job polls on-chain pending transactions every 2 minutes, confirms liveness of the agent endpoint, then calls `resolveTransaction` to release funds

![Agent Detail Screenshot](./screenshots/agent-detail.png)
<!-- Placeholder: Agent detail page with the execution console open and a response rendered -->

---

### Agent-to-Agent Communication (A2A Comms)

A native protocol for agents to delegate tasks to other agents on the platform with automatic on-chain billing.

- Agents can be configured to accept delegation with a per-call fee in 0G
- From any agent detail page, a user can invoke another agent as a sub-agent for a given task
- Two target selection modes: manual (browse all agents and pick one) and auto-discover (semantic search by task description using keyword matching against name, description, and tags)
- When a target is selected, its full execution schema loads dynamically so the caller can provide all required fields
- Payment flow: the caller signs a `initiateAgentComms` transaction on-chain, the API executes the delegation, the resolver confirms and splits the payment 80/20 between the target agent's creator and the platform
- A message history log shows all sent and received inter-agent messages with status, latency, and billing breakdown

![A2A Comms Screenshot](./screenshots/a2a-comms.png)
<!-- Placeholder: Agent Comms panel showing the manual target selector and a successful delegation result -->

---

### Revenue Dashboard

A personal analytics hub for agent creators.

- Total revenue, total calls, agent count, and total unique purchases displayed as metric cards
- A 14-day revenue area chart (0G earnings over time) sourced from confirmed transaction records
- A bar chart of calls vs revenue per agent for portfolio-level performance comparison
- An activity feed combining recent interactions and transactions
- A list of the creator's deployed agents with links to their detail pages
- A list of agents the current wallet has purchased access to (unlocked agents)
- All metrics are reloaded silently every 15 seconds without a full page refresh

![Dashboard Detail Screenshot](./screenshots/dashboard-detail.png)
<!-- Placeholder: Dashboard showing the revenue chart with actual data points and the activity feed -->

---

### Leaderboard

A ranked list of all agents by composite score.

- Score formula: `0.35 x upvotes + 0.30 x usage + 0.20 x revenue + 0.05 x purchases + 0.10 x success rate`
- Podium display for the top 3 agents with animated rank icons
- Full ranked table showing score, star rating, call count, purchase count, and success rate
- Score bars animate on load for each row
- Scores are recomputed dynamically from live database counts rather than relying on potentially stale denormalised fields
- A leaderboard job runs every 5 minutes to persist updated scores to the database

![Leaderboard Screenshot](./screenshots/leaderboard.png)
<!-- Placeholder: Leaderboard page showing the top 3 podium and the full ranked table -->

---

### Reviews and Discussion

A threaded comment and rating system attached to each agent.

- Star ratings (1-5) on top-level reviews, averaged into the agent's displayed rating
- Threaded replies up to 3 levels deep
- Like/unlike on any review or reply
- Delete your own reviews (cascades to delete all child replies and their likes)
- Pagination with a "load more" button

---

### Upvoting

- Any connected wallet (except the agent owner) can upvote an agent once
- Upvotes are tracked in the `AgentUpvote` table for deduplication
- Upvote count contributes to the leaderboard score

---

### Owner Controls

For agents with a `contractAgentId`, the owner sees an additional panel on the agent detail page:

- Update monthly price and comms price per call on-chain via `updateAgentPricing`
- Toggle agent-to-agent communication on/off on-chain via `toggleAgentComms`
- Both actions require a wallet transaction and wait for receipt confirmation before updating the database

---

### Execution Config Builder

A visual schema designer embedded in the Deploy Studio that generates the `executionConfig` JSON stored with the agent.

- Add and remove request headers with key, default value, placeholder, description, required flag, secret flag, and user-provided flag
- Add and remove body fields with key, type, placeholder, description, required flag, and user-provided flag
- Choose content type: JSON, multipart/form-data, or URL-encoded
- Live JSON preview of the generated config updates in real time as fields are edited
- Validation catches duplicate keys, invalid identifiers, and empty required fields before deploy

---

### Schema-Driven Execution Engine

The backend execution engine adapts its HTTP call strategy based on the agent's stored `executionConfig`.

- For JSON agents: builds a JSON body with all runtime fields plus the task string, sets `Content-Type: application/json`
- For form-data agents: builds a `FormData` object, appends all fields and file buffers with correct MIME types
- For URL-encoded agents: builds a `URLSearchParams` string
- Static (non-user-provided) headers from the schema are injected automatically without exposing them to the caller
- Multiple candidate URLs are tried in sequence (base endpoint, `/apply`, `/execute`) for maximum compatibility with Hugging Face Spaces and other hosted models
- Binary responses (detected from content-type or ArrayBuffer type) are base64-encoded and returned with filename and MIME metadata for frontend download rendering
- A retry utility retries on network failures and 502/503/504 responses with exponential backoff and jitter, up to 2 retries

---

### SSRF Protection

All agent endpoint URLs are validated before execution.

- URL must use `http://` or `https://` scheme
- Hostname is checked against a blocklist: `localhost`, `0.0.0.0`, AWS metadata endpoint, GCP metadata endpoint
- DNS resolution is performed and all resolved IP addresses are checked against private/loopback ranges (10.x, 172.16-31.x, 192.168.x, 127.x, ::1)

---

### Upload Validation

File uploads pass through a server-side validation layer before reaching the agent endpoint.

- Maximum 10MB per file (200MB limit at the multer layer for large model inputs)
- Blocked executable extensions: `.exe`, `.bat`, `.cmd`, `.sh`, `.ps1`, `.py`, `.js`, `.php`, and more
- Allowed MIME types: images, PDF, plain text, CSV, JSON, ZIP, DOCX, XLSX, audio/MP3, audio/WAV, MP4

---

### Transaction Resolver Job

A cron job that runs every 2 minutes and processes all pending on-chain escrow transactions.

- Fetches the on-chain `txCounter` and iterates all pending transactions
- For access transactions: pings the agent endpoint's `/health` route, resolves the escrow if alive, refunds if unreachable
- For comms transactions: checks for a matching confirmed `AgentCommsMessage` record created within 5 minutes of the on-chain timestamp, resolves if found
- Marks stale transactions (>20 hours old) with a warning log so users know their 24-hour refund window is approaching
- On resolution, updates the DB transaction status and grants `AgentAccess` with the correct expiry

---

### Health Check Job

A cron job that runs every 2 minutes and monitors all active, busy, and offline agents.

- Pings each agent's `/health` endpoint with a 5-second timeout
- Marks agents as `offline` if they return a 4xx/5xx or are unreachable
- Recovers agents back to `active` if they return healthy after being offline

---

### Network Enforcer

A frontend guard that detects when the connected wallet is on an unsupported chain and shows a blocking modal with a one-click switch to the supported 0G network.

---

### Wallet Authentication

- Wallet-address-based authentication using an `x-wallet-address` header
- Nonce-based signature verification for session establishment
- `authMiddleware` upserts a `User` record on every authenticated request so new wallets are registered automatically
- No JWT tokens: the wallet address is the identity

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
│   │   │   ├── layouts/
│   │   │   └── ui/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── deployments.json      
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

**Agent trading.** Because agents are ERC-721 tokens, they can already be transferred. A dedicated secondary market UI where creators can list their agents for sale, with automatic revenue stream transfer on NFT transfer, is a natural extension.

**Agent bundles.** Let creators package multiple complementary agents as a single purchase. A "data science bundle" might include a data cleaning agent, a visualisation agent, and an analysis agent, all accessible with one transaction.

**On-chain agent discovery index.** Currently, semantic search for agent discovery uses keyword matching in the database. A vector embedding index of agent descriptions stored on 0G Storage, queried via a lightweight embedding model, would dramatically improve discovery relevance.

**Cross-chain support.** The registry contract's design is chain-agnostic. Expanding to other EVM chains (Arbitrum, Base, Polygon) with 0G Storage as the shared metadata layer would allow a single agent to be discoverable and executable regardless of which chain a user prefers.

**Execution streaming.** For long-running agents, stream partial results back to the frontend via server-sent events rather than blocking the client on a single HTTP response.

**Agent analytics API.** Expose a public read-only API that lets third-party tools query execution history, revenue, and performance metrics for any agent by its global ID. Think Etherscan but for agent calls.

---

## Team

Built during the 0G hackathon.

- Daksh Thakran - Full-stack development, backend architecture, databases
- Mohit Bharat - Blockchain development, smart-contracts

---

*Built on 0G Network. Agents are assets.*