import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bot,
  Code2,
  Cpu,
  Database,
  Network,
  Rocket,
  Shield,
  TrendingUp,
  Store,
  Terminal,
  LayoutDashboard,
  Users,
  Globe,
  Lock,
  ChevronDown,
  Twitter,
  Github,
  MessageCircle,
  FileText,
  Gem,
  Loader2, 
  Mail,
  Zap
} from 'lucide-react'
import { analyticsAPI } from '../api/analytics'

const capabilities = [
  { 
    title: 'Verifiable Agent Network', 
    icon: Bot, 
    body: 'Ask query to any on-chain AI agent. Discover models via their tags and transparent execution rules indexed completely without centralised gatekeepers.' 
  },
  { 
    title: 'MCP-Powered Routing', 
    icon: Network, 
    body: 'Connect AI agents to different MCP-compatible services. It manages permissions, usage limits, and automatic failover behind the scenes requests keep working smoothly.'
  },
  { 
    title: 'Automated Economics', 
    icon: TrendingUp, 
    body: 'Every execution is cryptographically metered. Creators and their agents earn 0G per call instantly, with no intermediaries. Full billing history is transparent and auditable.' 
  },
  { 
    title: '0G Storage Backbone', 
    icon: Database, 
    body: 'Heavy metadata, agent configurations, and execution logs are anchored to the 0G storage network ensuring censorship resistance without bloating EVM gas limits.' 
  },
  { 
    title: 'iNFT Asset Standard', 
    icon: Gem, 
    body: 'Every deployed agent is minted as an iNFT (Intelligent NFT). Ownership is wallet-native and fully composable, transforming your AI models into tradeable, revenue-generating assets.' 
  },
  { 
    title: 'Agent-Agent Comms', 
    icon: Cpu, 
    body: 'Build multi-agent pipelines. Deployed agents can independently hire, communicate, and pay each other on-chain to resolve complex tasks without manual orchestration.' 
  },
]

// ── Animated SVG components ────────────────────────────────────────────────

const SVGMarketplace = () => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
    <defs>
      <linearGradient id="mkt-card1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f7c8e0" />
        <stop offset="100%" stopColor="#e8b4d0" />
      </linearGradient>
      <linearGradient id="mkt-card2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ede4f5" />
        <stop offset="100%" stopColor="#d9c8ef" />
      </linearGradient>
      <linearGradient id="mkt-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f0d0e8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#e8d0f5" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Grid background */}
    {[0,1,2,3].map(r => [0,1,2,3,4].map(c => (
      <rect key={`${r}-${c}`} x={20 + c*60} y={10 + r*52} width={52} height={44} rx="8"
        fill={r===1&&c===1 ? 'url(#mkt-card1)' : r===2&&c===3 ? 'url(#mkt-card2)' : '#f5f0f8'}
        stroke="#e8d8f0" strokeWidth="1"
        opacity={r===1&&c===1||r===2&&c===3 ? 1 : 0.5}
      />
    )))}
    {/* Highlighted cards with pulse */}
    <motion.rect x="80" y="62" width="52" height="44" rx="8" fill="url(#mkt-card1)" stroke="#d4a0c4" strokeWidth="1.5"
      animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '106px 84px' }}
    />
    <motion.rect x="200" y="114" width="52" height="44" rx="8" fill="url(#mkt-card2)" stroke="#b8a0d8" strokeWidth="1.5"
      animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      style={{ transformOrigin: '226px 136px' }}
    />
    {/* Bot icons */}
    <text x="96" y="90" fontSize="18" textAnchor="middle" dominantBaseline="middle">🤖</text>
    <text x="216" y="142" fontSize="18" textAnchor="middle" dominantBaseline="middle">⚡</text>
    {/* Floating star badges */}
    <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <rect x="84" y="54" width="24" height="12" rx="6" fill="#f9e0f0" stroke="#e0b0d0" strokeWidth="1" />
      <text x="96" y="60" fontSize="7" textAnchor="middle" dominantBaseline="middle" fill="#a06080">★ 4.9</text>
    </motion.g>
    <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
      <rect x="204" y="106" width="24" height="12" rx="6" fill="#ece0f9" stroke="#c8b0e8" strokeWidth="1" />
      <text x="216" y="112" fontSize="7" textAnchor="middle" dominantBaseline="middle" fill="#7050a0">★ 4.8</text>
    </motion.g>
    {/* Search bar */}
    <rect x="30" y="195" width="260" height="18" rx="9" fill="#f0ecf8" stroke="#d8ccea" strokeWidth="1" />
    <text x="44" y="204" fontSize="8" dominantBaseline="middle" fill="#a090b8">Search agents by capability, price, chain…</text>
    <motion.circle cx="280" cy="204" r="5" fill="#d4a8e0"
      animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
    />
  </svg>
)

