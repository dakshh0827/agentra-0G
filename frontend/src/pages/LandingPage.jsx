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
  Loader2
} from 'lucide-react'
import { analyticsAPI } from '../api/analytics'

const capabilities = [
  { title: 'Agent Registry', icon: Bot, body: 'Publish and discover AI agents with verifiable on-chain metadata, capability tags, and transparent pricing rules — all indexed without a centralised database.' },
  { title: 'Execution Routing', icon: Network, body: 'Route inference requests across MCP-compatible endpoints with layered access control, rate limiting, and automatic failover built into the protocol.' },
  { title: 'On-chain Revenue', icon: TrendingUp, body: 'Every execution is metered on-chain. Developers earn 0G per call with no intermediary. Full billing history is publicly auditable at any time.' },
  { title: '0G Storage Backbone', icon: Database, body: 'Agent configurations, logs, and heavy metadata are pinned to the 0G storage network — permanent, censorship-resistant, and free from EVM gas bloat.' },
  { title: 'NFT Ownership Guard', icon: Gem, body: 'Every agent is minted as an NFT. Ownership is wallet-native, transferable, and composable — your agent is a real on-chain asset with verifiable provenance.' },
  { title: 'Composable Swarms', icon: Cpu, body: 'Build multi-agent pipelines where agents autonomously hire and pay each other via A2A communication — without writing orchestration logic from scratch.' },
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
    title: 'Global Agent Marketplace',
    desc: 'Browse a decentralised, on-chain registry of AI agents. Filter by capabilities, pricing tiers, and verifiable reputation. Every agent is an NFT — read immutable provenance before delegating tasks. No black-box listings.',
    icon: Store,
    link: '/marketplace',
    linkText: 'Explore Agents',
    svg: <SVGMarketplace />,
  },
  {
    title: 'Deploy Studio',
    desc: 'Publish your agent in minutes. Define MCP endpoints, set granular fee structures, and upload metadata to 0G Storage. The protocol automatically mints your agent as an NFT — giving you transferable, composable on-chain ownership the moment you deploy.',
    icon: Terminal,
    link: '/deploy',
    linkText: 'Launch Agent',
    svg: <SVGDeployStudio />,
  },
  {
    title: 'Agent Swarms (A2A Comms)',
    desc: 'Enable native Agent-to-Agent communication. Let deployed agents dynamically hire and pay each other via the on-chain billing layer (0G) to complete complex, multi-step tasks — no bespoke orchestration code required.',
    icon: Users,
    link: '#',
    linkText: 'Read Docs',
    svg: <SVGAgentComms />,
  },
  {
    title: 'Command Dashboard',
    desc: 'Monitor your entire agent portfolio in one place. Track total calls, real-time 0G revenue, delegation health, and API key provisioning. Every metric is sourced directly from on-chain execution data — no synthetic estimates.',
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
    q: "How are agents converted into NFTs?",
    a: "When you deploy via Deploy Studio, a smart contract automatically mints an ERC-721 NFT representing your agent. This gives the agent real on-chain identity — it can be transferred, sold, or licensed just like any digital asset, with ownership history fully verifiable on-chain."
  },
  {
    q: "How do agent payments work?",
    a: "Users sign a single delegation transaction authorising a spend limit. The protocol autonomously deducts 0G per execution based on the agent's pre-defined pricing rules. Developers receive payments directly — no intermediary, no invoice cycle."
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

const WorkflowStep = ({ x, y, emoji, label, sublabel, delay }) => (
  <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: 'backOut' }}
    style={{ transformOrigin: `${x}px ${y}px` }}>
    <circle cx={x} cy={y} r="72" fill="white" stroke="#e0c8f0" strokeWidth="1.5" />
    <motion.circle cx={x} cy={y} r="65" fill="#faf5ff" stroke="#d4b8ea" strokeWidth="1"
      animate={{ r: [65, 68, 65] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    />
    <text x={x} y={y - 22} fontSize="24" textAnchor="middle" dominantBaseline="middle">{emoji}</text>
    <text x={x} y={y + 8} fontSize="12" fontWeight="600" textAnchor="middle" dominantBaseline="middle" fill="#5a3a80">{label}</text>
    {sublabel && (
      <text x={x} y={y + 26} fontSize="10" textAnchor="middle" dominantBaseline="middle" fill="#9880b8">{sublabel}</text>
    )}
  </motion.g>
)

const WorkflowArrow = ({ x1, y1, x2, y2, label, delay, curved }) => {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const d = curved
    ? `M ${x1} ${y1} Q ${curved.cx} ${curved.cy} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`
  const lx = curved ? curved.cx : mx
  const ly = curved ? curved.cy - 12 : my - 12
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }}>
      <motion.path d={d} stroke="#d0b0e8" strokeWidth="1.5" fill="none"
        strokeDasharray="6 4" markerEnd="url(#wf-arrow)"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      {label && (
        <text x={lx} y={ly} fontSize="10" textAnchor="middle" fill="#a080c0" fontStyle="italic">{label}</text>
      )}
    </motion.g>
  )
}

