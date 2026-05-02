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
- Function: `deployAgent()`
- Stores metadata via 0G Storage hash

#### 2. Purchase Access (Escrow Start)
- Function: `purchaseAccess()`
- Emits: `TxPending`

#### 3. Agent Comms (Escrow Start)
- Function: `initiateAgentComms()`
- Emits: `TxPending`

#### 4. Resolve Transaction (Backend)
- Function: `resolveTransaction()`
- Splits:
  - 80% creator
  - 20% platform

#### 5. Refund Transaction
- Function: `refundTransaction()`

#### 6. Timeout Refund (User Safety)
- Function: `claimTimeoutRefund()`

---

### 🔹 Pricing Model
- Prices stored in USD (18 decimals)
- Converted using:
  - `current0GPriceUSD`
  - `getRequiredWei()`

---

### 🔹 Critical Mechanism: Auto Refund
- Users send extra (2–5% buffer)
- Contract refunds excess automatically

---

## 🚀 Migration Phases (UPDATED)

### Phase 1: Frontend Payment Migration
- [ ] Remove ERC20 logic
- [ ] Add msg.value transactions
- [ ] Implement USD → Wei conversion
- [ ] Add slippage buffer

---

### Phase 2: Backend Oracle
- [ ] Fetch 0G price
- [ ] Call `update0GPrice()`
- [ ] Run cron job (10 min)

---

### Phase 3: 0G Storage Integration
- [ ] Replace IPFS
- [ ] Encrypt private agent data
- [ ] Upload to 0G
- [ ] Return rootHash

---

### Phase 4: Escrow Resolver Backend
- [ ] Listen to `TxPending`
- [ ] Fetch & decrypt agent endpoint
- [ ] Ping agent
- [ ] Call:
  - `resolveTransaction()` OR
  - `refundTransaction()`

---

### Phase 5: Frontend UI Update
- [ ] Replace agentId → tokenId
- [ ] Remove lifetime access
- [ ] Add creator dashboard
- [ ] Show escrow status

---

## 📂 Files Modified

### Smart Contract
- `contracts/Agentra.sol` ✅ (FINAL — no new contract needed)

### Frontend
- `web3/payment.ts`
- `components/AgentPurchase.tsx`
- `components/CreateAgent.tsx`

### Backend
- `backend/oracle.js`
- `backend/resolver.js`
- `backend/storage.js`

---

## ⚠️ Known Issues
- Price volatility → must use buffer
- Oracle failure → breaks payments
- Resolver downtime → requires user refund fallback

---

## 🔜 Next Step

**Execute Phase 1: Frontend Payment Migration**

- Remove all ERC20 usage
- Replace with msg.value
- Add conversion logic using `current0GPriceUSD`
- Add 2% buffer