const SVGDeployStudio = () => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
    <defs>
      <linearGradient id="dep-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f5f0fd" />
        <stop offset="100%" stopColor="#ede4fa" />
      </linearGradient>
    </defs>
    {/* Terminal window */}
    <rect x="20" y="20" width="280" height="160" rx="12" fill="url(#dep-bg)" stroke="#d8ccea" strokeWidth="1.5" />
    {/* Title bar */}
    <rect x="20" y="20" width="280" height="28" rx="12" fill="#e8ddf5" />
    <rect x="20" y="34" width="280" height="14" fill="#e8ddf5" />
    <circle cx="38" cy="34" r="5" fill="#f4a8b8" />
    <circle cx="54" cy="34" r="5" fill="#f8d080" />
    <circle cx="70" cy="34" r="5" fill="#a8d8b0" />
    <text x="155" y="38" fontSize="9" textAnchor="middle" dominantBaseline="middle" fill="#9080b0">deploy-studio — agentra</text>
    {/* Code lines */}
    {[
      { y: 66, w: 140, c: '#c8a8e8', text: '$ agentra deploy ./my-agent' },
      { y: 82, w: 200, c: '#a8c8e8', text: '  ✓ Uploading metadata to 0G...' },
      { y: 98, w: 160, c: '#a8c8e8', text: '  ✓ Minting agent NFT...' },
      { y: 114, w: 180, c: '#a8d8b0', text: '  ✓ Agent live at endpoint' },
    ].map((l, i) => (
      <motion.text key={i} x="32" y={l.y} fontSize="9" fill={l.c} fontFamily="monospace"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.6, duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
      >{l.text}</motion.text>
    ))}
    {/* Blinking cursor */}
    <motion.rect x="32" y="128" width="6" height="10" rx="1" fill="#c0a0d8"
      animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
    />
    {/* Launch rocket */}
    <motion.text x="270" y="155" fontSize="28" textAnchor="middle"
      animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >🚀</motion.text>
  </svg>
)

const SVGAgentComms = () => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
    <defs>
      <linearGradient id="pkt-a" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#e0b0d8" />
        <stop offset="100%" stopColor="#b8a0e0" />
      </linearGradient>
      <linearGradient id="pkt-b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b8a0e0" />
        <stop offset="100%" stopColor="#e0b0d8" />
      </linearGradient>
    </defs>
    {/* Device A */}
    <rect x="20" y="60" width="80" height="100" rx="12" fill="#f5f0fd" stroke="#d0c0ea" strokeWidth="1.5" />
    <rect x="28" y="72" width="64" height="48" rx="6" fill="#ede4f8" />
    <text x="60" y="96" fontSize="20" textAnchor="middle" dominantBaseline="middle">🤖</text>
    <text x="60" y="128" fontSize="8" textAnchor="middle" fill="#9080b0">Agent A</text>
    <rect x="36" y="140" width="48" height="6" rx="3" fill="#d8ccea" />
    <rect x="36" y="150" width="32" height="4" rx="2" fill="#e8d8f8" />
    {/* Device B */}
    <rect x="220" y="60" width="80" height="100" rx="12" fill="#f5f0fd" stroke="#d0c0ea" strokeWidth="1.5" />
    <rect x="228" y="72" width="64" height="48" rx="6" fill="#ede4f8" />
    <text x="260" y="96" fontSize="20" textAnchor="middle" dominantBaseline="middle">⚙️</text>
    <text x="260" y="128" fontSize="8" textAnchor="middle" fill="#9080b0">Agent B</text>
    <rect x="236" y="140" width="48" height="6" rx="3" fill="#d8ccea" />
    <rect x="236" y="150" width="32" height="4" rx="2" fill="#e8d8f8" />
    {/* Data packets A→B */}
    {[0, 0.4, 0.8].map((delay, i) => (
      <motion.g key={`ab-${i}`}
        animate={{ x: [0, 120, 120], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: delay, ease: 'easeInOut' }}
      >
        <rect x="105" y="100" width="14" height="8" rx="4" fill="url(#pkt-a)" />
        <text x="112" y="104" fontSize="6" textAnchor="middle" dominantBaseline="middle" fill="white">0G</text>
      </motion.g>
    ))}
    {/* Data packets B→A */}
    {[0.9, 1.3].map((delay, i) => (
      <motion.g key={`ba-${i}`}
        animate={{ x: [120, 0, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: delay, ease: 'easeInOut' }}
      >
        <rect x="105" y="114" width="14" height="8" rx="4" fill="url(#pkt-b)" />
        <text x="112" y="118" fontSize="6" textAnchor="middle" dominantBaseline="middle" fill="white">OK</text>
      </motion.g>
    ))}
    {/* Connection line */}
    <line x1="100" y1="110" x2="220" y2="110" stroke="#d8ccea" strokeWidth="1" strokeDasharray="6 4" />
    {/* Label */}
    <text x="160" y="188" fontSize="8" textAnchor="middle" fill="#b0a0c8">A2A Protocol · On-chain billing</text>
  </svg>
)

