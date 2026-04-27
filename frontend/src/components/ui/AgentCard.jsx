import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Activity, ArrowUpRight, Shield, Star, TrendingUp, Zap } from 'lucide-react'
import { formatUnits } from 'viem'
import { getAgentExternalId } from '../../utils/helpers'

const categoryTone = {
  Analysis: { bg: '#e8f0fb', text: '#486c97', border: '#c4d7ee' },
  Development: { bg: '#f7e1ef', text: '#8f3ca3', border: '#dfbed5' },
  Security: { bg: '#f8e1e1', text: '#a54242', border: '#e4bebe' },
  Data: { bg: '#f7ecd9', text: '#9c6b2f', border: '#e7d1af' },
  NLP: { bg: '#e4f2ea', text: '#3f7a5d', border: '#c7e0d1' },
  Web3: { bg: '#f2e2f4', text: '#9346a2', border: '#dcc0e0' },
  Other: { bg: '#ece5df', text: '#6e5c58', border: '#d9cbc0' },
}

function formatPricing(pricing) {
  if (!pricing) return '0'
  try {
    const num = BigInt(pricing)
    if (num > 1000000000000000n) return Number(formatUnits(num, 18)).toFixed(4)
    return Number(pricing).toFixed(4)
  } catch {
    return Number(pricing || 0).toFixed(4)
  }
}

export default function AgentCard({ agent, index = 0 }) {
  const tone = categoryTone[agent.category] || categoryTone.Other
  const displayId = getAgentExternalId(agent)
  const isOnChain = !!agent.contractAgentId

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      className="h-full"
    >
      <Link to={`/agent/${displayId}`} className="h-full block">
        <motion.div
          whileHover={{ y: -2 }}
          className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-pink)] border border-[#d9b6c9] flex items-center justify-center shrink-0">
                <Zap size={16} className="text-[var(--color-primary)]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{agent.name}</h3>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ background: tone.bg, color: tone.text, borderColor: tone.border }}
                  >
                    {agent.category}
                  </span>
                  {isOnChain ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#d9b6c9] bg-[var(--color-accent-pink)] text-[var(--color-primary)] inline-flex items-center gap-1">
                      <Shield size={9} /> Chain
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-[var(--color-primary)] text-xs font-medium shrink-0">
              View <ArrowUpRight size={11} />
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
            {agent.description || 'No description provided.'}
          </p>

          <div className="mt-4 pt-3 border-t border-[var(--color-border)] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="inline-flex items-center gap-1 text-[var(--color-warning)] text-xs font-semibold">
                <Star size={10} /> {(agent.rating || 0).toFixed(1)}
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wide mt-0.5">Rating</div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[var(--color-star-blue)] text-xs font-semibold">
                <Activity size={10} /> {((agent.calls || 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wide mt-0.5">Calls</div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[var(--color-success)] text-xs font-semibold">
                <TrendingUp size={10} /> {(agent.successRate || 0).toFixed(0)}%
              </div>
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wide mt-0.5">Success</div>
            </div>
          </div>

          <div className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
            {formatPricing(agent.pricing)} AGT <span className="text-[11px] text-[var(--color-text-dim)] font-medium">/ month</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