const ImprovedWorkflow = () => (
  <div className="w-full overflow-x-auto py-6">
    <div style={{ minWidth: '900px' }}>
      <svg width="100%" viewBox="0 0 1240 580" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="wf-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#c0a0d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <linearGradient id="wf-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f2c9e7" />
            <stop offset="48%" stopColor="#dfc4f6" />
            <stop offset="100%" stopColor="#eec6ef" />
          </linearGradient>
          <linearGradient id="wf-glow-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#efc5e5" />
            <stop offset="100%" stopColor="#d8bff2" />
          </linearGradient>
        </defs>

        {/* Large flowing wave track */}
        <motion.path
          d="M 50 258 C 180 118, 345 406, 490 254 C 632 102, 812 414, 952 246 C 1065 118, 1160 222, 1200 264"
          stroke="url(#wf-wave)"
          strokeWidth="62"
          strokeOpacity="0.26"
          fill="none"
          strokeLinecap="round"
          animate={{ d: [
            'M 50 258 C 180 118, 345 406, 490 254 C 632 102, 812 414, 952 246 C 1065 118, 1160 222, 1200 264',
            'M 50 275 C 190 148, 338 388, 500 268 C 638 124, 804 396, 944 260 C 1063 138, 1156 232, 1200 282',
            'M 50 258 C 180 118, 345 406, 490 254 C 632 102, 812 414, 952 246 C 1065 118, 1160 222, 1200 264'
          ] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path
          d="M 50 258 C 180 118, 345 406, 490 254 C 632 102, 812 414, 952 246 C 1065 118, 1160 222, 1200 264"
          stroke="url(#wf-glow-line)"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Nodes — same wave positions, bigger circles, fixed text */}
        <WorkflowStep x={150} y={196} emoji="🏗️" label="Developers Deploy" sublabel="via Deploy Studio" delay={0} />
        <WorkflowStep x={370} y={354} emoji="🛒" label="Users Discover" sublabel="& purchase agents" delay={0.15} />
        <WorkflowStep x={620} y={188} emoji="⚡" label="Agents Execute" sublabel="tasks on demand" delay={0.3} />
        <WorkflowStep x={870} y={354} emoji="🔗" label="A2A Collaboration" sublabel="agents hire agents" delay={0.45} />
        <WorkflowStep x={1090} y={194} emoji="💰" label="0G Revenue" sublabel="flows on-chain" delay={0.6} />

        {/* Arrows — adjusted to match new node positions/sizes */}
        <WorkflowArrow x1={218} y1={238} x2={306} y2={312} label="listed as NFT" delay={0.8} curved={{ cx: 272, cy: 232 }} />
        <WorkflowArrow x1={432} y1={316} x2={556} y2={226} label="pay per call" delay={0.95} curved={{ cx: 500, cy: 336 }} />
        <WorkflowArrow x1={686} y1={228} x2={806} y2={312} label="sub-tasks delegated" delay={1.1} curved={{ cx: 750, cy: 204 }} />
        <WorkflowArrow x1={936} y1={312} x2={1022} y2={234} label="billing settled" delay={1.25} curved={{ cx: 992, cy: 348 }} />

        {/* Centre AGENTRA badge */}
        <motion.g animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }}
            style={{ transformOrigin: '620px 300px' }}>
            <circle cx="620" cy="300" r="74" fill="#faf4ff" stroke="#e0c8f0" strokeWidth="1.5" />
            <text x="620" y="292" fontSize="16" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fill="#6030a0">AGENTRA</text>
            <text x="620" y="314" fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="#a080c0">ECOSYSTEM</text>
        </motion.g>
      </svg>
    </div>
  </div>
)

