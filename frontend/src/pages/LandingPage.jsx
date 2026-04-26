import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Cpu, Zap, Shield, BarChart3, Globe, Upload,
  ArrowRight, Activity, Layers, Lock, Rocket, Code2,
  ChevronDown, Sparkles, Network, Database,
} from 'lucide-react'
import { analyticsAPI } from '../api/analytics'

/* ── Lenis-style smooth scroll via CSS + JS ── */
function useSmoothScroll() {
  useEffect(() => {
    let scrollY = 0
    let targetY = 0
    let rafId = null
    const ease = 0.08

    const onWheel = (e) => {
      e.preventDefault()
      targetY = Math.max(0, Math.min(targetY + e.deltaY, document.body.scrollHeight - window.innerHeight))
    }

    const tick = () => {
      scrollY += (targetY - scrollY) * ease
      window.scrollTo(0, scrollY)
      rafId = requestAnimationFrame(tick)
    }

    // Only enable on desktop
    if (window.innerWidth > 768) {
      window.addEventListener('wheel', onWheel, { passive: false })
      rafId = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(rafId)
    }
  }, [])
}

/* ── Animated counter ── */
function Counter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const end = parseInt(value) || 0
    if (end === 0) return
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ── Section wrapper ── */
function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Noise texture overlay ── */
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        mixBlendMode: 'overlay',
      }}
    />
  )
}

const FEATURES = [
  { num: '01', icon: Zap, title: 'Instant Execution', desc: 'Execute AI agents on-demand with sub-second routing. Pay-per-call pricing keeps costs transparent and fair.' },
  { num: '02', icon: Shield, title: 'Trustless & Secure', desc: 'On-chain smart contracts ensure immutable ownership, transparent payments, and verifiable execution logs.' },
  { num: '03', icon: Globe, title: 'MCP Protocol', desc: 'Standardized Model Context Protocol endpoints enable seamless agent composition and interoperability.' },
  { num: '04', icon: BarChart3, title: 'Real-time Analytics', desc: 'Track revenue, usage, and performance metrics across all your deployed agents from a unified dashboard.' },
  { num: '05', icon: Layers, title: 'Agent Composition', desc: "Chain multiple agents together to build complex workflows. One agent's output becomes another's input." },
  { num: '06', icon: Lock, title: 'Wallet Identity', desc: 'Your wallet is your identity. Deploy, execute, and earn — all tied to your on-chain address.' },
]

const STEPS = [
  { num: '01', icon: Upload, title: 'Deploy Your Agent', desc: 'Configure your AI agent with an MCP endpoint, set pricing, and publish to the marketplace in minutes.' },
  { num: '02', icon: Globe, title: 'Get Discovered', desc: 'Your agent appears in the marketplace where developers can search, filter, and evaluate capabilities.' },
  { num: '03', icon: Activity, title: 'Earn Per Execution', desc: 'Every time someone executes your agent, you earn AGT. Revenue flows directly to your wallet.' },
  { num: '04', icon: BarChart3, title: 'Scale & Optimize', desc: 'Monitor analytics, climb the leaderboard, and optimize based on real usage data and community votes.' },
]

const TECH_STACK = ['MCP Protocol', 'Zero Gravity Chain', 'Smart Contracts', 'AGT Token', 'Pay-per-Call', 'Open Source']

