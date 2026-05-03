# Agentra Migration Context (Corrected)

## ✅ Project Overview
Agentra is a decentralized AI agent marketplace where agents are deployed as ERC-721 INFTs. Users pay in native 0G tokens, and all payments are processed through an escrow-based system to ensure reliability and trust.

---

## 🏗 Current Architecture (Before Migration)
- ERC20-based payments (AGT token)
- Direct payments to creators
- IPFS storage
- No escrow / trust layer

---

## 🎯 Target Architecture (ACTUAL IMPLEMENTATION)

### 🔹 Smart Contract (Already Built)
Single contract: `Agentra.sol`

Key features:
- ERC721 INFT agents (tokenId = agentId)
- Native token payments (`msg.value`)
- USD-based pricing with on-chain conversion
- Escrow system using `pendingTransactions`

---

### 🔹 Core Smart Contract Flows

#### 1. Deploy Agent (Mint INFT)
- Function: `deployAgent()` — payable, `msg.value` = listingFee in 0G
- Stores metadata via 0G Storage hash

#### 2. Purchase Access (Escrow Start)
- Function: `purchaseAccess(agentId, SubPeriod)` — payable
- Emits: `TxPending`

#### 3. Agent Comms (Escrow Start)
- Function: `initiateAgentComms(callerAgentId, targetAgentId)` — payable
- Emits: `TxPending`

#### 4. Resolve Transaction (Backend)
- Function: `resolveTransaction(txId)` — onlyRole(RESOLVER_ROLE)
- Splits: 80% creator, 20% platform

#### 5. Refund Transaction
- Function: `refundTransaction(txId)`

#### 6. Timeout Refund (User Safety)
- Function: `claimTimeoutRefund(txId)`

---

### 🔹 Pricing Model
- Prices stored in USD (18 decimals) in contract
- Converted using `getRequiredWei(usdAmount)`
- Frontend fetches `getRequiredWei()` before sending tx
- 2% buffer added for price volatility

---

### 🔹 Critical Mechanism: Auto Refund
- Users send extra (2% buffer)
- Contract refunds excess automatically in `deployAgent`, `purchaseAccess`, `initiateAgentComms`

---

## 🚀 Migration Phases

### Phase 1: Frontend Payment Migration ✅ COMPLETE
### Phase 2: Backend Oracle ✅ COMPLETE
### Phase 3: 0G Storage Integration ✅ COMPLETE
### Phase 4: Escrow Resolver Backend ✅ COMPLETE

### Phase 5: Frontend UI Update ✅ COMPLETE
- [x] Remove "lifetime" toggle — replaced with Monthly (SubPeriod.Monthly=0) and Yearly (SubPeriod.Yearly=1)
- [x] Show escrow pending badge after purchase with timeout countdown
- [x] Poll `/agents/:agentId/access` every 5s while status is 'pending' to detect resolver confirmation
- [x] Show TxPending → TxResolved flow in AgentcommsPanel (pending state + tx hash display)
- [x] Show pending status in message history (yellow 'pending' badge)
- [x] Replace "AGT" labels with "0G" in AgentCard, TopBar, AgentDetail
- [x] Added `GET /api/transactions/pending` backend endpoint
- [x] Added `getPendingTransactions()` to frontend agents API

---

## 📂 Files Modified

### Smart Contract
- `contracts/Agentra.sol` ✅ (FINAL)

### Frontend (Phase 1 ✅)
- `frontend/src/pages/AgentDetail.jsx`
- `frontend/src/components/ui/AgentcommsPanel.jsx`
- `frontend/src/pages/DeployStudio.jsx`

### Backend (Phase 1 ✅)
- `backend/blockchain/contracts.js`
- `backend/config/config.js`
- `backend/controllers/agentController.js`

### Backend (Phase 2 ✅)
- `backend/jobs/oracleJob.js`
- `backend/config/config.js`
- `backend/blockchain/contracts.js`
- `backend/index.js`

### Backend (Phase 4 ✅)
- `backend/jobs/resolverJob.js`
- `backend/blockchain/contracts.js`
- `backend/config/config.js`
- `backend/index.js`

### Frontend (Phase 5 ✅)
- `frontend/src/pages/AgentDetail.jsx` — removed lifetime, added escrow pending badge + 5s access polling
- `frontend/src/components/ui/AgentcommsPanel.jsx` — added pending state after initiateAgentComms, pending status in message history
- `frontend/src/components/ui/AgentCard.jsx` — AGT → 0G label
- `frontend/src/components/layouts/TopBar.jsx` — AGT → 0G label
- `frontend/src/api/agents.js` — added getPendingTransactions()

### Backend (Phase 5 ✅)
- `backend/controllers/transactionController.js` — NEW: getPendingTransactions with timeout calc
- `backend/routes/transactionRoutes.js` — NEW: GET /api/transactions/pending
- `backend/index.js` — added transactionRoutes

---

## ⚠️ Known Issues
- Price volatility → 2% buffer added ✅
- Oracle failure → falls back to last known price, then $1.00 fallback ✅
- Resolver downtime → claimTimeoutRefund() user fallback exists in contract ✅
- Upvote no longer on-chain — leaderboard score for upvotes still works via DB count ✅
- Resolver uses both event listener (real-time) + cron polling (catch missed events) ✅

## 🔧 Environment Variables Needed
- `ORACLE_CRON_SCHEDULE` — default `*/10 * * * *`
- `ORACLE_PRICE_API_URL` — default CoinGecko endpoint
- `RESOLVER_CRON_SCHEDULE` — default `*/2 * * * *`
- `PRIVATE_KEY` must hold ORACLE_ROLE + RESOLVER_ROLE on the contract

---

## ✅ MIGRATION COMPLETE

All 5 phases have been executed:

1. **Phase 1** — Frontend payment migration (ERC20 → native 0G, msg.value flows)
2. **Phase 2** — Backend oracle (CoinGecko price feed → on-chain update0GPrice cron)
3. **Phase 3** — 0G Storage (already working, verified)
4. **Phase 4** — Escrow resolver backend (event listener + cron polling, resolve/refund logic)
5. **Phase 5** — Frontend UI update (SubPeriod Monthly/Yearly, escrow pending badge, 5s access polling, comms pending state, 0G labels, pending transactions endpoint)

### Post-migration checklist:
- [ ] Set `PRIVATE_KEY` env var with ORACLE_ROLE + RESOLVER_ROLE on deployed contract
- [ ] Set `BLOCKCHAIN_RPC_URL` to 0G testnet RPC
- [ ] Set `AGENTRA_CONTRACT_ADDRESS` to deployed Agentra.sol address
- [ ] Update `frontend/src/deployments.json` with new contract ABI + address
- [ ] Verify oracle job updates price on-chain every 10min
- [ ] Verify resolver job processes pending transactions every 2min
- [ ] Test full flow: deploy agent → purchase access → resolver confirms → access granted