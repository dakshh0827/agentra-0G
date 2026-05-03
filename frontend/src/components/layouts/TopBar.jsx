import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, Bell, ChevronDown, Loader2 } from 'lucide-react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import NeonButton from '../ui/NeonButton'
import { analyticsAPI } from '../../api/analytics'
import { CHAIN_CONFIG } from '../../config/chains.config'

const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
]

export default function TopBar() {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      localStorage.setItem('wallet-address', address.toLowerCase())
    } else {
      localStorage.removeItem('wallet-address')
    }
  }, [address])

  const currentNetwork = chain?.id ? CHAIN_CONFIG[chain.id] : null
  const tokenAddress = currentNetwork?.contracts?.AgentToken?.address
  const tokenAbi = currentNetwork?.contracts?.AgentToken?.abi || ERC20_ABI

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress },
  })

  useEffect(() => {
    setStatsLoading(true)
    analyticsAPI.getGlobalStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 border-b border-border"
      style={{ background: 'var(--color-panel)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 shrink-0">
            <img src="/logo/logo48.png" alt="Agentra" className="w-7 h-7 rounded-xl" />
          <span className="font-display font-semibold text-xs text-text-primary tracking-tight">AGENTRA</span>
        </Link>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-text-dim tracking-wide uppercase">
          <Radio size={10} />
          {isConnected && chain ? chain.name : 'Disconnected'}
        </div>

        {/* Agents live pill */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono text-text-dim tracking-wide uppercase"
          style={{ borderColor: '#d9c6b5', background: '#f4ebdf' }}
        >
          {statsLoading ? (
            <Loader2 size={11} className="animate-spin text-primary" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          )}
          {statsLoading ? 'Loading' : `${stats?.activeAgents ?? 0} Online`}
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-text-dim hover:text-primary hover:bg-accent-pink transition-colors">
          <Bell size={15} />
        </button>

        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#d7b4c8] bg-accent-pink text-primary hover:border-[#c99eb8] hover:bg-[#f4d6e6] transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            <span className="text-xs font-mono tracking-tight">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
            {tokenBalance !== undefined && (
              <span className="hidden sm:inline text-xs font-mono text-text-dim">
                {Number(formatUnits(tokenBalance, 18)).toFixed(2)} 0G
              </span>
            )}
            <ChevronDown size={12} />
          </button>
        ) : (
          <NeonButton size="sm" onClick={() => open()}>
            Connect Wallet
          </NeonButton>
        )}
      </div>
    </header>
  )
}