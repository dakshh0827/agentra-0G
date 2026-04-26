import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Search, Zap, RefreshCw, Activity, Cpu, TrendingUp, Sparkles, SlidersHorizontal, X } from 'lucide-react'
import AgentCard from '../components/ui/AgentCard'
import NeonButton from '../components/ui/NeonButton'
import LoadingPulse from '../components/ui/LoadingPulse'
import { useAgents } from '../hooks/useAgents'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import { analyticsAPI } from '../api/analytics'

function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const CATEGORIES = ['all', 'Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']
const SORT_OPTIONS = [
  { value: 'score', label: 'Top Scored' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'calls', label: 'Most Used' },
  { value: 'newest', label: 'Newest' },
]

const catColors = {
  all: 'rgba(180,92,202,0.1)',
  Analysis: 'rgba(147,197,253,0.08)',
  Development: 'rgba(180,92,202,0.08)',
  Security: 'rgba(248,113,113,0.08)',
  Data: 'rgba(251,191,36,0.08)',
  NLP: 'rgba(52,211,153,0.08)',
  Web3: 'rgba(217,70,239,0.08)',
  Other: 'rgba(139,127,160,0.08)',
}

export default function Marketplace() {
  const { agents, isLoading } = useAgents()
  const { filters, search, setFilter, setSearch } = useMarketplaceStore()
  const [stats, setStats] = useState(null)
  const [searchInput, setSearchInput] = useState(search)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    analyticsAPI.getGlobalStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 280)
    return () => clearTimeout(t)
  }, [searchInput, setSearch])

  const displayAgents = Array.isArray(agents) ? agents : []

  const filteredAgents = displayAgents.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    const matchCat = !filters.category || filters.category === 'all' || a.category === filters.category
    return matchSearch && matchCat
  }).sort((a, b) => {
    if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (filters.sortBy === 'calls') return (b.calls || 0) - (a.calls || 0)
    if (filters.sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    return (b.score || 0) - (a.score || 0)
  })

  const statItems = [
    { label: 'Total Agents', value: stats?.totalAgents ?? displayAgents.length, icon: Cpu, color: '#B45CCA' },
    { label: 'Active Now', value: stats?.activeAgents ?? '—', icon: Activity, color: '#34D399' },
    { label: 'Total Calls', value: stats?.totalCalls ? `${(stats.totalCalls / 1000).toFixed(1)}k` : '—', icon: TrendingUp, color: '#93C5FD' },
    { label: 'Volume', value: stats?.totalRevenue ? `${parseFloat(stats.totalRevenue).toFixed(0)} AGT` : '—', icon: Sparkles, color: '#FBBF24' },
  ]

  return (
    <div className="relative min-h-screen" style={{ background: '#0A0812' }}>
      {/* Ambient orb */}
      <div className="fixed top-0 right-0 w-[600px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(180,92,202,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto pb-24 lg:pb-8">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-dot" />
            <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">Agent Network Live</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter mb-4">
            <span className="gradient-text-purple">Agent</span>
            <span className="text-[#F5F0FF]"> Marketplace</span>
          </h1>
          <p className="text-[#8B7FA0] text-sm max-w-xl font-light">
            Discover, execute, and compose autonomous AI agents. Powered by AGT token.
          </p>
        </motion.div>

        {/* ── STATS ROW ── */}
        <Section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statItems.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{
                    background: 'rgba(17, 13, 30, 0.8)',
                    border: '1px solid rgba(180, 92, 202, 0.1)',
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }} />
                  <Icon size={16} className="mb-3" style={{ color: s.color }} />
                  <div className="font-display font-bold text-2xl tracking-tighter" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-[#5A4E70] font-mono tracking-widest uppercase mt-1">{s.label}</div>
                </motion.div>
              )
            })}
          </div>
        </Section>

        {/* ── SEARCH + FILTERS ── */}
        <Section className="mb-8">
          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: 'rgba(17,13,30,0.8)', border: '1px solid rgba(180,92,202,0.1)' }}>

            {/* Search row */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A4E70]" />
                <input
                  type="text"
                  placeholder="Search agents, capabilities, tags..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm tracking-tight"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A4E70] hover:text-[#8B7FA0]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  showFilters
                    ? 'border-[rgba(180,92,202,0.4)] bg-[rgba(180,92,202,0.1)] text-[#B45CCA]'
                    : 'border-[rgba(180,92,202,0.15)] text-[#8B7FA0] hover:border-[rgba(180,92,202,0.3)] hover:text-[#C4B8D8]'
                }`}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <NeonButton variant="ghost" icon={RefreshCw} size="sm"
                onClick={() => { setSearchInput(''); setSearch(''); setFilter('category', 'all'); }}
              >
                <span className="hidden sm:inline">Reset</span>
              </NeonButton>
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter('category', cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer tracking-tight ${
                    (filters?.category || 'all') === cat
                      ? 'border-[rgba(180,92,202,0.4)] text-[#D084DA]'
                      : 'border-[rgba(180,92,202,0.1)] text-[#5A4E70] hover:border-[rgba(180,92,202,0.25)] hover:text-[#8B7FA0]'
                  }`}
                  style={{
                    background: (filters?.category || 'all') === cat ? catColors[cat] : 'transparent',
                  }}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </motion.button>
              ))}
            </div>

            {/* Sort (shown when filters open) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 mt-4 border-t border-[rgba(180,92,202,0.08)] overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">Sort by:</span>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilter('sortBy', opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          (filters?.sortBy || 'score') === opt.value
                            ? 'border-[rgba(180,92,202,0.4)] text-[#D084DA] bg-[rgba(180,92,202,0.1)]'
                            : 'border-[rgba(180,92,202,0.1)] text-[#5A4E70] hover:border-[rgba(180,92,202,0.25)] hover:text-[#8B7FA0]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>

        {/* ── RESULTS ── */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">
              <span className="text-[#B45CCA]">{filteredAgents.length}</span> agents found
            </span>
          </div>
        )}

        {isLoading ? (
          <LoadingPulse rows={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAgents.map((agent, i) => (
              <AgentCard key={agent.agentId || agent.id || i} agent={agent} index={i} />
            ))}

            {filteredAgents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full"
              >
                <div
                  className="rounded-2xl p-16 text-center"
                  style={{ background: 'rgba(17,13,30,0.8)', border: '1px solid rgba(180,92,202,0.1)' }}
                >
                  <Zap size={32} className="text-[#5A4E70] opacity-30 mx-auto mb-4" />
                  <div className="text-[#8B7FA0] text-sm font-display font-bold mb-2 tracking-tight">No Agents Found</div>
                  <div className="text-[#5A4E70] text-xs font-mono tracking-widest uppercase">Try adjusting your search or filters</div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}