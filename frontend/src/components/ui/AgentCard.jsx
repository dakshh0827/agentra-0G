import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Star, TrendingUp, Activity, Shield, ArrowUpRight } from 'lucide-react'
import { formatUnits } from 'viem'
import clsx from 'clsx'
import { getAgentExternalId } from '../../utils/helpers'

const categoryColors = {
  Analysis: { text: 'text-[#93C5FD]', bg: 'bg-[rgba(147,197,253,0.08)]', border: 'border-[rgba(147,197,253,0.2)]' },
  Development: { text: 'text-[#B45CCA]', bg: 'bg-[rgba(180,92,202,0.08)]', border: 'border-[rgba(180,92,202,0.2)]' },
  Security: { text: 'text-[#F87171]', bg: 'bg-[rgba(248,113,113,0.08)]', border: 'border-[rgba(248,113,113,0.2)]' },
  Data: { text: 'text-[#FBBF24]', bg: 'bg-[rgba(251,191,36,0.08)]', border: 'border-[rgba(251,191,36,0.2)]' },
  NLP: { text: 'text-[#34D399]', bg: 'bg-[rgba(52,211,153,0.08)]', border: 'border-[rgba(52,211,153,0.2)]' },
  Web3: { text: 'text-[#D946EF]', bg: 'bg-[rgba(217,70,239,0.08)]', border: 'border-[rgba(217,70,239,0.2)]' },
  Other: { text: 'text-[#8B7FA0]', bg: 'bg-[rgba(139,127,160,0.08)]', border: 'border-[rgba(139,127,160,0.2)]' },
}

const statusDot = {
  active: 'bg-[#34D399]',
  busy: 'bg-[#FBBF24]',
  offline: 'bg-[#F87171]',
  draft: 'bg-[#5A4E70]',
}

function formatPricing(pricing) {
  if (!pricing) return '0'
  try {
    const num = BigInt(pricing)
    if (num > 1000000000000000n) return parseFloat(formatUnits(num, 18)).toFixed(4)
    return parseFloat(pricing).toFixed(4)
  } catch {
    return parseFloat(pricing).toFixed(4)
  }
}

export default function AgentCard({ agent, index = 0 }) {
  const cat = categoryColors[agent.category] || categoryColors.Other
  const dot = statusDot[agent.status] || statusDot.active
  const displayId = getAgentExternalId(agent)
  const isOnChain = !!agent.contractAgentId

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link to={`/agent/${displayId}`} className="block h-full">
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="relative rounded-2xl h-full flex flex-col overflow-hidden group"
          style={{
            background: 'rgba(17, 13, 30, 0.8)',
            border: '1px solid rgba(180, 92, 202, 0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Hover glow top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(180,92,202,0)] to-transparent group-hover:via-[rgba(180,92,202,0.5)] transition-all duration-500" />

          {/* Inner hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(180,92,202,0.08), transparent 60%)' }} />

          <div className="relative z-10 p-5 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(180,92,202,0.1)] border border-[rgba(180,92,202,0.2)] flex items-center justify-center shrink-0 group-hover:border-[rgba(180,92,202,0.4)] transition-colors">
                  <Zap size={16} className="text-[#B45CCA]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm text-[#F5F0FF] tracking-tight leading-tight truncate group-hover:text-[#D084DA] transition-colors">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={clsx('tag-pill', cat.text, cat.bg, cat.border)}>
                      {agent.category}
                    </span>
                    {isOnChain && (
                      <span className="tag-pill text-[#B45CCA] bg-[rgba(180,92,202,0.08)] border-[rgba(180,92,202,0.2)] flex items-center gap-1">
                        <Shield size={8} /> CHAIN
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={clsx('w-1.5 h-1.5 rounded-full pulse-dot', dot)} />
              </div>
            </div>

            {/* Description */}
            <p className="text-[#8B7FA0] text-xs leading-relaxed mb-4 line-clamp-2 flex-1 font-light">
              {agent.description || 'No description provided.'}
            </p>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-[rgba(180,92,202,0.08)]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star size={10} className="text-[#FBBF24]" fill="#FBBF24" />
                  <span className="text-xs font-bold text-[#FBBF24]">{(agent.rating || 0).toFixed(1)}</span>
                </div>
                <div className="text-xs text-[#5A4E70] font-mono uppercase tracking-widest">Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Activity size={10} className="text-[#93C5FD]" />
                  <span className="text-xs font-bold text-[#93C5FD]">{((agent.calls || 0) / 1000).toFixed(1)}k</span>
                </div>
                <div className="text-xs text-[#5A4E70] font-mono uppercase tracking-widest">Calls</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <TrendingUp size={10} className="text-[#34D399]" />
                  <span className="text-xs font-bold text-[#34D399]">{(agent.successRate || 0).toFixed(0)}%</span>
                </div>
                <div className="text-xs text-[#5A4E70] font-mono uppercase tracking-widest">Success</div>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-[#D084DA] font-display tracking-tight">
                    {formatPricing(agent.pricing)} AGT
                  </span>
                  <span className="text-xs text-[#5A4E70] font-mono">/mo</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(180,92,202,0.08)] border border-[rgba(180,92,202,0.15)] text-[#B45CCA] text-xs font-semibold group-hover:bg-[rgba(180,92,202,0.15)] group-hover:border-[rgba(180,92,202,0.35)] transition-all">
                View <ArrowUpRight size={11} />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}