import { ethers } from 'ethers'
import prisma from '../lib/prisma.js'
import config from '../config/config.js'
import { recordAgentPurchase } from './accessService.js'

// ─────────────────────────────────────────────
// ABIs
// Use the new native-payment Agentra ABI (matches contracts/src/Agentra.sol)
const AGENTRA_ABI = [
  'function deployStandardAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',
  'function deployProfessionalAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',
  'function deployEnterpriseAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',
  'function purchaseAccess(uint256 _agentId,uint8 _period) payable',
  'function initiateAgentComms(uint256 _callerAgentId,uint256 _targetAgentId) payable',
  'function agents(uint256) view returns (uint8 tier,uint256 monthlyPriceUSD,bool commsEnabled,uint256 commsPricePerCallUSD)',
  'function accessRegistry(uint256,address) view returns (uint256)',
  'function getRequiredWei(uint256 _usdAmount) view returns (uint256)',
  'function txCounter() view returns (uint256)',
  'function pendingTransactions(uint256) view returns (uint256 id,address user,uint256 agentId,uint256 weiAmount,uint8 txType,uint8 period,uint8 status,uint256 timestamp)',

  'event AgentDeployed(uint256 indexed agentId,address indexed creator,uint8 tier,uint256 listingFeePaidUSD)',
  'event TxPending(uint256 indexed txId,address indexed user,uint256 indexed agentId,uint8 txType,uint256 weiAmount)',
  'event TxResolved(uint256 indexed txId,address indexed user,uint256 indexed agentId)',
  'event TxRefunded(uint256 indexed txId,address indexed user,uint256 indexed agentId)',
  'event AgentCommsToggled(uint256 indexed agentId,bool enabled)',
  'event AgentCommsPriceUpdated(uint256 indexed agentId,uint256 newPrice)'
]

// ERC20 is no longer used for payments in the new contract (native payments)
// ─────────────────────────────────────────────

class BlockchainService {
  constructor() {
    this.provider = null
    this.wallet = null
    this.agentra = null
    this.token = null
    this._initialized = false
    this._mock = false
  }

  async initialize() {
    if (this._initialized) return

    if (!config.blockchain.rpcUrl) {
      console.warn('[BLOCKCHAIN] Mock mode enabled')
      this._mock = true
      this._initialized = true
      return
    }

    try {
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)

      if (config.blockchain.privateKey) {
        this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider)
      }

      const runner = this.wallet || this.provider

      const { agentra } = config.blockchain.contracts

      this.agentra = new ethers.Contract(agentra, AGENTRA_ABI, runner)