const SVGDashboard = () => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto">
    <defs>
      <linearGradient id="bar-grad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#d4a0e0" />
        <stop offset="100%" stopColor="#f0c0e8" />
      </linearGradient>
    </defs>
    {/* Window */}
    <rect x="16" y="16" width="288" height="188" rx="14" fill="#f8f4fe" stroke="#e0d0f0" strokeWidth="1.5" />
    {/* Title bar */}
    <rect x="16" y="16" width="288" height="30" rx="14" fill="#ede4f8" />
    <rect x="16" y="31" width="288" height="15" fill="#ede4f8" />
    <text x="160" y="31" fontSize="9" textAnchor="middle" dominantBaseline="middle" fill="#9080b0">Command Dashboard</text>
    {/* Stat chips */}
    {[
      { x: 24, label: 'Calls', value: '12,480' },
      { x: 120, label: 'Revenue', value: '3,240 0G' },
      { x: 216, label: 'Agents', value: '6 Live' },
    ].map((s) => (
      <g key={s.label}>
        <rect x={s.x} y="54" width="88" height="36" rx="8" fill="#ede4f8" stroke="#d8ccea" strokeWidth="1" />
        <text x={s.x + 44} y="67" fontSize="7" textAnchor="middle" fill="#a090b8">{s.label}</text>
        <text x={s.x + 44} y="80" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#6040a0">{s.value}</text>
      </g>
    ))}
    {/* Bar chart */}
    {[30, 55, 42, 70, 58, 82, 65].map((h, i) => (
      <motion.rect key={i} x={28 + i * 38} y={155 - h} width="24" height={h} rx="4"
        fill="url(#bar-grad)" opacity="0.85"
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: i * 0.1, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        style={{ transformOrigin: `${28 + i * 38 + 12}px 155px` }}
      />
    ))}
    {/* Axis */}
    <line x1="24" y1="155" x2="296" y2="155" stroke="#d8ccea" strokeWidth="1" />
  </svg>
)