export default function LandingPage() {
  const [stats, setStats] = useState(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    analyticsAPI.getGlobalStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const STAT_ITEMS = [
    { value: stats?.totalAgents ?? '—', suffix: '+', label: 'Agents Deployed' },
    { value: stats?.totalCalls ?? '—', suffix: '+', label: 'Executions' },
    { value: stats?.activeAgents ?? '—', suffix: '', label: 'Active Now' },
    { value: '0G', suffix: '', label: 'Storage Layer' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0A0812' }}>
      <NoiseOverlay />

      {/* ── AMBIENT ORBS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="orb orb-primary w-[700px] h-[700px]" style={{ top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="orb orb-secondary w-[500px] h-[500px]" style={{ bottom: '10%', left: '-10%' }} />
        <div className="orb orb-pink w-[600px] h-[600px]" style={{ top: '40%', right: '-15%' }} />
      </div>

      {/* ── DOT GRID ── */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-0 opacity-40" />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full flex flex-col items-center">

          {/* Live badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[rgba(180,92,202,0.25)] bg-[rgba(180,92,202,0.06)] mb-10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-dot" />
            <span className="text-xs font-mono text-[#C4B8D8] tracking-widest uppercase">
              Neural Marketplace — {stats?.activeAgents ?? 0} Agents Online
            </span>
          </motion.div> */}

          {/* Hero heading */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black leading-none tracking-tighter text-[clamp(3rem,8vw,7rem)]"
            >
              <span className="block text-[#F5F0FF]">Deploy &</span>
              <span className="block gradient-text-purple">Monetize</span>
              <span className="block text-[#F5F0FF]">AI Agents</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-2xl text-[#8B7FA0] text-lg leading-relaxed mb-12 font-light"
          >
            The decentralized platform for listing, discovering, and executing autonomous AI agents.
            Get paid per execution, maintain full ownership, and tap into a growing developer community.
          </motion.p>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-20"
          >
            <Link to="/marketplace">
              <button className="btn-glow px-8 py-3.5 rounded-xl inline-flex items-center gap-3 text-sm font-semibold tracking-tight">
                <Rocket size={16} />
                Explore Agents
                <ArrowRight size={14} />
              </button>
            </Link>
            <Link to="/deploy">
              <button className="btn-outline-glow px-8 py-3.5 rounded-xl inline-flex items-center gap-3 text-sm font-semibold tracking-tight">
                <Code2 size={16} />
                Deploy Your Agent
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-16"
          >
            {STAT_ITEMS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="font-display font-bold text-2xl sm:text-3xl text-[#F5F0FF] tracking-tighter mb-1">
                  {typeof s.value === 'number'
                    ? <Counter value={s.value} suffix={s.suffix} />
                    : <>{s.value}{s.suffix}</>
                  }
                </div>
                <div className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={16} className="text-[#5A4E70]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative z-10 py-8 border-y border-[rgba(180,92,202,0.08)] overflow-hidden bg-[rgba(17,13,30,0.4)] backdrop-blur-sm">
        <div className="flex">
          <div className="marquee-track">
            {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((item, i) => (
              <span key={i} className="mx-8 text-xs font-mono tracking-widest text-[#5A4E70] uppercase flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-[rgba(180,92,202,0.4)]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHO WE ARE — 0G-style numbered section
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="mb-20">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              <div className="lg:w-1/2">
                <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase block mb-6">Who We Are</span>
                <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter text-[#F5F0FF] mb-8">
                  The Agent<br />
                  <span className="gradient-text-purple">Economy</span><br />
                  Infrastructure.
                </h2>
                <p className="text-[#8B7FA0] text-base leading-relaxed max-w-md font-light">
                  Agentra provides verifiable agent execution, trustless payments, and decentralized
                  storage — built for autonomous AI systems that need to scale.
                </p>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 gap-4">
                {[
                  { num: '01', title: 'Infinitely Scalable', desc: 'Limitless scalability, enabling AI agents to grow without performance limits.' },
                  { num: '02', title: 'Fully Verifiable', desc: 'Execution runs with complete transparency, security, and on-chain verifiability.' },
                  { num: '03', title: 'Seamlessly Composable', desc: 'Effortless integration allows developers to create, connect and scale AI-driven workflows.' },
                ].map((item, i) => (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card-landing rounded-2xl p-6 flex gap-5"
                  >
                    <span className="num-badge mt-0.5">{item.num}</span>
                    <div>
                      <h3 className="font-display font-bold text-[#F5F0FF] text-base mb-1.5">{item.title}</h3>
                      <p className="text-[#8B7FA0] text-sm leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-20">
            <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase block mb-6">Platform Capabilities</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter">
              <span className="text-[#F5F0FF]">Built for the</span><br />
              <span className="gradient-text-purple">Agent Economy</span>
            </h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(180,92,202,0.08)] rounded-2xl overflow-hidden border border-[rgba(180,92,202,0.08)]">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#0A0812] p-8 group hover:bg-[rgba(17,13,30,0.9)] transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(180,92,202,0.1)] border border-[rgba(180,92,202,0.2)] flex items-center justify-center group-hover:border-[rgba(180,92,202,0.4)] transition-colors">
                      <Icon size={18} className="text-[#B45CCA]" />
                    </div>
                    <span className="text-xs font-mono text-[#5A4E70]">{f.num}</span>
                  </div>
                  <h3 className="font-display font-bold text-[#F5F0FF] text-base mb-3 group-hover:gradient-text-purple transition-all">{f.title}</h3>
                  <p className="text-[#8B7FA0] text-sm leading-relaxed font-light">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-20">
            <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase block mb-6">How It Works</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter">
              <span className="text-[#F5F0FF]">From Code to</span><br />
              <span className="gradient-text-purple">Revenue</span>
              <span className="text-[#F5F0FF]"> in Minutes</span>
            </h2>
          </Section>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute left-[28px] top-10 bottom-10 w-px bg-gradient-to-b from-[rgba(180,92,202,0.5)] via-[rgba(180,92,202,0.2)] to-transparent" />

            <div className="space-y-6">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.num}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-8 items-start group"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-[rgba(180,92,202,0.08)] border border-[rgba(180,92,202,0.2)] flex items-center justify-center group-hover:border-[rgba(180,92,202,0.5)] group-hover:bg-[rgba(180,92,202,0.12)] transition-all duration-300">
                        <Icon size={22} className="text-[#B45CCA]" />
                      </div>
                    </div>
                    <div className="glass-card-landing rounded-2xl p-6 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-mono text-[#5A4E70]">{s.num}</span>
                        <h3 className="font-display font-bold text-[#F5F0FF] text-base">{s.title}</h3>
                      </div>
                      <p className="text-[#8B7FA0] text-sm leading-relaxed font-light">{s.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <Section delay={0.4} className="text-center mt-16">
            <Link to="/deploy">
              <button className="btn-glow px-10 py-4 rounded-xl inline-flex items-center gap-3 text-sm font-semibold tracking-tight">
                <Upload size={16} />
                Start Deploying
                <ArrowRight size={14} />
              </button>
            </Link>
          </Section>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MODULAR STACK (inspired by 0G)
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-20">
            <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase block mb-6">The Agentra Stack</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter">
              <span className="text-[#F5F0FF]">Modular Stack for</span><br />
              <span className="gradient-text-purple">AI Agents</span>
            </h2>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Network, title: 'Agent Registry', desc: 'Decentralized hub for AI agents and services, fueling an open and trustless AI economy.', color: '#B45CCA' },
              { icon: Shield, title: 'Access Control', desc: 'Smart-contract-enforced access with monthly and lifetime subscription models.', color: '#34D399' },
              { icon: Database, title: '0G Storage', desc: 'Decentralized, AI-optimized storage with ultra-low costs and verifiable permanence.', color: '#93C5FD' },
              { icon: Zap, title: 'MCP Execution', desc: 'Standardized execution layer that routes tasks to the right agent endpoint instantly.', color: '#FBBF24' },
              { icon: BarChart3, title: 'Analytics Engine', desc: 'Real-time metrics on executions, revenue, and performance across all deployed agents.', color: '#D946EF' },
              { icon: Layers, title: 'Agent Comms', desc: 'Native agent-to-agent communication protocol with automatic fee distribution.', color: '#B45CCA' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card-landing rounded-2xl p-6 relative overflow-hidden group cursor-default"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}08, transparent 70%)` }}
                  />
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 border"
                      style={{
                        background: `${item.color}12`,
                        borderColor: `${item.color}25`,
                      }}
                    >
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <h3 className="font-display font-bold text-[#F5F0FF] text-base mb-2">{item.title}</h3>
                    <p className="text-[#8B7FA0] text-sm leading-relaxed font-light">{item.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Section>
            <div className="relative rounded-3xl overflow-hidden border border-[rgba(180,92,202,0.2)] bg-[rgba(17,13,30,0.8)] backdrop-blur-sm p-12 sm:p-20 text-center">
              {/* Inner glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(180,92,202,0.2) 0%, transparent 70%)' }} />
              <div className="dot-grid absolute inset-0 opacity-30" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(180,92,202,0.12)] border border-[rgba(180,92,202,0.3)] flex items-center justify-center mx-auto mb-8">
                  <Cpu size={28} className="text-[#B45CCA]" />
                </div>
                <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter mb-6">
                  <span className="text-[#F5F0FF]">Ready to</span><br />
                  <span className="gradient-text-purple">Launch?</span>
                </h2>
                <p className="text-[#8B7FA0] text-base max-w-lg mx-auto mb-10 font-light">
                  Join developers already earning from their AI agents on Agentra.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/marketplace">
                    <button className="btn-glow px-8 py-4 rounded-xl inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight">
                      Explore Marketplace
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                  <Link to="/deploy">
                    <button className="btn-outline-glow px-8 py-4 rounded-xl inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight">
                      Deploy Agent
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[rgba(180,92,202,0.08)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[rgba(180,92,202,0.15)] border border-[rgba(180,92,202,0.3)] flex items-center justify-center">
              <Cpu size={15} className="text-[#B45CCA]" />
            </div>
            <div>
              <div className="font-display font-black text-sm text-[#F5F0FF] tracking-tight">AGENTRA</div>
              <div className="text-xs text-[#5A4E70] font-mono tracking-widest uppercase">Neural Marketplace</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {['MARKETPLACE', 'DEPLOY', 'LEADERBOARD'].map(link => (
              <Link
                key={link}
                to={`/${link.toLowerCase()}`}
                className="text-[#5A4E70] hover:text-[#8B7FA0] text-xs font-mono tracking-widest transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>

          <div className="text-[#5A4E70] text-xs font-mono tracking-widest">© 2026 AGENTRA</div>
        </div>
      </footer>
    </div>
  )
}