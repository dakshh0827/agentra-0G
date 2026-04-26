import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, Bell, ChevronDown, Cpu } from 'lucide-react'
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
    analyticsAPI.getGlobalStats().then(res => setStats(res.data)).catch(console.error)
  }, [])

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 border-b border-[rgba(180,92,202,0.08)]"
      style={{ background: 'rgba(10, 8, 18, 0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-[rgba(180,92,202,0.12)] border border-[rgba(180,92,202,0.25)] flex items-center justify-center">
            <Cpu size={13} className="text-[#B45CCA]" />
          </div>
          <span className="font-display font-black text-xs text-[#F5F0FF] tracking-tight">AGENTRA</span>
        </Link>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#5A4E70] tracking-widest uppercase">
          <Radio size={10} />
          {isConnected && chain ? chain.name : 'Disconnected'}
        </div>

        {/* Agents live pill */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(52,211,153,0.15)] bg-[rgba(52,211,153,0.05)] text-xs font-mono text-[#5A4E70] tracking-widest uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-dot" />
          {stats?.activeAgents ?? 0} Online
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-[#5A4E70] hover:text-[#8B7FA0] hover:bg-[rgba(180,92,202,0.06)] transition-colors">
          <Bell size={15} />
        </button>

        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[rgba(180,92,202,0.2)] bg-[rgba(180,92,202,0.06)] text-[#B45CCA] hover:border-[rgba(180,92,202,0.4)] hover:bg-[rgba(180,92,202,0.1)] transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-dot" />
            <span className="text-xs font-mono tracking-tight">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
            {tokenBalance !== undefined && (
              <span className="hidden sm:inline text-xs font-mono text-[#5A4E70]">
                {Number(formatUnits(tokenBalance, 18)).toFixed(2)} AGT
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