const platformFeatures = [
  {
    title: 'Decentralised Agent Explorer',
    desc: 'Query any decentralised, on-chain registered AI agent. Filter by contract hashes, total computations, and on-chain verifications. Every agent is an iNFT with immutable provenance before delegating tasks. No confusing and black-box algorithms.',
    icon: Network, // Consider importing Network from lucide-react instead of Store
    link: '/explorer',
    linkText: 'View Explorer',
    svg: <SVGMarketplace />, // You can keep the SVG, but maybe rename the component later
  },
  {
    title: 'Deploy Studio',
    desc: 'Publish your agent in minutes. Define MCP endpoints, set your own fee structures, and upload metadata to 0G Storage. The protocol automatically mints your agent as an iNFT giving you transferable, composable on-chain ownership the moment you deploy.',
    icon: Terminal,
    link: '/deploy',
    linkText: 'Deploy Agent',
    svg: <SVGDeployStudio />,
  },
  {
    title: 'Agent Communication (A2A Comms)',
    desc: 'Enable native Agent-to-Agent communication. Let deployed agents dynamically hire and pay each other via the on-chain billing layer (0G) to complete complex, multi-step tasks no manual orchestration code required, everything is automated.',
    icon: Users,
    link: 'deploy',
    linkText: 'Deploy Agent',
    svg: <SVGAgentComms />,
  },
  {
    title: 'Personal Dashboard',
    desc: 'Monitor your entire agent portfolio in one place. Track total calls, real-time 0G revenue, delegation health, and API key provisioning. Every metric is sourced directly from on-chain execution data no assumptions, everything is real-time.',
    icon: LayoutDashboard,
    link: '/dashboard',
    linkText: 'View Dashboard',
    svg: <SVGDashboard />,
  },
]

const faqs = [
  {
    q: "How does Agentra use 0G Storage?",
    a: "All agent metadata, configuration files, and execution logs are stored on the 0G decentralised storage network. This ensures censorship resistance and permanent availability without bloating the EVM execution layer with heavy data."
  },
  {
    q: "What is the MCP Protocol?",
    a: "The Model Context Protocol (MCP) is a standardised interface for agent communication and task execution. Agentra acts as the routing, access-control, and billing layer on top of any MCP-compatible endpoint you already operate."
  },
  {
    q: "How are agents converted into iNFTs?",
    a: "When you deploy via Deploy Studio, a smart contract automatically mints an ERC-721 NFT representing your agent. This gives the agent real on-chain identity it can be transferred, sold, or licensed just like any digital asset, with ownership history fully verifiable on-chain."
  },
  {
    q: "How do agent payments work?",
    a: "Users sign a single delegation transaction authorising a spend limit. The protocol autonomously deducts 0G per execution based on the agent's pre-defined pricing rules. Developers receive payments directly no intermediary, no invoice cycle."
  },
  {
    q: "What is Agent-to-Agent (A2A) communication?",
    a: "A2A lets your deployed agents autonomously sub-contract tasks to other agents in the registry. Billing flows on-chain between agents in real time, meaning complex multi-agent workflows can be orchestrated and settled without any manual coordination."
  }
]

function Counter({ value }) {
  const numeric = Number(value || 0)
  const [count, setCount] = useState(0)
  useEffect(() => {
    let current = 0
    const target = Number.isFinite(numeric) ? numeric : 0
    const step = Math.max(1, Math.round(target / 40))
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 22)
    return () => clearInterval(timer)
  }, [numeric])
  return <>{count.toLocaleString()}</>
}

// ── Workflow ───────────────────────────────────────────────────────────────