// ── Abstract Pastel Gradient Waves ─────────────────────────────────────────

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
    <div className="border border-border rounded-xl bg-panel overflow-hidden transition-all duration-300">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none">
        <span className="font-medium text-lg text-left">{faq.q}</span>
        <ChevronDown className={`transform transition-transform duration-300 text-text-dim ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      <div className={`px-6 text-text-secondary text-sm overflow-hidden transition-all duration-300 ease-in-out text-left ${isOpen ? 'max-h-48 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        {faq.a}
      </div>
    </div>
  )
}

// ── Footer ──────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="relative z-10 border-t border-border mt-4 bg-bg-secondary/60">
    <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-10">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <p className="text-lg font-semibold uppercase tracking-widest text-primary mb-3">Agentra</p>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
          The open infrastructure for building, publishing, and monetising AI agents — powered by MCP, 0G Storage, and on-chain ownership.
        </p>
        <div className="flex gap-3 mt-5">
          {[
            { icon: Twitter, href: '#', label: 'Twitter' },
            { icon: Github, href: '#', label: 'GitHub' },
            { icon: MessageCircle, href: '#', label: 'Discord' },
            { icon: FileText, href: '#', label: 'Docs' },
          ].map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} aria-label={label}
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
          {['Marketplace', 'Deploy Studio', 'Dashboard', 'Agent Swarms', 'Pricing'].map(l => (
            <li key={l}><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</a></li>
          ))}
        </ul>
      </div>

      {/* Developers */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-4">Developers</p>
        <ul className="space-y-2.5">
          {['Documentation', 'MCP Protocol', '0G Storage', 'API Reference', 'Changelog'].map(l => (
            <li key={l}><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</a></li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-4">Company</p>
        <ul className="space-y-2.5">
          {['About', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map(l => (
            <li key={l}><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</a></li>
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
            className="lg:col-span-8 rounded-2xl border border-panel-border bg-panel px-7 py-8 text-left">
            <p className="text-xs uppercase tracking-wide text-text-dim font-semibold">Agent Infrastructure · Powered by 0G</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-left">
              Build, publish, and monetise AI agents with a cleaner protocol stack.
            </h1>
            <p className="mt-4 text-md sm:text-base text-text-secondary max-w-2xl text-left">
              Agentra gives developers a complete control surface for deployment, NFT ownership, on-chain billing, access control, and multi-agent orchestration — designed for teams shipping real agents, not demos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/marketplace" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm">
                Explore Marketplace <ArrowRight size={14} />
              </Link>
              <Link to="/deploy" className="btn-outline-glow px-6 py-3 rounded-xl inline-flex items-center gap-2 text-sm">
                <Code2 size={14} /> Deploy Agent
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-4 rounded-2xl border border-panel-border bg-panel-light">
            <div className="w-full h-full rounded-xl overflow-hidden">
              <video autoPlay loop muted playsInline className="w-full h-full object-cover bg-black/5">
                <source src="/videos/earth.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="rounded-xl border border-border bg-panel px-4 py-4 text-left">
              <div className="text-2xl font-semibold tracking-tight text-primary">
                {statsLoading ? <Loader2 size={18} className="animate-spin" /> : (typeof item.value === 'number' ? <Counter value={item.value} /> : item.value)}{statsLoading ? '' : item.suffix}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-text-dim">{item.label}</div>
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
              {['MCP Protocol', 'NFT Ownership', 'Delegation Billing', 'Agent Swarms', 'On-chain Access', '0G Storage', '0G Revenue', 'A2A Comms'].map(t => (
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
            <h2 className="text-3xl font-semibold tracking-tight">Platform Capabilities</h2>
            <p className="mt-2 text-text-secondary">The core primitives powering the Agentra network.</p>
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
      <section className="relative z-10 max-w-7xl mx-auto px-5 pt-16 border-t border-border">
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Ecosystem Workflow</h2>
          <p className="text-text-secondary">How agents, developers, and users create compounding value inside Agentra.</p>
        </div>
        <ImprovedWorkflow />
      </section>

      {/* THE PLATFORM — alternating layout */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-20 border-t border-border">
        <div className="max-w-2xl mb-14 text-left">
          <h2 className="text-3xl font-semibold tracking-tight">Inside the Agentra App</h2>
          <p className="mt-3 text-text-secondary">
            Everything you need to launch, manage, and scale AI agents is built into a single, cohesive platform.
          </p>
        </div>

        <div className="flex flex-col gap-20">
          {platformFeatures.map((feat, i) => {
            const isEven = i % 2 === 0
            return (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}>
                {/* Text side */}
                <div className="flex-1 text-left">
                  <div className="w-10 h-10 rounded-xl bg-accent-pink border border-[#d9b6c9] flex items-center justify-center mb-5">
                    <feat.icon size={18} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                  <p className="text-text-secondary text-md leading-relaxed mb-6">{feat.desc}</p>
                  <Link to={feat.link} className="inline-flex items-center text-sm font-medium hover:text-accent-pink transition-colors">
                    {feat.linkText} <ArrowRight className="ml-1 w-4 h-4" />
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
      </section>

      {/* TECHNICAL INFRASTRUCTURE */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-20 border-t border-border bg-bg-secondary/50 rounded-3xl my-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-left">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Powered by 0G & Web3</h2>
            <p className="text-text-secondary mb-8 text-lg">
              Agentra leverages decentralised primitives so you never depend on a centralised orchestrator holding your API keys or agent IP.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="shrink-0 mt-1"><Globe className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="font-semibold text-lg text-left">0G Storage Integration</h4>
                  <p className="text-md text-text-secondary mt-1 text-left">Agent metadata, configurations, and execution logs are pinned to the 0G network — verifiable, permanent, and gas-free on the execution layer.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1"><Lock className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="font-semibold text-lg text-left">Smart Contract Delegation</h4>
                  <p className="text-md text-text-secondary mt-1 text-left">Users sign once to authorise a spend limit. The protocol autonomously meters and bills each execution on-chain, paying developers in real time — no invoices, no intermediaries.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1"><Gem className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="font-semibold text-lg text-left">Agents as NFTs</h4>
                  <p className="text-md text-text-secondary mt-1 text-left">Every deployed agent is minted as an ERC-721 NFT. Ownership is wallet-native, fully transferable, and composable — your agent is a real, tradeable on-chain asset with provable provenance.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-square max-w-md mx-auto relative rounded-2xl bg-panel border border-border flex items-center justify-center p-8 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 dot-grid opacity-30" />
              <div className="relative z-10 flex flex-col gap-4 w-full">
                <div className="bg-bg border border-border p-4 rounded-xl text-center shadow-sm">
                  <p className="font-mono text-md">Frontend / App UI</p>
                </div>
                <div className="w-px h-6 bg-border mx-auto" />
                <div className="bg-bg border border-border p-4 rounded-xl text-center shadow-sm">
                  <p className="font-mono text-md text-primary">Agentra Orchestrator</p>
                </div>
                <div className="flex justify-between gap-4 mt-2">
                  <div className="w-1/3 bg-bg border border-border p-3 rounded-xl text-center shadow-sm">
                    <p className="font-mono text-sm">EVM Contracts</p>
                  </div>
                  <div className="w-1/3 bg-bg border border-border p-3 rounded-xl text-center shadow-sm">
                    <p className="font-mono text-sm">NFT Registry</p>
                  </div>
                  <div className="w-1/3 bg-bg border border-border p-3 rounded-xl text-center shadow-sm">
                    <p className="font-mono text-sm">0G Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-left mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-7xl">
          {faqs.map((faq, idx) => <FAQItem key={idx} faq={faq} />)}
        </div>
      </section>

      {/* SUMMARY */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pb-12 pt-10">
        <div className="max-w-7xl text-left">
          <h2 className="text-2xl font-semibold">Built for real agent economies</h2>
          <p className="mt-3 text-md text-text-secondary">
            Agentra unifies deployment, NFT ownership, monetisation, and execution into a seamless protocol stack. Developers publish agents with clear ownership, pricing, and access controls minted on-chain; users discover, purchase, and invoke them on demand. Every interaction is transparently metered and billed in 0G — no intermediaries, no synthetic estimates. Agents operate independently for focused tasks or collaborate dynamically via A2A communication, forming intelligent composable systems. By aligning infrastructure, incentives, and execution, Agentra creates a scalable ecosystem where autonomous agents continuously deliver — and capture — real-world value.
          </p>
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
