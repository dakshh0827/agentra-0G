import { ethers } from 'ethers'
import config from '../config/config.js'

// ─────────────────────────────────────────────
// AGENTRA ABI (Updated)
// ─────────────────────────────────────────────

const AGENTRA_ABI = [
  'function deployAgent(uint8 tier, uint256 monthlyPrice, string metadataURI, bool commsEnabled, uint256 commsPricePerCall) payable',
  'function purchaseAccess(uint256 agentId, bool isLifetime) payable',
  'function agents(uint256) view returns (uint256 id, address creator, uint8 tier, uint256 monthlyPrice, string metadataURI, uint256 upvotes, bool commsEnabled, uint256 commsPricePerCall)',
  'function hasAccess(uint256 agentId, address user) view returns (bool)',

  // New helper functions (assumed from your spec)
  'function listingFeesUSD(uint8 tier) view returns (uint256)',
  'function getRequiredWei(uint256 usdAmount) view returns (uint256)',

  'event AgentDeployed(uint256 indexed agentId, address indexed creator, uint8 tier)',
  'event AccessPurchased(uint256 indexed agentId, address indexed buyer, bool isLifetime)',

  'function update0GPrice(uint256 _newPriceUSD) external',
  'function current0GPriceUSD() view returns (uint256)',
]

// ─────────────────────────────────────────────
// CONTRACT MANAGER
// ─────────────────────────────────────────────

class ContractManager {
  constructor() {
    this.provider = null
    this.signer = null
    this.agentra = null
    this._initialized = false
    this._mockMode = false
  }