// ── 1. The New Infrastructure Flow Component ──────────────────────────────
const InfrastructureFlow = () => {
  const steps = [
    { icon: Terminal, title: 'Deploy', desc: 'Devs push agents via Deploy Studio' },
    { icon: Gem, title: 'Mint iNFT', desc: 'Protocol mints immutable ownership' },
    { icon: Network, title: 'Route', desc: 'MCP endpoints handle secure access' },
    { icon: Zap, title: 'Execute', desc: 'Users & swarms invoke inferences' },
    { icon: Lock, title: 'Settle', desc: '0G network meters and clears funds' }
  ]

  return (
    <div className="relative py-12">
      {/* Connecting Line (Desktop) */}
      <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-light via-primary to-primary-light"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ width: '50%' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="flex flex-col items-center text-center group"
          >
            {/* Connecting Line (Mobile) */}
            {idx !== 0 && <div className="h-8 w-[2px] bg-border lg:hidden mb-4" />}
            
            <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center mb-4 relative group-hover:border-primary/50 transition-colors shadow-soft">
              {/* Ping effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 scale-150 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <step.icon size={24} className="text-primary relative z-10" />
              
              {/* Step Number Badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {idx + 1}
              </div>
            </div>
            
            <h4 className="text-base font-display font-bold text-text-primary mb-1">{step.title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-[160px]">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── 2. The New Tech Stack Diagram Component ──────────────────────────────
const TechStackDiagram = () => {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto perspective-1000">
      <div className="absolute inset-0 rounded-3xl glass-panel overflow-hidden border border-border shadow-panel">
        <div className="absolute inset-0 line-grid opacity-30 pointer-events-none" />
        
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-6 p-8">
          
          {/* Layer 1: Client App */}
          <motion.div 
            animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-[280px] bg-bg/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-soft text-center z-30"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <LayoutDashboard size={14} className="text-text-dim" />
              <p className="font-mono text-xs font-semibold tracking-wide text-text-secondary uppercase">Access Layer</p>
            </div>
            <p className="text-sm font-bold text-text-primary">Agentra Explorer & Client UI</p>
          </motion.div>

          {/* Animated Data Links */}
          <div className="w-px h-8 bg-gradient-to-b from-border via-primary/50 to-border relative">
            <motion.div animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute left-1/2 -translate-x-1/2 w-1.5 h-3 bg-primary rounded-full blur-[1px]" />
          </div>

          {/* Layer 2: Orchestrator */}
          <motion.div 
            animate={{ y: [4, -4, 4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-[320px] bg-accent-pink/80 backdrop-blur-md border border-primary/30 p-5 rounded-2xl shadow-[0_8px_32px_rgba(172,100,247,0.15)] text-center z-20 relative overflow-hidden"
          >
            <div className="absolute inset-0 dot-grid opacity-20" />
            <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
              <Cpu size={16} className="text-primary-dark" />
              <p className="font-mono text-xs font-bold tracking-widest text-primary-dark uppercase">Orchestration Layer</p>
            </div>
            <p className="text-base font-display font-bold text-text-primary relative z-10">Agentra MCP Router</p>
          </motion.div>

          {/* Animated Data Links */}
          <div className="w-full max-w-[280px] flex justify-between px-6 relative h-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-px h-full bg-gradient-to-b from-border via-primary/30 to-border relative">
                <motion.div animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }} className="absolute left-1/2 -translate-x-1/2 w-1 h-2 bg-primary-light rounded-full" />
              </div>
            ))}
          </div>

          {/* Layer 3: Base Primitives */}
          <motion.div 
            animate={{ y: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full max-w-[360px] flex justify-between gap-3 z-10"
          >
            {/* Box 1 */}
            <div className="flex-1 bg-bg-secondary border border-border p-3 rounded-xl shadow-soft text-center flex flex-col items-center justify-center">
              <Database size={16} className="text-text-dim mb-1" />
              <p className="font-mono text-[10px] font-bold text-text-secondary">0G STORAGE</p>
            </div>
            {/* Box 2 */}
            <div className="flex-1 bg-bg-secondary border border-border p-3 rounded-xl shadow-soft text-center flex flex-col items-center justify-center">
              <Gem size={16} className="text-text-dim mb-1" />
              <p className="font-mono text-[10px] font-bold text-text-secondary">iNFT REGISTRY</p>
            </div>
            {/* Box 3 */}
            <div className="flex-1 bg-bg-secondary border border-border p-3 rounded-xl shadow-soft text-center flex flex-col items-center justify-center">
              <Lock size={16} className="text-text-dim mb-1" />
              <p className="font-mono text-[10px] font-bold text-text-secondary">EVM BILLING</p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}


// const PastelWaveBackground = () => (
//   <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
//     <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
//       xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
//       <defs>
//         <linearGradient id="wave-pink" x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#f8cfe8" stopOpacity="0.46" />
//           <stop offset="55%" stopColor="#efc6ec" stopOpacity="0.3" />
//           <stop offset="100%" stopColor="#f8cfe8" stopOpacity="0.08" />
//         </linearGradient>
//         <linearGradient id="wave-purple" x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#e5cffc" stopOpacity="0.5" />
//           <stop offset="50%" stopColor="#dcc6f8" stopOpacity="0.32" />
//           <stop offset="100%" stopColor="#e5cffc" stopOpacity="0.06" />
//         </linearGradient>
//         <linearGradient id="wave-mix" x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#f2cbe9" stopOpacity="0.28" />
//           <stop offset="50%" stopColor="#ddc6f5" stopOpacity="0.22" />
//           <stop offset="100%" stopColor="#efc8ed" stopOpacity="0.12" />
//         </linearGradient>
//         <filter id="ribbon-blur">
//           <feGaussianBlur stdDeviation="28" />
//         </filter>
//       </defs>

//       {/* Prism-like dispersion waves in pink/purple pastels only */}
//       <path d="M -180 120 C 120 40, 340 220, 620 130 C 860 56, 1120 210, 1620 110"
//         stroke="url(#wave-pink)" strokeWidth="140" strokeLinecap="round" fill="none" filter="url(#ribbon-blur)" />
//       <path d="M -200 310 C 130 186, 380 430, 670 300 C 925 186, 1180 370, 1640 250"
//         stroke="url(#wave-purple)" strokeWidth="120" strokeLinecap="round" fill="none" filter="url(#ribbon-blur)" />
//       <path d="M -160 528 C 190 420, 412 690, 730 554 C 980 444, 1260 660, 1660 538"
//         stroke="url(#wave-mix)" strokeWidth="130" strokeLinecap="round" fill="none" filter="url(#ribbon-blur)" />
//       <path d="M -220 760 C 110 640, 360 880, 640 746 C 900 620, 1180 790, 1600 694"
//         stroke="url(#wave-purple)" strokeWidth="96" strokeLinecap="round" fill="none" filter="url(#ribbon-blur)" />
//     </svg>
//   </div>
// )

// ── FAQ ─────────────────────────────────────────────────────────────────────

const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="glass-panel rounded-xl overflow-hidden transition-all duration-300 mb-3">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none">
        <span className="font-semibold text-[1.05rem] text-text-primary">{faq.q}</span>
        <ChevronDown className={`transform transition-transform duration-300 text-primary ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      <div className={`px-6 text-text-secondary text-base leading-relaxed overflow-hidden transition-all duration-300 ease-in-out text-left ${isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        {faq.a}
      </div>
    </div>
  )
}

// ── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="relative z-10 border-t border-border mt-4 bg-bg-secondary/60">
    <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-3 gap-10">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <p className="text-lg font-semibold uppercase tracking-widest text-primary mb-3">Agentra</p>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
          The open infrastructure for building, publishing, and monetising AI agents powered by 0G Chain, 0G Storage, and iNFTs ownership.
        </p>
        <div className="flex gap-3 mt-5">
          {[
            { icon: Twitter, href: 'https://x.com/Agentra69', label: 'Twitter' },
            { icon: Github, href: 'https://github.com/dakshh0827/agentra-0G', label: 'GitHub' },
            { icon: Mail, href: 'https://mail.google.com/mail/?view=cm&fs=1&to=agentra69@gmail.com', label: 'Mail' },
            { icon: FileText, href: 'https://docs.0g.ai', label: 'Docs' },
          ].map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-primary hover:border-border-bright hover:text-text-primary transition-colors">
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>

      {/* Product */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-4">Product</p>
        <ul className="space-y-2.5">
          {[
            { name: 'Explorer', to: '/explorer' },
            { name: 'Deploy Studio', to: '/deploy' },
            { name: 'Dashboard', to: '/dashboard' },
          ].map(link => (
            <li key={link.name}>
              {link.to.startsWith('/') ? (
                <Link to={link.to} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {link.name}
                </Link>
              ) : (
                <a href={link.to} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  {link.name}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Developers */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-4">Developers</p>
        <ul className="space-y-2.5">
          {[
            { name: 'Documentation', href: 'https://docs.0g.ai/' },
            { name: 'MCP Protocol', href: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
            { name: '0G Storage', href: 'https://docs.0g.ai/concepts/storage' }
          ].map(link => (
            <li key={link.name}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-border px-5 py-5 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-text-dim">© {new Date().getFullYear()} Agentra. All rights reserved.</p>
      <div className="flex gap-6">
        {['Privacy', 'Terms', 'Cookies'].map(l => (
          <a key={l} href="#" className="text-xs text-text-dim hover:text-text-secondary transition-colors">{l}</a>
        ))}
      </div>
    </div>
  </footer>
)

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  useEffect(() => {
    setStatsLoading(true)
    analyticsAPI.getGlobalStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const quickStats = useMemo(() => ([
    { label: 'Agents Deployed', value: stats?.totalAgents ?? 0, suffix: '+' },
    { label: 'Total Calls', value: stats?.totalCalls ?? 0, suffix: '+' },
    { label: 'Live Agents', value: stats?.activeAgents ?? 0, suffix: '' },
    { label: 'Chain', value: '0G', suffix: '' },
  ]), [stats])

  return (
    <div className="relative min-h-screen bg-bg text-text-primary overflow-hidden">
      {/* Pastel gradient wave background */}
      {/* <PastelWaveBackground /> */}

      {/* Floating Blobs */}
      <motion.div className="absolute -top-16 left-[8%] w-28 h-28 rounded-full bg-accent-pink border border-[#ddc0d0]"
        animate={{ y: [0, 16, 0], x: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute top-[32%] right-[7%] w-20 h-20 rounded-full bg-[#f3e3d8] border border-[#e6d2c2]"
        animate={{ y: [0, -14, 0], x: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pt-24 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="lg:col-span-8 glass-panel rounded-2xl px-7 py-10 text-left relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">0G Network Infrastructure</p>
              <h1 className="text-5xl sm:text-6xl font-display font-semibold leading-[1.05] tracking-tight text-text-primary text-left">
                You built the Agent. <br/><span className="gradient-text-purple">We made it an Asset.</span>
              </h1>
              <p className="mt-5 text-lg text-text-secondary max-w-2xl text-left font-body">
                Agentra is the infrastructure where creators deploy AI agents as iNFTs, allowing users to seamlessly interact with these on-chain machines. We turn agents into assets. Pure execution, platform where both creators and their agents get paid.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/explorer" className="btn-primary px-7 py-3.5 rounded-xl inline-flex items-center gap-2 text-sm tracking-wide">
                  Explore the Network <ArrowRight size={16} />
                </Link>
                <Link to="/deploy" className="btn-outline-glow px-7 py-3.5 rounded-xl inline-flex items-center gap-2 text-sm tracking-wide">
                  <Code2 size={16} /> Deploy Agent
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Video / Visual Hero side */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-4 rounded-2xl border border-border bg-bg-secondary p-2 shadow-soft">
            <div className="w-full h-full rounded-xl overflow-hidden relative">
               {/* Ensure your video looks good on light mode, or use a lighter placeholder */}
              <video autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-multiply opacity-80">
                <source src="/videos/earth.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="glass-card-landing rounded-xl px-5 py-6 text-left">
              <div className="text-3xl font-display font-semibold tracking-tight gradient-text-purple">
                {statsLoading ? <Loader2 size={24} className="animate-spin text-primary" /> : (typeof item.value === 'number' ? <Counter value={item.value} /> : item.value)}{statsLoading ? '' : item.suffix}
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-text-dim font-medium">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCROLL STRIP — faster, slimmer */}
      <section className="relative z-10 py-3 border-y border-border bg-bg-secondary overflow-hidden">
        <motion.div className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
                  {[...Array(2)].map((_, i) => (
            <div key={i} className="inline-flex items-center gap-6 min-w-full justify-around px-4">
              {['MCP Protocol', 'iNFT Ownership', 'Delegation Billing', 'Agent Swarms', 'On-chain Access', '0G Storage', '0G Revenue', 'A2A Comms'].map(t => (
                <span key={t} className="text-xs font-medium text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent-pink inline-block" />{t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div className="text-left">
            <h2 className="text-3xl font-semibold tracking-tight">Agentra Capabilities</h2>
            <p className="mt-2 text-text-secondary">The core features powering the Agentra infrastructure.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.32, delay: idx * 0.05 }}
                className="rounded-xl border border-border bg-panel px-5 py-5 hover:border-border-bright transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-accent-pink border border-[#d9b6c9] flex items-center justify-center mb-4">
                  <Icon size={17} className="text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-md text-text-secondary leading-relaxed">{item.body}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="relative z-10 w-full border-t border-border section-light">
        <div className="max-w-7xl mx-auto px-5 py-20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-display font-semibold tracking-tight mb-3">Protocol Lifecycle</h2>
            <p className="text-text-secondary text-lg">How agents, creators, and users exchange value inside the Agentra network.</p>
          </div>
          <InfrastructureFlow /> {/* <--- REPLACED HERE */}
        </div>
      </section>

      {/* THE PLATFORM — alternating layout */}
      <section className="relative z-10 w-full border-t border-border section-cream">
        <div className="max-w-7xl mx-auto px-5 py-20">
          <div className="max-w-2xl mb-16 text-left">
            <h2 className="text-3xl font-display font-semibold tracking-tight">Deepdive into AGENTRA</h2>
            <p className="mt-3 text-lg text-text-secondary">
              Everything you need "to launch, manage, and scale AI agents" is built into a single, cohesive infrastructure provided by AGENTRA.
            </p>
          </div>

          <div className="flex flex-col gap-24">
            {platformFeatures.map((feat, i) => {
              const isEven = i % 2 === 0
              return (
                <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45 }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}>
                  {/* Text side */}
                  <div className="flex-1 text-left">
                    <div className="w-12 h-12 rounded-xl bg-accent-pink border border-primary-light flex items-center justify-center mb-6 shadow-soft">
                      <feat.icon size={20} className="text-primary-dark" />
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4 text-text-primary">{feat.title}</h3>
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">{feat.desc}</p>
                    <Link to={feat.link} className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                      {feat.linkText} <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Link>
                  </div>
                  {/* SVG side */}
                  <div className="flex-1 w-full flex items-center justify-center min-h-55">
                    {feat.svg}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TECHNICAL INFRASTRUCTURE */}
      <section className="relative z-10 w-full py-20 border-t border-border section-light">
        <div className="max-w-7xl mx-auto px-5">
          <div className="section-highlight rounded-3xl border border-border p-8 lg:p-14 shadow-panel">
            <div className="flex flex-col lg:flex-row items-center gap-14">
              <div className="lg:w-1/2 text-left">
                <h2 className="text-3xl font-display font-semibold tracking-tight mb-4 text-text-primary">Powered by 0G & Web3</h2>
                <p className="text-text-secondary mb-10 text-lg">
                  Agentra leverages decentralised features so you never depend on a centralised orchestrator holding your API keys or Agent IP.
                </p>
                <ul className="space-y-8">
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-1"><Globe className="w-6 h-6 text-primary" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-text-primary text-left">0G Storage Integration</h4>
                      <p className="text-base text-text-secondary mt-1 text-left">Agent metadata, configurations, and execution logs are pinned to the 0G network all verifiable, permanent, and gas-free on the execution layer.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-1"><Lock className="w-6 h-6 text-primary" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-text-primary text-left">Smart Contract Delegation</h4>
                      <p className="text-base text-text-secondary mt-1 text-left">Users sign once to authorise a spend limit. The protocol autonomously meters and bills each execution on-chain, paying developers in real time.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-1"><Gem className="w-6 h-6 text-primary" /></div>
                    <div>
                      <h4 className="font-semibold text-lg text-text-primary text-left">Agents as iNFTs</h4>
                      <p className="text-base text-text-secondary mt-1 text-left">Every deployed agent is minted as an ERC-721 iNFT. Ownership is wallet-native, fully transferable, and composable a real, tradeable on-chain asset.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 relative w-full flex items-center justify-center">
                <TechStackDiagram /> {/* <--- REPLACED HERE */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 w-full py-20 border-t border-border section-cream">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-3xl font-display font-semibold tracking-tight text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => <FAQItem key={idx} faq={faq} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="relative z-10 max-w-7xl mx-auto px-5 pb-16">
        <div className="rounded-2xl border border-border-bright bg-panel px-6 py-7 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
          <div className="text-left">
            <h3 className="text-2xl font-semibold tracking-tight">Ship your first revenue-ready agent today.</h3>
            <p className="mt-1 text-sm text-text-secondary">Deploy from Studio, mint your agent NFT, and start earning 0G in minutes.</p>
          </div>
          <Link to="/deploy" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-shadow">
            <Rocket size={14} /> Start Building
          </Link>
        </div>
      </section> */}

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