      this._initialized = true
      console.log('[BLOCKCHAIN] ✅ Initialized')
    } catch (err) {
      console.error('[BLOCKCHAIN] ❌ Init failed:', err.message)
      this._mock = true
      this._initialized = true
    }
  }

  // ─────────────────────────────────────────────
  // APPROVAL
  // ─────────────────────────────────────────────

  // No ERC20 approvals are required for the new native-payment contract

  // ─────────────────────────────────────────────
  // DEPLOY AGENT
  // ─────────────────────────────────────────────

  async deployAgent(tier, monthlyPriceWei, metadataURI, commsEnabled = false, commsPricePerCall = 0n) {
    if (this._mock) return { success: true, txHash: `0xmock_${Date.now()}` }

    try {
      // Determine listing fee (USD) from config or caller
      // The caller should supply listing fee via frontend; here we read configured listing fees if present
      const listingFeesUSD = config.token?.listingFeesUSD || { standard: 0, professional: 0, enterprise: 0 }
      const tierIndex = Number(tier)
      const listingFeeUSD = tierIndex === 0 ? BigInt(listingFeesUSD.standard || 0) : tierIndex === 1 ? BigInt(listingFeesUSD.professional || 0) : BigInt(listingFeesUSD.enterprise || 0)

      // Compute required wei via contract helper
      const requiredWei = listingFeeUSD > 0n ? await this.agentra.getRequiredWei(listingFeeUSD) : 0n
      const buffered = requiredWei ? (requiredWei + (requiredWei * 2n) / 100n) : 0n

      // Call the appropriate deploy function based on tier
      let tx
      if (tierIndex === 0) {
        tx = await this.agentra.deployStandardAgent(monthlyPriceWei, metadataURI, commsEnabled, commsPricePerCall, listingFeeUSD, { value: buffered })
      } else if (tierIndex === 1) {
        tx = await this.agentra.deployProfessionalAgent(monthlyPriceWei, metadataURI, commsEnabled, commsPricePerCall, listingFeeUSD, { value: buffered })
      } else {
        tx = await this.agentra.deployEnterpriseAgent(monthlyPriceWei, metadataURI, commsEnabled, commsPricePerCall, listingFeeUSD, { value: buffered })
      }

      const receipt = await tx.wait(1)
      return { success: true, txHash: receipt.transactionHash, blockNumber: receipt.blockNumber }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // ─────────────────────────────────────────────
  // PURCHASE ACCESS
  // ─────────────────────────────────────────────

  async purchaseAccess(agentId, period, monthlyPriceUSD) {
    if (this._mock) return { success: true, txHash: `0xmock_${Date.now()}` }

    try {
      const multiplier = period === 1 ? 12n : 1n
      const totalUSD = BigInt(monthlyPriceUSD) * multiplier

      const requiredWei = totalUSD > 0n ? await this.agentra.getRequiredWei(totalUSD) : 0n
      const buffered = requiredWei ? (requiredWei + (requiredWei * 2n) / 100n) : 0n

      const tx = await this.agentra.purchaseAccess(agentId, period, { value: buffered })
      const receipt = await tx.wait(1)

      return { success: true, txHash: receipt.transactionHash }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // ─────────────────────────────────────────────
  // UPVOTE
  // ─────────────────────────────────────────────

  // Upvotes are handled off-chain in the application DB (no on-chain upvote in new contract)

  // ─────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────

  async getAgent(agentId) {
    if (this._mock) return null

    try {
      const a = await this.agentra.agents(agentId)

      return {
        id: Number(agentId),
        tier: Number(a.tier),
        monthlyPriceUSD: a.monthlyPriceUSD.toString(),
        commsEnabled: Boolean(a.commsEnabled),
        commsPricePerCallUSD: a.commsPricePerCallUSD.toString(),
      }
    } catch {
      return null
    }
  }

  async hasAccess(agentId, user) {
    if (this._mock) return true

    try {
      // accessRegistry returns an expiration timestamp (uint256)
      const exp = await this.agentra.accessRegistry(agentId, user)
      if (!exp) return false
      const expNum = Number(exp)
      if (expNum === Number.MAX_SAFE_INTEGER) return true
      return expNum > Math.floor(Date.now() / 1000)
    } catch {
      return false
    }
  }

  // ─────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────

  startEventListeners() {
    if (this._mock) return

    // Agent deployed: mark draft as active (match by contractAgentId if exists)
    this.agentra.on('AgentDeployed', async (agentId, creator, tier, listingFeePaidUSD, event) => {
      try {
        await prisma.agent.updateMany({
          where: { contractAgentId: Number(agentId) },
          data: { status: 'active' },
        })
      } catch (err) {
        console.error('[EVENT] AgentDeployed error:', err.message)
      }
    })

    // TxPending: create a pending transaction record for escrow
    this.agentra.on('TxPending', async (txId, user, agentId, txType, weiAmount, event) => {
      try {
        const agent = await prisma.agent.findFirst({ where: { contractAgentId: Number(agentId) } })
        await prisma.transaction.upsert({
          where: { txHash: `${event.log.transactionHash}:${txId.toString()}` },
          update: {},
          create: {
            txHash: `${event.log.transactionHash}:${txId.toString()}`,
            type: txType === 0 ? 'purchase_access' : 'agent_to_agent',
            status: 'pending',
            agentId: agent ? agent.agentId : null,
            callerWallet: user,
            ownerWallet: agent ? agent.ownerWallet : null,
            totalAmount: weiAmount.toString(),
          },
        })
      } catch (err) {
        console.error('[EVENT] TxPending error:', err.message)
      }
    })

    // TxResolved: finalize escrow, grant access and record confirmed transaction
    this.agentra.on('TxResolved', async (txId, user, agentId, event) => {
      try {
        const agent = await prisma.agent.findFirst({ where: { contractAgentId: Number(agentId) } })

        // mark transaction confirmed
        await prisma.transaction.upsert({
          where: { txHash: `${event.log.transactionHash}:${txId.toString()}` },
          update: { status: 'confirmed' },
          create: {
            txHash: `${event.log.transactionHash}:${txId.toString()}`,
            type: 'purchase_access',
            status: 'confirmed',
            agentId: agent ? agent.agentId : null,
            callerWallet: user,
            ownerWallet: agent ? agent.ownerWallet : null,
            totalAmount: '0',
          },
        })

        // grant access by reading accessRegistry expiration
        if (agent) {
          const agentContractId = Number(agent.contractAgentId)
          const exp = await this.agentra.accessRegistry(agentContractId, user)
          const expiresAt = exp && Number(exp) > 0 ? new Date(Number(exp) * 1000) : new Date('9999-12-31')

          await prisma.agentAccess.upsert({
            where: { agentId_userWallet: { agentId: agent.agentId, userWallet: user } },
            update: { expiresAt, isLifetime: false, txHash: `${event.log.transactionHash}:${txId.toString()}` },
            create: { agentId: agent.agentId, userWallet: user, expiresAt, isLifetime: false, txHash: `${event.log.transactionHash}:${txId.toString()}` },
          })

          await recordAgentPurchase({
            agent,
            walletAddress: user,
            txHash: `${event.log.transactionHash}:${txId.toString()}`,
            isLifetime: false,
            expiresAt,
          })
        }
      } catch (err) {
        console.error('[EVENT] TxResolved error:', err.message)
      }
    })

    // TxRefunded: mark tx refunded
    this.agentra.on('TxRefunded', async (txId, user, agentId, event) => {
      try {
        await prisma.transaction.upsert({
          where: { txHash: `${event.log.transactionHash}:${txId.toString()}` },
          update: { status: 'failed' },
          create: {
            txHash: `${event.log.transactionHash}:${txId.toString()}`,
            type: 'purchase_access',
            status: 'failed',
            agentId: null,
            callerWallet: user,
            ownerWallet: null,
            totalAmount: '0',
          },
        })
      } catch (err) {
        console.error('[EVENT] TxRefunded error:', err.message)
      }
    })

    // Agent comms toggles/pricing updates
    this.agentra.on('AgentCommsToggled', async (agentId, enabled, event) => {
      try {
        const agent = await prisma.agent.findFirst({ where: { contractAgentId: Number(agentId) } })
        if (agent) {
          await prisma.agent.update({ where: { id: agent.id }, data: { commsEnabled: enabled } })
        }
      } catch (err) {
        console.error('[EVENT] AgentCommsToggled error:', err.message)
      }
    })

    this.agentra.on('AgentCommsPriceUpdated', async (agentId, newPrice, event) => {
      try {
        const agent = await prisma.agent.findFirst({ where: { contractAgentId: Number(agentId) } })
        if (agent) {
          await prisma.agent.update({ where: { id: agent.id }, data: { commsPricePerCall: newPrice.toString() } })
        }
      } catch (err) {
        console.error('[EVENT] AgentCommsPriceUpdated error:', err.message)
      }
    })

    console.log('[BLOCKCHAIN] ✅ Event listeners started')
  }

  // ─────────────────────────────────────────────
  // INTERNAL
  // ─────────────────────────────────────────────

  _getListingFee(tier) {
    if (tier === 0) return BigInt(config.token.listingFeesWei.standard)
    if (tier === 1) return BigInt(config.token.listingFeesWei.professional)
    if (tier === 2) return BigInt(config.token.listingFeesWei.enterprise)
  }

  // ─────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────

  async calculateRevenue(ownerWallet) {
    const txs = await prisma.transaction.findMany({
      where: { ownerWallet, status: 'confirmed' },
    })

    let total = 0n

    for (const tx of txs) {
      total += BigInt(tx.totalAmount || '0')
    }

    return {
      totalWei: total.toString(),
      txCount: txs.length,
    }
  }
}

export default new BlockchainService()