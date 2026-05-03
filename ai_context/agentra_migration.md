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

### Phase 2: Backend Oracle ✅ COMPLETE
- [x] Fetch 0G/USD price from CoinGecko API
- [x] Call `update0GPrice()` on contract (requires ORACLE_ROLE)
- [x] Run cron job every 10 min
- [x] Store price in config cache for reference
- [x] Graceful fallback to last known price if API fails
- [x] Added to `backend/index.js` startup

Created: `backend/jobs/oracleJob.js`

---

### Phase 3: 0G Storage Integration ✅ COMPLETE (already verified)
- [x] storageService.js already uses 0G SDK
- [x] Uploads metadata, returns rootHash as metadataURI
- [x] Dev fallback when credentials not configured
- Skipped re-implementation — verified working

---

### Phase 4: Escrow Resolver Backend ✅ COMPLETE
- [x] Poll `pendingTransactions` mapping via `txCounter` loop
- [x] Real-time `TxPending` event listener (complements polling)
- [x] For `TxType.Access` transactions:
  - Ping agent endpoint health check
  - If alive → `resolveTransaction(txId)` → grant AgentAccess in DB → update tx status 'confirmed'
  - If dead → `refundTransaction(txId)` → revoke pre-granted access → update tx status 'failed'
- [x] For `TxType.Comms` transactions:
  - Check DB for matching AgentCommsMessage with status='success'
  - If found → `resolveTransaction(txId)` → update tx status 'confirmed'
  - If not found → `refundTransaction(txId)` → update tx status 'failed'
- [x] 80/20 split calculated and stored in DB on resolve
- [x] Stale transaction monitor (warns at 20h, before 24h on-chain timeout)
- [x] Added RESOLVER_ROLE ABI entries to contracts.js
- [x] Added `resolveTransaction()`, `refundTransaction()`, `getPendingTransaction()`, `getTxCounter()` to ContractManager
- [x] Added to `backend/index.js` startup
- [x] Added `resolver.cronSchedule` to config.js

Created: `backend/jobs/resolverJob.js`

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
- `backend/blockchain/contracts.js` — ERC20 removed, native value tx; added update0GPrice() and getCurrent0GPrice()
- `backend/config/config.js` — token config removed; oracle config added
- `backend/controllers/agentController.js` — upvote DB-only, remove ERC20 upvote cost

### Backend (Phase 2 ✅)
- `backend/jobs/oracleJob.js` — NEW FILE: CoinGecko fetch + on-chain price update cron
- `backend/config/config.js` — oracle section added
- `backend/blockchain/contracts.js` — update0GPrice ABI + method added
- `backend/index.js` — startOracleJob() called on startup

### Backend (Phase 4 ✅)
- `backend/jobs/resolverJob.js` — NEW FILE: TxPending event listener + polling resolver
- `backend/blockchain/contracts.js` — resolveTransaction, refundTransaction, pendingTransactions, txCounter ABI + methods added
- `backend/config/config.js` — resolver.cronSchedule added
- `backend/index.js` — startResolverJob() called on startup

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

## 🔜 Next Step

**Execute Phase 5: Frontend UI Update**

Update frontend to reflect new escrow contract flows:

1. `frontend/src/pages/AgentDetail.jsx`:
   - Remove any "lifetime" toggle/option — new contract only supports `SubPeriod.Monthly` (0) and `SubPeriod.Yearly` (1)
   - Show escrow pending badge after purchase (tx submitted but resolver not yet confirmed)
   - Poll `/agents/:agentId/access` every 5s while status is 'pending' to detect resolver confirmation

2. `frontend/src/components/ui/AgentcommsPanel.jsx`:
   - Show pending state after `initiateAgentComms` tx is submitted
   - Display TxPending → TxResolved status in message history

3. Pricing display:
   - Show USD equivalent alongside 0G amount (use oracle price from backend)
   - Replace "AGT" labels with "0G" to match native token

4. Add new endpoint to backend: `GET /api/transactions/pending` — lists user's pending escrow txs with timestamps so frontend can show "claimTimeoutRefund available in X hours"