import { ethers } from 'ethers'
import config from '../config/config.js'

// ─────────────────────────────────────────────
// AGENTRA ABI (Updated)
// ─────────────────────────────────────────────

const AGENTRA_ABI = [
  // ─────────────────────────────────────────────
  // DEPLOYMENT
  // ─────────────────────────────────────────────

  'function deployStandardAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',
  'function deployProfessionalAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',
  'function deployEnterpriseAgent(uint256 _monthlyPriceUSD,string _metadataURI,bool _commsEnabled,uint256 _commsPricePerCallUSD,uint256 _listingFeeUSD) payable returns (uint256)',

  // ─────────────────────────────────────────────
  // ACCESS / PAYMENTS
  // ─────────────────────────────────────────────

  'function purchaseAccess(uint256 _agentId,uint8 _period) payable',
  'function initiateAgentComms(uint256 _callerAgentId,uint256 _targetAgentId) payable',
  'function getRequiredWei(uint256 _usdAmount) view returns (uint256)',

  // ─────────────────────────────────────────────
  // AGENTS
  // ─────────────────────────────────────────────

  'function agents(uint256) view returns (uint8 tier,uint256 monthlyPriceUSD,bool commsEnabled,uint256 commsPricePerCallUSD)',
  'function updateAgentPricing(uint256 _agentId,uint256 _newMonthlyUSD,uint256 _newCommsUSD)',
  'function toggleAgentComms(uint256 _agentId,bool _enabled)',

  // ─────────────────────────────────────────────
  // ACCESS REGISTRY
  // ─────────────────────────────────────────────

  'function accessRegistry(uint256,address) view returns (uint256)',
  'function localToGlobalId(uint256) view returns (uint256)',

  // ─────────────────────────────────────────────
  // TRANSACTIONS
  // ─────────────────────────────────────────────

  'function pendingTransactions(uint256) view returns (uint256 id,address user,uint256 agentId,uint256 weiAmount,uint8 txType,uint8 period,uint8 status,uint256 timestamp)',
  'function txCounter() view returns (uint256)',
  'function resolveTransaction(uint256 _txId)',
  'function refundTransaction(uint256 _txId)',
  'function claimTimeoutRefund(uint256 _txId)',

  // ─────────────────────────────────────────────
  // ORACLE / PRICING
  // ─────────────────────────────────────────────

  'function update0GPrice(uint256 _newPriceUSD)',
  'function current0GPriceUSD() view returns (uint256)',

  // ─────────────────────────────────────────────
  // ADMIN / PAUSABLE
  // ─────────────────────────────────────────────

  'function pause()',
  'function unpause()',
  'function paused() view returns (bool)',

  // ─────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────

  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
  'function ORACLE_ROLE() view returns (bytes32)',
  'function RESOLVER_ROLE() view returns (bytes32)',
  'function hasRole(bytes32 role,address account) view returns (bool)',
  'function grantRole(bytes32 role,address account)',
  'function revokeRole(bytes32 role,address account)',
  'function renounceRole(bytes32 role,address callerConfirmation)',
  'function getRoleAdmin(bytes32 role) view returns (bytes32)',

  // ─────────────────────────────────────────────
  // ERC721
  // ─────────────────────────────────────────────

  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function approve(address to,uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator,bool approved)',
  'function isApprovedForAll(address owner,address operator) view returns (bool)',
  'function transferFrom(address from,address to,uint256 tokenId)',
  'function safeTransferFrom(address from,address to,uint256 tokenId)',
  'function safeTransferFrom(address from,address to,uint256 tokenId,bytes data)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',

  // ─────────────────────────────────────────────
  // METADATA
  // ─────────────────────────────────────────────

  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function VERSION() view returns (uint256)',

  // ─────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────

  'function feeCollector() view returns (address)',
  'function registry() view returns (address)',
  'function PLATFORM_FEE_PERCENTAGE() view returns (uint256)',
  'function ESCROW_TIMEOUT() view returns (uint256)',

  // ─────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────

  'event AgentAccessGranted(uint256 indexed agentId,address indexed user,uint256 expiry)',
  'event AgentCommsPriceUpdated(uint256 indexed agentId,uint256 newPrice)',
  'event AgentCommsToggled(uint256 indexed agentId,bool enabled)',
  'event AgentDeployed(uint256 indexed agentId,address indexed creator,uint8 tier,uint256 listingFeePaidUSD)',

  'event TxPending(uint256 indexed txId,address indexed user,uint256 indexed agentId,uint8 txType,uint256 weiAmount)',
  'event TxResolved(uint256 indexed txId,address indexed user,uint256 indexed agentId)',
  'event TxRefunded(uint256 indexed txId,address indexed user,uint256 indexed agentId)',

  'event Approval(address indexed owner,address indexed approved,uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner,address indexed operator,bool approved)',
  'event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)',

  'event Paused(address account)',
  'event Unpaused(address account)',

  'event PriceUpdated(uint256 new0GPriceUSD)',

  'event RoleAdminChanged(bytes32 indexed role,bytes32 indexed previousAdminRole,bytes32 indexed newAdminRole)',
  'event RoleGranted(bytes32 indexed role,address indexed account,address indexed sender)',
  'event RoleRevoked(bytes32 indexed role,address indexed account,address indexed sender)',

  'event MetadataUpdate(uint256 _tokenId)',
  'event BatchMetadataUpdate(uint256 _fromTokenId,uint256 _toTokenId)',
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
    commsPricePerCallUSD = 0n,
    listingFeeUSD = 0n
  ) {
    if (this._mockMode) {
      return { success: true, txHash: `0xmock_deploy_${Date.now()}` }
    }

    try {
      // compute required wei for listingFeeUSD supplied by caller
      const requiredWei = listingFeeUSD > 0n ? await this.agentra.getRequiredWei(listingFeeUSD) : 0n

      // 2% buffer for slippage
      const buffered = requiredWei ? (requiredWei + (requiredWei * 2n) / 100n) : 0n

      const tierIndex = Number(tier)
      let tx
      if (tierIndex === 0) {
        tx = await this.agentra.deployStandardAgent(monthlyPriceUSD, metadataURI, commsEnabled, commsPricePerCallUSD, listingFeeUSD, { value: buffered })
      } else if (tierIndex === 1) {
        tx = await this.agentra.deployProfessionalAgent(monthlyPriceUSD, metadataURI, commsEnabled, commsPricePerCallUSD, listingFeeUSD, { value: buffered })
      } else {
        tx = await this.agentra.deployEnterpriseAgent(monthlyPriceUSD, metadataURI, commsEnabled, commsPricePerCallUSD, listingFeeUSD, { value: buffered })
      }

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

      const requiredWei = totalUSD > 0n ? await this.agentra.getRequiredWei(totalUSD) : 0n

      // 2% buffer
      const buffered = requiredWei ? (requiredWei + (requiredWei * 2n) / 100n) : 0n

      const tx = await this.agentra.purchaseAccess(agentId, period, { value: buffered })

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
        id: Number(agentId),
        tier: Number(a.tier),
        monthlyPriceUSD: a.monthlyPriceUSD.toString(),
        commsEnabled: Boolean(a.commsEnabled),
        commsPricePerCallUSD: a.commsPricePerCallUSD.toString(),
      }
    } catch (err) {
      console.error('[CONTRACTS] getAgent error:', err.message)
      return null
    }
  }

  async hasAccess(agentId, user) {
    if (this._mockMode) return true

    try {
      const exp = await this.agentra.accessRegistry(agentId, user)
      if (!exp) return false
      const expNum = Number(exp)
      if (expNum === Number.MAX_SAFE_INTEGER) return true
      return expNum > Math.floor(Date.now() / 1000)
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
    // if (this._mockMode) return () => {}

    // const handler = (agentId, creator, tier, event) => {
    //   callback({
    //     agentId: Number(agentId),
    //     creator,
    //     tier: Number(tier),
    //     txHash: event.log.transactionHash
    //   })
    // }

    // this.agentra.on('AgentDeployed', handler)
    // return () => this.agentra.off('AgentDeployed', handler)
    
    return () => {}
  }

  onAccessPurchased(callback) {
    // if (this._mockMode) return () => {}

    // const handler = (agentId, buyer, isLifetime, event) => {
    //   callback({
    //     agentId: Number(agentId),
    //     buyer,
    //     isLifetime,
    //     txHash: event.log.transactionHash
    //   })
    // }

    // this.agentra.on('AccessPurchased', handler)
    // return () => this.agentra.off('AccessPurchased', handler)

    return () => {}
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
    // this.onAgentDeployed(async (event) => {
    //   try {
    //     await prisma.agent.updateMany({
    //       where: { contractAgentId: event.agentId },
    //       data: { status: 'active' }
    //     })
    //   } catch (err) {
    //     console.error('[EVENT] AgentDeployed DB error:', err.message)
    //   }
    // })

    // // Access purchased
    // this.onAccessPurchased(async (event) => {
    //   try {
    //     await prisma.agentAccess.upsert({
    //       where: {
    //         agentId_userWallet: {
    //           agentId: String(event.agentId),
    //           userWallet: event.buyer
    //         }
    //       },
    //       update: {
    //         isLifetime: event.isLifetime,
    //         expiresAt: event.isLifetime
    //           ? new Date('9999-12-31')
    //           : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    //       },
    //       create: {
    //         agentId: String(event.agentId),
    //         userWallet: event.buyer,
    //         isLifetime: event.isLifetime,
    //         expiresAt: event.isLifetime
    //           ? new Date('9999-12-31')
    //           : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    //       }
    //     })
    //   } catch (err) {
    //     console.error('[EVENT] AccessPurchased DB error:', err.message)
    //   }
    // })

    // console.log('[CONTRACTS] ✅ Event listeners running')

    console.log('[CONTRACTS] ⚠️ Event listeners skipped (0G RPC lacks filter support). Polling active via resolverJob.')
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

  async resolveTransaction(txId) {
    if (this._mockMode) {
      console.log(`[CONTRACTS] Mock mode — skipping resolveTransaction(${txId})`)
      return { hash: `0xmock_resolve_${Date.now()}` }
    }
    if (!this.signer) throw new Error('Signer required for resolveTransaction — set PRIVATE_KEY with RESOLVER_ROLE')
    const tx = await this.agentra.resolveTransaction(txId)
    const receipt = await tx.wait(1)
    console.log(`[CONTRACTS] resolveTransaction(${txId}) ✅ tx: ${receipt.hash}`)
    return receipt
  }

  async refundTransaction(txId) {
    if (this._mockMode) {
      console.log(`[CONTRACTS] Mock mode — skipping refundTransaction(${txId})`)
      return { hash: `0xmock_refund_${Date.now()}` }
    }
    if (!this.signer) throw new Error('Signer required for refundTransaction — set PRIVATE_KEY with RESOLVER_ROLE')
    const tx = await this.agentra.refundTransaction(txId)
    const receipt = await tx.wait(1)
    console.log(`[CONTRACTS] refundTransaction(${txId}) ✅ tx: ${receipt.hash}`)
    return receipt
  }

  async getPendingTransaction(txId) {
    if (this._mockMode) return null
    try {
      const pTx = await this.agentra.pendingTransactions(txId)
      return {
        id: pTx[0],
        user: pTx[1],
        agentId: pTx[2],
        weiAmount: pTx[3],
        txType: pTx[4],
        period: pTx[5],
        status: pTx[6],
        timestamp: pTx[7],
      }
    } catch (err) {
      console.error(`[CONTRACTS] getPendingTransaction(${txId}) error:`, err.message)
      return null
    }
  }

  async getTxCounter() {
    if (this._mockMode) return 0n
    try {
      return await this.agentra.txCounter()
    } catch (err) {
      console.error('[CONTRACTS] getTxCounter error:', err.message)
      return 0n
    }
  }
}

export default new ContractManager()