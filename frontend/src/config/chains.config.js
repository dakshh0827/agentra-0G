import { zeroGTestnet } from './custom-chains'
import deployments from '../deployments.json'

// Wagmi is pinned to Zero Gravity Chain only.
export const SUPPORTED_CHAINS = [zeroGTestnet]

// Dynamic lookup map for the single supported chain.
export const CHAIN_CONFIG = SUPPORTED_CHAINS.reduce((acc, chain) => {
  acc[chain.id] = {
    chain,
    contracts: deployments[chain.id] || {},
  }
  return acc
}, {})