<div align="center">

<img src="https://img.shields.io/badge/0%20Gravity-Chain-6C3AFF?style=for-the-badge&logo=ethereum&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenZeppelin-4.x-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white"/>
<img src="https://img.shields.io/badge/Solidity-0.8.x-363636?style=for-the-badge&logo=solidity&logoColor=white"/>
<img src="https://img.shields.io/badge/Foundry-WIP-orange?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Status-Under%20Development-yellow?style=for-the-badge"/>

<br/><br/>

# 🧠 Agentra
### *The Decentralized AI Agent Economy — Currently Under Development*

> ⚠️ **This project is actively under development. Features, contracts, and architecture are subject to change. Not production-ready.**

**A permissionless infrastructure protocol that lets developers monetize AI agents on-chain and gives users a single, trustless gateway to access them.**

<br/>

[📦 GitHub Repo](https://github.com/dakshh0827/agentra-0G)

</div>

---

## The Real Problem Nobody Is Solving

There are thousands of developers right now building genuinely brilliant AI workflows — automating research, coding, customer support, data pipelines — using tools like LangChain, AutoGen, and MCP. They share them on GitHub, maybe tweet about them, and then... nothing. No way to charge for them. No distribution. No trust layer.

Meanwhile, users who want to access these agents are scattered across 10 different SaaS dashboards with 10 different subscriptions, zero guarantees about uptime or quality, and no way to verify if an agent actually does what it claims.

This is a coordination failure. And it's fixable.

The existing "solutions" — OpenAI's GPT Store, Hugging Face Spaces — are walled gardens. The developer doesn't control pricing. The platform takes the lion's share. Users are locked in. There's no transparency on performance, and there's certainly no on-chain accountability.

**Agentra is the open alternative.** Not just a marketplace — an infrastructure layer for the AI agent economy.

---

## What Agentra Actually Is

Think of it like this: Agentra does for AI agents what Uniswap did for token trading — removes the middleman, puts the logic on-chain, and makes the rules transparent and enforced by code, not by a company's terms of service.

**Developers** deploy their agent's metadata, MCP (Model Context Protocol) schema, and pricing to the Agentra smart contract. They set a price in `$AGT` tokens. That's it. The contract handles access control, subscription verification, and payment routing automatically.

**Users** come to one unified dashboard, discover agents ranked by real on-chain upvotes and verified execution metrics, buy access trustlessly through a smart contract interaction, and manage every AI subscription they have from a single Web3 interface.

No credit card forms. No "contact sales." No wondering if the developer will keep the lights on. The contract is the guarantee.

---

## ⚙️ Planned Technical Architecture

### Automated Deployment Pipeline

When contracts are deployed with Foundry, a post-deploy script (`format_deployments.js`) will automatically read the broadcast artifacts and sync the verified contract addresses and compact ABIs directly into the frontend. Zero manual copy-paste. Zero risk of committing a wrong address.

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url <0-gravity-rpc-url> \
  --broadcast --legacy

# Frontend will be automatically synced:
node format_deployments.js <chain-id>
```

---

### The Draft → Active State Machine

This solves a real UX problem: what happens when a user clicks "Deploy Agent," the transaction gets submitted, but they reject MetaMask? Without handling this, you get "ghost agents" — dead entries in the database pointing to contracts that never confirmed.

The backend creates agents in a `Draft` state immediately. They only transition to `Active` when the frontend passes a confirmed `txHash` back to the state machine. If the transaction never confirms, the draft expires cleanly. Users only see real, live agents.

---

### The Network Enforcer

If a user connects a wallet on the wrong chain, the frontend traps the entire UI and forces a network switch before any interaction is allowed. Not a warning. Not a toast notification. A hard gate.

---

### Batch Multicall Dashboard

When a user opens their dashboard to check agent access, we don't make 20 separate RPC calls. We use Wagmi's `useReadContracts` to batch every access verification into a single multicall RPC request — making the dashboard feel instant even as the marketplace scales to hundreds of agents.

---

### On-Chain Upvoting as an Incentive Loop

1 `$AGT` = 1 Upvote. When a user upvotes an agent, the token goes **directly to the agent creator's wallet** — not to a platform pool, not to a DAO treasury. Straight to the developer.

This creates a direct financial incentive for creators to build agents worth upvoting, and a discovery mechanism that's harder to game than star ratings because it costs real money to manipulate.

---

## 🏗️ Smart Contract Architecture

```
contracts/
├── src/
│   ├── AgentToken.sol          # $AGT — ERC20Permit + ERC20Burnable + AccessControl
│   ├── AgentraMarketplace.sol  # Core protocol — SafeERC20, Pausable, AccessControl, onlyReactor
│   └── AgentraReactor.sol      # Somnia Reactive Contract — listens, reacts, executes
├── script/
│   └── Deploy.s.sol            # Foundry deployment script
└── format_deployments.js       # Auto-syncs ABIs + addresses → frontend config
```

### OpenZeppelin Integration

The entire contract architecture is built on composing OpenZeppelin's production-grade primitives:

**`SafeERC20`** — Wraps every token interaction so silent transfer failures never cause a user to lose funds without getting access.

**`AccessControl` over `Ownable`** — Three distinct roles prevent a single compromised key from being catastrophic:
- `DEFAULT_ADMIN_ROLE` — emergency pauses only. Cold storage.
- `FEE_MANAGER_ROLE` — tier pricing and listing fees. Operational.
- `MINTER_ROLE` — scoped to the token contract exclusively.

**`Pausable`** — `deployAgent`, `purchaseAccess`, and `upvote` are all pause-guarded. In an emergency, a single transaction stops all user fund movement protocol-wide.

**`ERC20Permit` + `ERC20Burnable` on `$AGT`** — Permit enables future gasless approval flows. Burnable enables deflationary tokenomics where protocol fees can be burned, linking usage directly to token value.

---

## 🌍 Live Deployments

Deployed on **Galileo testnet** (Chain ID: 16602)

| Contract | Address |
|---|---|
| **AgentToken ($AGT)** | [`0x1e9f2F91E0673E3313C68b49a2262814C7d8921e`](https://chainscan-galileo.0g.ai/address/0x1e9f2f91e0673e3313c68b49a2262814c7d8921e) |
| **Agentra Marketplace** | [`0x1e9f2F91E0673E3313C68b49a2262814C7d8921e`](https://chainscan-galileo.0g.ai/address/0x1e9f2f91e0673e3313c68b49a2262814c7d8921e) |

---

## 💰 Planned Business Model

**Listing Fees** — Developers will pay `$AGT` to list, tiered by plan (Standard / Professional / Enterprise). Filters spam, generates protocol revenue.

**Platform Cut** — 20% of every agent access purchase will route to the `feeCollector` via smart contract. No invoices. No delays. On-chain splits.

**Creator Economy** — 100% of upvote revenue goes directly to the agent creator. High-earning creators market themselves, which markets Agentra. Everyone wins.

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Blockchain** | 0 Gravity Chain (EVM-compatible) |
| **Smart Contracts** | Solidity, Foundry, OpenZeppelin |
| **Frontend** | React, Vite, TailwindCSS, Wagmi v2, Viem, Web3Modal |
| **Backend** | Node.js, Express, Prisma, MongoDB |
| **Deployment** | Foundry scripts + `format_deployments.js` ABI sync |

---

## 🚀 Run It Locally

> ⚠️ Local setup is a work-in-progress. Some steps may be incomplete or change as development progresses.

```bash
# Clone the repo
git clone https://github.com/dakshh0827/agentra-0G.git
cd agentra-0G

# Install frontend dependencies
cd frontend && npm install

# Configure environment
cp .env.example .env
# Add your WalletConnect Project ID and RPC details

# Start the frontend
npm run dev

# In a separate terminal — start the backend
cd ../backend && npm install
npm run dev
```

For smart contract compilation:

```bash
cd contracts
forge build
```

---

## 🔮 Roadmap

This project is under active development. Planned features include:

- [ ] Deploy contracts to 0 Gravity Chain testnet
- [ ] Complete automated deployment pipeline and ABI sync
- [ ] Draft → Active agent state machine
- [ ] Network enforcer and hard chain-gate on frontend
- [ ] Batch multicall dashboard for access verification
- [ ] On-chain upvoting with direct creator payouts
- [ ] Execution verification oracle for real agent performance metrics
- [ ] DAO Governance via token-weighted voting on fee structures
- [ ] Agent composability — agents calling other agents on-chain

---

<div align="center">

**Agentra is a work in progress — building toward infrastructure that makes the next generation of AI agent development economically viable and trustless.**

[📦 GitHub](https://github.com/dakshh0827/agentra-0G)

</div>