  async init() {
    if (this._initialized) return

    if (!config.blockchain.rpcUrl) {
      console.warn('[CONTRACTS] Mock mode enabled — no RPC URL configured')
      this._mockMode = true
      this._initialized = true
      return
    }

    try {
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)

      if (config.blockchain.privateKey) {
        this.signer = new ethers.Wallet(config.blockchain.privateKey, this.provider)
        console.log('[CONTRACTS] Signer:', this.signer.address)
      }

      const runner = this.signer || this.provider
      const { agentra } = config.blockchain.contracts

      if (!agentra) {
        console.warn('[CONTRACTS] Agentra contract address not configured — mock mode enabled')
        this._mockMode = true
        this._initialized = true
        return
      }

      this.agentra = new ethers.Contract(agentra, AGENTRA_ABI, runner)

      console.log('[CONTRACTS] Agentra:', agentra)
      this._initialized = true
      console.log('[CONTRACTS] ✅ Initialized')
    } catch (err) {
      console.error('[CONTRACTS] Init failed:', err.message)
      this._mockMode = true
      this._initialized = true
    }
  }

  get isMock() {
    return this._mockMode
  }

  // ─────────────────────────────────────────────
  // NETWORK INFO
  // ─────────────────────────────────────────────

  async getNetworkInfo() {
    if (this._mockMode || !this.provider) {
      return { mock: true, rpcUrl: config.blockchain.rpcUrl || 'none' }
    }

    try {
      const network = await this.provider.getNetwork()
      return {
        chainId: Number(network.chainId),
        name: network.name,
        rpcUrl: config.blockchain.rpcUrl,
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  // ─────────────────────────────────────────────
  // DEPLOY AGENT (Native Payment)
  // ─────────────────────────────────────────────

  async deployAgent(
    tier,
    monthlyPriceUSD,
    metadataURI,
    commsEnabled = false,
    commsPricePerCallUSD = 0n
  ) {
    if (this._mockMode) {
      return { success: true, txHash: `0xmock_deploy_${Date.now()}` }
    }

    try {
      const listingFeeUSD = await this.agentra.listingFeesUSD(tier)
      const requiredWei = await this.agentra.getRequiredWei(listingFeeUSD)

      // 2% buffer for slippage
      const buffered = requiredWei + (requiredWei * 2n) / 100n

      const tx = await this.agentra.deployAgent(
        tier,
        monthlyPriceUSD,
        metadataURI,
        commsEnabled,
        commsPricePerCallUSD,
        { value: buffered }
      )

      const receipt = await tx.wait(1)

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // ─────────────────────────────────────────────
  // PURCHASE ACCESS (Native Payment)
  // ─────────────────────────────────────────────

  async purchaseAccess(agentId, period, monthlyPriceUSD) {
    if (this._mockMode) {
      return { success: true, txHash: `0xmock_purchase_${Date.now()}` }
    }

    try {
      const multiplier = period === 1 ? 12n : 1n
      const totalUSD = BigInt(monthlyPriceUSD) * multiplier

      const requiredWei = await this.agentra.getRequiredWei(totalUSD)

      // 2% buffer
      const buffered = requiredWei + (requiredWei * 2n) / 100n

      const tx = await this.agentra.purchaseAccess(agentId, period, {
        value: buffered
      })

      const receipt = await tx.wait(1)

      return {
        success: true,
        txHash: receipt.hash
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // ─────────────────────────────────────────────
  // READ FUNCTIONS
  // ─────────────────────────────────────────────

  async getAgent(agentId) {
    if (this._mockMode) return null

    try {
      const a = await this.agentra.agents(agentId)

      return {
        id: Number(a.id),
        creator: a.creator,
        tier: Number(a.tier),
        monthlyPrice: a.monthlyPrice.toString(),
        metadataURI: a.metadataURI,
        upvotes: Number(a.upvotes),
        commsEnabled: a.commsEnabled,
        commsPricePerCall: a.commsPricePerCall.toString()
      }
    } catch (err) {
      console.error('[CONTRACTS] getAgent error:', err.message)
      return null
    }
  }

  async hasAccess(agentId, user) {
    if (this._mockMode) return true

    try {
      return await this.agentra.hasAccess(agentId, user)
    } catch {
      return false
    }
  }

  async isTransactionConfirmed(txHash) {
    if (!txHash || typeof txHash !== 'string') return false
    if (this._mockMode) return true
    if (!this.provider) return false

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash)
      return !!(receipt && receipt.status === 1)
    } catch {
      return false
    }
  }

  // ─────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────

  onAgentDeployed(callback) {
    if (this._mockMode) return () => {}

    const handler = (agentId, creator, tier, event) => {
      callback({
        agentId: Number(agentId),
        creator,
        tier: Number(tier),
        txHash: event.log.transactionHash
      })
    }

    this.agentra.on('AgentDeployed', handler)
    return () => this.agentra.off('AgentDeployed', handler)
  }

  onAccessPurchased(callback) {
    if (this._mockMode) return () => {}

    const handler = (agentId, buyer, isLifetime, event) => {
      callback({
        agentId: Number(agentId),
        buyer,
        isLifetime,
        txHash: event.log.transactionHash
      })
    }

    this.agentra.on('AccessPurchased', handler)
    return () => this.agentra.off('AccessPurchased', handler)
  }

  // ─────────────────────────────────────────────
  // LISTENERS (DB SYNC)
  // ─────────────────────────────────────────────

  startAllListeners(prisma) {
    if (this._mockMode) {
      console.log('[CONTRACTS] Mock mode — no listeners')
      return
    }

    // Agent deployed
    this.onAgentDeployed(async (event) => {
      try {
        await prisma.agent.updateMany({
          where: { contractAgentId: event.agentId },
          data: { status: 'active' }
        })
      } catch (err) {
        console.error('[EVENT] AgentDeployed DB error:', err.message)
      }
    })

    // Access purchased
    this.onAccessPurchased(async (event) => {
      try {
        await prisma.agentAccess.upsert({
          where: {
            agentId_userWallet: {
              agentId: String(event.agentId),
              userWallet: event.buyer
            }
          },
          update: {
            isLifetime: event.isLifetime,
            expiresAt: event.isLifetime
              ? new Date('9999-12-31')
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          create: {
            agentId: String(event.agentId),
            userWallet: event.buyer,
            isLifetime: event.isLifetime,
            expiresAt: event.isLifetime
              ? new Date('9999-12-31')
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      } catch (err) {
        console.error('[EVENT] AccessPurchased DB error:', err.message)
      }
    })

    console.log('[CONTRACTS] ✅ Event listeners running')
  }

  async update0GPrice(priceWei) {
    if (this._mockMode) {
      console.log('[CONTRACTS] Mock mode — skipping update0GPrice')
      return { hash: `0xmock_oracle_${Date.now()}` }
    }

    if (!this.signer) {
      throw new Error('Signer required for update0GPrice — set PRIVATE_KEY with ORACLE_ROLE')
    }

    return await this.agentra.update0GPrice(priceWei)
  }

  async getCurrent0GPrice() {
    if (this._mockMode) return null
    try {
      return await this.agentra.current0GPriceUSD()
    } catch (err) {
      console.error('[CONTRACTS] getCurrent0GPrice error:', err.message)
      return null
    }
  }
}

export default new ContractManager()