import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, RefreshCw, Activity, Cpu, TrendingUp, Sparkles, Star, PhoneCall, Zap, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingPulse from '../components/ui/LoadingPulse'
import NeonButton from '../components/ui/NeonButton'
import { useAgents } from '../hooks/useAgents'
import { useMarketplaceStore } from '../stores/marketplaceStore'
import { analyticsAPI } from '../api/analytics'
import { getAgentExternalId } from '../utils/helpers'

const CATEGORIES = ['all', 'Analysis', 'Development', 'Security', 'Data', 'NLP', 'Web3', 'Other']

const SORT_OPTIONS = [
  { value: 'score', label: 'Top Score' },
  { value: 'rating', label: 'Top Rating' },
  { value: 'calls', label: 'Most Calls' },
  { value: 'newest', label: 'Newest' },
]

export default function Marketplace() {
  const { agents, isLoading } = useAgents()
  const { filters, search, setFilter, setSearch } = useMarketplaceStore()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setStatsLoading(true)
    analyticsAPI.getGlobalStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 260)
    return () => clearTimeout(t)
  }, [searchInput, setSearch])

  const list = Array.isArray(agents) ? agents : []

  const filteredAgents = useMemo(() => {
    return list
      .filter((a) => {
        const q = search.toLowerCase()
        const matchSearch =
          !search ||
          a.name?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(q))

        const matchCat = !filters.category || filters.category === 'all' || a.category === filters.category
        return matchSearch && matchCat
      })
      .sort((a, b) => {
        if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (filters.sortBy === 'calls') return (b.calls || 0) - (a.calls || 0)
        if (filters.sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        return (b.score || 0) - (a.score || 0)
      })
  }, [filters.category, filters.sortBy, list, search])

  return (
    <div className="min-h-screen bg-bg text-text-primary px-4 sm:px-6 lg:px-8 py-7">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-dim font-semibold">Directory</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight">
                AGENT <span className="text-primary">MARKETPLACE</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-text-dim">{filteredAgents.length} results</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SIDEBAR CONTROLS */}
          <aside className="lg:col-span-3 rounded-xl border border-border bg-panel p-5 sticky top-16 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold mb-4">
              <SlidersHorizontal size={16} className="text-primary" /> Filters & Sort
            </div>

            <div className="relative mb-5">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search agents..."
                className="input-field rounded-lg pl-9 pr-3 py-2.5 w-full text-sm bg-bg-secondary border-border focus:border-primary transition-colors"
              />
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-text-dim uppercase tracking-wide mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter('category', cat)}
                    className={`text-xs rounded-lg px-3 py-1.5 border transition-all ${
                      (filters?.category || 'all') === cat
                        ? 'border-accent-pink bg-accent-pink/10 text-primary font-medium'
                        : 'border-border text-text-secondary bg-bg hover:bg-bg-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-text-dim uppercase tracking-wide mb-3">Sort By</p>
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter('sortBy', opt.value)}
                    className={`w-full text-left text-xs rounded-lg px-3 py-2.5 border transition-all ${
                      (filters?.sortBy || 'score') === opt.value
                        ? 'border-accent-pink bg-accent-pink/10 text-primary font-medium'
                        : 'border-border text-text-secondary bg-bg hover:bg-bg-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <NeonButton
              variant="ghost"
              icon={RefreshCw}
              size="sm"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setFilter('category', 'all')
                setFilter('sortBy', 'score')
              }}
              className="w-full justify-center"
            >
              Reset Filters
            </NeonButton>
          </aside>

          {/* MAIN CONTENT AREA */}
          <section className="lg:col-span-9 space-y-6">
            {/* STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Cpu, label: 'Total Agents', value: stats?.totalAgents ?? list.length },
                { icon: Activity, label: 'Active', value: stats?.activeAgents ?? 0 },
                { icon: TrendingUp, label: 'Calls', value: stats?.totalCalls ?? 0 },
                { icon: Sparkles, label: 'Volume', value: stats?.totalRevenue ?? 0 },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-xl border border-border bg-panel px-4 py-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-text-dim font-medium">{item.label}</div>
                      <Icon size={14} className="text-primary opacity-80" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-text-primary">
                      {statsLoading ? <Loader2 size={16} className="animate-spin text-primary" /> : String(item.value)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* AGENT CARDS GRID */}
            {isLoading ? (
              <LoadingPulse />
            ) : (
              <>
                {filteredAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAgents.map((agent, idx) => (
                      <Link key={agent.id || agent.agentId || idx} to={`/agent/${getAgentExternalId(agent)}`}>
                        <motion.div 
                          whileHover={{ y: -4 }}
                          className="rounded-xl border border-border bg-panel p-5 flex flex-col h-full hover:border-border-bright hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <h3 className="font-bold text-lg text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                              {agent.name}
                            </h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-bg-secondary rounded border border-border text-text-secondary whitespace-nowrap">
                              {agent.category}
                            </span>
                          </div>
                          
                          <p className="text-sm text-text-secondary line-clamp-2 mb-4 grow leading-relaxed">
                            {agent.description || "No description provided for this agent."}
                          </p>

                          {/* Contract Address */}
                          {(agent.contractAddress || agent.deployerAddress) && (
                            <div className="mb-4 p-2.5 bg-bg-secondary rounded-lg border border-border/50">
                              <p className="text-[10px] uppercase tracking-wider text-text-dim font-semibold mb-1">Contract</p>
                              <p className="font-mono text-xs text-text-primary break-all">{agent.contractAddress || agent.deployerAddress}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-text-dim pt-4 border-t border-border/60">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-medium text-text-primary">{(agent.rating || 0).toFixed(1)}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <PhoneCall size={12} className="text-text-dim" />
                                {agent.calls || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-1 rounded">
                              <Zap size={12} />
                              {(agent.score || 0).toFixed(1)}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-panel p-12 text-center flex flex-col items-center justify-center min-h-75">
                    <Search size={32} className="text-text-dim mb-4" />
                    <p className="text-xl font-semibold text-text-primary mb-2">No agents found</p>
                    <p className="text-sm text-text-secondary">Try adjusting your filters or search query to find what you're looking for.</p>
                    <NeonButton 
                      variant="outline" 
                      className="mt-6"
                      onClick={() => {
                        setSearchInput('')
                        setSearch('')
                        setFilter('category', 'all')
                      }}
                    >
                      Clear Filters
                    </NeonButton>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}