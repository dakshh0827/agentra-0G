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
- [x] Remove ERC20 approve() flows from AgentDetail.jsx
- [x] Remove ERC20 approve() from DeployStudio.jsx
- [x] Remove ERC20 comms payment from AgentcommsPanel.jsx
- [x] Replace with msg.value native 0G transactions
- [x] Implement USD → Wei conversion via getRequiredWei()
- [x] Add 2% slippage buffer to all tx
- [x] Remove ERC20 ABI and token contract from backend/blockchain/contracts.js
- [x] Remove upvote on-chain tx (new contract has no upvote function)
- [x] Remove AGT token config from backend config
- [x] Upvote is now DB-only (no on-chain tx)

---

### Phase 2: Backend Oracle
- [ ] Fetch 0G/USD price from external source
- [ ] Call `update0GPrice()` on contract
- [ ] Run cron job every 10 min
- [ ] Store price in config/cache for reference

Create: `backend/jobs/oracleJob.js`

---

### Phase 3: 0G Storage Integration
- [ ] Replace IPFS (already using 0G SDK in storageService.js — verify)
- [ ] Encrypt private agent endpoint data
- [ ] Upload to 0G, return rootHash as metadataURI
- [ ] Decrypt endpoint in resolver backend

---

### Phase 4: Escrow Resolver Backend
- [ ] Listen to `TxPending` events from contract
- [ ] For Access tx: ping agent endpoint, call resolveTransaction() or refundTransaction()
- [ ] For Comms tx: execute agent task, call resolveTransaction() or refundTransaction()
- [ ] Handle 24hr timeout fallback

Create: `backend/jobs/resolverJob.js`

---

### Phase 5: Frontend UI Update
- [ ] Remove "lifetime" toggle (new contract uses SubPeriod: Monthly/Yearly)
- [ ] Show escrow pending status after purchase
- [ ] Show TxPending → TxResolved flow in UI
- [ ] Update pricing display to show USD equivalent + 0G amount

---

## 📂 Files Modified

### Smart Contract
- `contracts/Agentra.sol` ✅ (FINAL)

### Frontend (Phase 1 ✅)
- `frontend/src/pages/AgentDetail.jsx` — DbPurchasePanel, BlockchainPurchasePanel, UpvoteButton migrated
- `frontend/src/components/ui/AgentcommsPanel.jsx` — handleCall migrated to initiateAgentComms
- `frontend/src/pages/DeployStudio.jsx` — deployAgent migrated to native 0G value tx

### Backend (Phase 1 ✅)
- `backend/blockchain/contracts.js` — ERC20 removed, native value tx
- `backend/config/config.js` — token config removed
- `backend/controllers/agentController.js` — upvote DB-only, remove ERC20 upvote cost

### Backend (Phase 2 — TODO)
- `backend/jobs/oracleJob.js` — NEW FILE

### Backend (Phase 4 — TODO)
- `backend/jobs/resolverJob.js` — NEW FILE

---

## ⚠️ Known Issues
- Price volatility → 2% buffer added ✅
- Oracle failure → breaks payments (Phase 2 mitigates)
- Resolver downtime → claimTimeoutRefund() user fallback exists in contract ✅
- Upvote no longer on-chain — leaderboard score for upvotes still works via DB count

---

## 🔜 Next Step

**Execute Phase 2: Backend Oracle Job**

Create `backend/jobs/oracleJob.js`:
- Fetch current 0G token price in USD from CoinGecko or similar API
- Call `update0GPrice(newPriceUSD)` on Agentra contract (requires ORACLE_ROLE)
- Schedule as cron job every 10 minutes
- Add to `backend/index.js` startup

Also update `backend/config/config.js` to add oracle config (API URL, cron schedule).