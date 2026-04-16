import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Network, Search, Zap, ArrowRight, CheckCircle,
  AlertCircle, Loader2, MessageCircle,
  Bot, Cpu, Activity
} from 'lucide-react'
import { formatUnits } from 'viem'
import { parseUnits } from 'viem'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { agentsAPI } from '../../api/agents'
import { CHAIN_CONFIG } from '../../config/chains.config'
import OutputRenderer from './OutputRenderer'

const formatWeiToAgt = (weiValue) => {
  try {
    return Number(formatUnits(BigInt(weiValue || '0'), 18)).toFixed(4)
  } catch {
    return '0.0000'
  }
}

const extractReadableText = (payload) => {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  if (typeof payload === 'number' || typeof payload === 'boolean') return String(payload)
  if (Array.isArray(payload)) return payload.map(item => extractReadableText(item)).filter(Boolean).join('\n')

  const candidates = [
    payload.message,
    payload.summary,
    payload.result,
    payload.output,
    payload.response,
    payload.answer,
    payload.text,
    payload.content,
    payload.data,
  ]

  for (const value of candidates) {
    const text = extractReadableText(value)
    if (text) return text
  }

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return ''
  }
}

// ── Agent Discovery Card ──────────────────────────────────────
function DiscoveryResult({ agent, onSelect, selected }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(agent)}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
        selected?.agentId === agent.agentId
          ? 'border-[var(--color-purple-core)] bg-[rgba(124,58,237,0.1)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-bright)] bg-[rgba(255,255,255,0.02)]'
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-[var(--color-nebula-deep)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
        <Bot size={16} className="text-[var(--color-purple-bright)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm text-[var(--color-text-primary)] truncate">{agent.name}</div>
        <div className="text-[9px] font-mono text-[var(--color-text-dim)] flex items-center gap-2">
          <span className="text-[var(--color-purple-bright)]">{agent.category}</span>
          <span>·</span>
          <span>{formatWeiToAgt(agent.commsPricePerCall)} AGT/call</span>
          <span>·</span>
          <span className="text-[var(--color-success)]">{agent.successRate}%</span>
        </div>
      </div>
      {selected?.agentId === agent.agentId && (
        <CheckCircle size={16} className="text-[var(--color-purple-bright)] shrink-0" />
      )}
    </motion.div>
  )
}

// ── Result Renderer ───────────────────────────────────────────
function CallResultDisplay({ result }) {
  if (!result) return null
  const { targetAgent, sourceAgent, result: execResult, billing } = result
  const readableText = extractReadableText(execResult?.response)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Chain visualization */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.2)]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Cpu size={14} className="text-[var(--color-purple-bright)]" />
          <span className="text-[var(--color-purple-bright)]">{sourceAgent?.name || 'Source'}</span>
        </div>
        <ArrowRight size={16} className="text-[var(--color-text-dim)] shrink-0" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Bot size={14} className="text-[var(--color-success)]" />
          <span className="text-[var(--color-success)]">{targetAgent?.name}</span>
        </div>
        <span className="ml-auto text-[9px] font-mono text-[var(--color-text-dim)]">
          {execResult?.latency}ms
        </span>
      </div>

      {/* Response */}
      <div className="p-3 rounded-xl bg-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.2)]">
        <div className="text-[9px] font-mono tracking-widest text-[var(--color-text-dim)] mb-2">DELEGATION BILLING</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="rounded-lg p-2 bg-black/20 border border-[var(--color-border)]">
            <div className="text-[var(--color-text-dim)] text-[9px]">CHARGED</div>
            <div className="text-[var(--color-purple-bright)]">{formatWeiToAgt(billing?.chargedWei)} AGT</div>
          </div>
          <div className="rounded-lg p-2 bg-black/20 border border-[var(--color-border)]">
            <div className="text-[var(--color-text-dim)] text-[9px]">CREATOR</div>
            <div className="text-[var(--color-success)]">{formatWeiToAgt(billing?.creatorAmountWei)} AGT</div>
          </div>
          <div className="rounded-lg p-2 bg-black/20 border border-[var(--color-border)]">
            <div className="text-[var(--color-text-dim)] text-[9px]">PLATFORM</div>
            <div className="text-[var(--color-text-secondary)]">{formatWeiToAgt(billing?.platformFeeWei)} AGT</div>
          </div>
        </div>
      </div>

      {readableText && (
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)]">
          <div className="text-[9px] font-mono tracking-widest text-[var(--color-text-dim)] mb-2">READABLE RESPONSE</div>
          <pre className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-[var(--color-text-secondary)] font-sans">{readableText}</pre>
        </div>
      )}

      <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border)]">
        <div className="text-[9px] font-mono tracking-widest text-[var(--color-text-dim)] mb-2">JSON RESPONSE</div>
        <OutputRenderer
          response={execResult?.response}
          agentName={targetAgent?.name}
          latency={execResult?.latency}
          success={execResult?.success}
        />
      </div>
    </motion.div>
  )
}

// ── Message History ───────────────────────────────────────────
function MessageHistory({ agentId }) {
  const [messages, setMessages] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    agentsAPI.getCommsMessages(agentId)
      .then(r => setMessages(r.data))
      .catch(() => setMessages(null))
      .finally(() => setLoading(false))
  }, [agentId])

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 size={20} className="animate-spin text-[var(--color-purple-bright)]" />
    </div>
  )

  if (!messages) return null

  const allMessages = [...(messages.sent || []), ...(messages.received || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)

  if (allMessages.length === 0) return (
    <div className="text-center py-8">
      <MessageCircle size={28} className="mx-auto mb-2 text-[var(--color-text-dim)] opacity-20" />
      <div className="text-[var(--color-text-dim)] text-xs font-mono">No inter-agent messages yet</div>
    </div>
  )

  return (
    <div className="space-y-2">
      {allMessages.map(msg => {
        const isSent = msg.fromAgentId === messages.agentId
        return (
          <div key={msg.id} className={`p-3 rounded-lg border text-xs ${
            isSent
              ? 'border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.04)]'
              : 'border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.04)]'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-mono font-bold ${isSent ? 'text-[var(--color-purple-bright)]' : 'text-[var(--color-success)]'}`}>
                {isSent ? '→ SENT TO' : '← RECEIVED FROM'}
              </span>
              <span className="font-mono text-[9px] text-[var(--color-text-dim)]">
                {isSent ? msg.toAgentId : msg.fromAgentId}
              </span>
              <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono ${
                msg.status === 'success' ? 'text-[var(--color-success)] bg-[rgba(52,211,153,0.1)]'
                : msg.status === 'failed' ? 'text-[var(--color-danger)] bg-[rgba(248,113,113,0.1)]'
                : 'text-[var(--color-text-dim)]'
              }`}>{msg.status}</span>
            </div>
            <p className="text-[var(--color-text-muted)] truncate">{msg.task}</p>
            {msg.latency && <span className="text-[9px] font-mono text-[var(--color-text-dim)]">{msg.latency}ms</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── Main AgentCommsPanel ──────────────────────────────────────
export default function AgentCommsPanel({ agentId, agentName, isOwner = false, commsEnabled = false, commsPricePerCall = '0', onCommsConfigSaved }) {
  const { isConnected, chain, address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [tab, setTab] = useState('call') // 'call' | 'history'
  const [mode, setMode] = useState('manual') // 'manual' | 'discover'
  const [targetId, setTargetId] = useState('')
  const [task, setTask] = useState('')
  const [discoveryResults, setDiscoveryResults] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [discovering, setDiscovering] = useState(false)
  const [calling, setCalling] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [ownerCommsEnabled, setOwnerCommsEnabled] = useState(commsEnabled)
  const [ownerCommsPrice, setOwnerCommsPrice] = useState(formatWeiToAgt(commsPricePerCall || '0'))
  const [savingConfig, setSavingConfig] = useState(false)

  useEffect(() => {
    setOwnerCommsEnabled(commsEnabled)
    setOwnerCommsPrice(formatWeiToAgt(commsPricePerCall || '0'))
  }, [commsEnabled, commsPricePerCall])

  const handleSaveCommsConfig = async () => {
    if (savingConfig) return

    if (ownerCommsEnabled && (!ownerCommsPrice || Number(ownerCommsPrice) <= 0)) {
      setError('Comms price must be greater than 0 AGT when enabled')
      return
    }

    setSavingConfig(true)
    setError(null)

    try {
      await agentsAPI.update(agentId, {
        commsEnabled: ownerCommsEnabled,
        commsPricePerCall: ownerCommsEnabled
          ? parseUnits(ownerCommsPrice, 18).toString()
          : '0',
      })

      onCommsConfigSaved?.()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to save comms settings')
    } finally {
      setSavingConfig(false)
    }
  }

  const handleDiscover = async () => {
    if (!task.trim()) return
    setDiscovering(true)
    setError(null)
    try {
      const res = await agentsAPI.discoverForComms(task, agentId)
      setDiscoveryResults(res.data.agents || [])
    } catch (e) {
      setError('Discovery failed')
    } finally {
      setDiscovering(false)
    }
  }

  const handleCall = async () => {
    if (!task.trim() || calling) return
    setCalling(true)
    setResult(null)
    setError(null)

    try {
      const contracts = chain?.id ? CHAIN_CONFIG[chain.id]?.contracts : null

      let target = null
      if (mode === 'manual' && targetId) {
        const targetRes = await agentsAPI.getCommsTarget({ targetAgentName: targetId })
        target = targetRes.data
      } else if (mode === 'discover' && selectedAgent) {
        target = selectedAgent
      } else if (mode === 'discover' && !selectedAgent) {
        const discovery = await agentsAPI.discoverForComms(task, agentId)
        const first = discovery.data?.agents?.[0]
        if (!first) {
          throw new Error('No comms-enabled target found for this task')
        }
        target = first
      }

      if (!target?.name) {
        throw new Error('Target agent name is required')
      }

      if (target.status && target.status !== 'active') {
        throw new Error('Target agent is not active')
      }

      const targetOwner = (target.ownerWallet || '').toLowerCase()
      const caller = (address || '').toLowerCase()
      const rawPrice = BigInt(target.commsPricePerCall || '0')
      const shouldCharge = rawPrice > 0n && targetOwner !== caller

      let txHash = undefined
      if (shouldCharge) {
        if (!contracts?.AgentToken || !contracts?.Agentra) {
          throw new Error('Smart contracts not found for current network')
        }
        if (!publicClient) {
          throw new Error('Wallet client unavailable')
        }
        if (!target.ownerWallet) {
          throw new Error('Target owner wallet not available')
        }

        const platformFeeWei = (rawPrice * 20n) / 100n
        const creatorAmountWei = rawPrice - platformFeeWei

        const feeCollector = await publicClient.readContract({
          address: contracts.Agentra.address,
          abi: contracts.Agentra.abi,
          functionName: 'feeCollector',
        })

        if (creatorAmountWei > 0n) {
          const creatorTx = await writeContractAsync({
            address: contracts.AgentToken.address,
            abi: contracts.AgentToken.abi,
            functionName: 'transfer',
            args: [target.ownerWallet, creatorAmountWei],
          })
          const receipt = await publicClient.waitForTransactionReceipt({ hash: creatorTx })
          txHash = receipt.transactionHash
        }

        if (platformFeeWei > 0n) {
          const platformTx = await writeContractAsync({
            address: contracts.AgentToken.address,
            abi: contracts.AgentToken.abi,
            functionName: 'transfer',
            args: [feeCollector, platformFeeWei],
          })
          await publicClient.waitForTransactionReceipt({ hash: platformTx })
          if (!txHash) txHash = platformTx
        }
      }

      const payload = {
        task,
        targetAgentName: target.name,
        ...(txHash ? { txHash } : {}),
      }

      const res = await agentsAPI.callAgent(agentId, payload)
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Call failed')
    } finally {
      setCalling(false)
    }
  }

  if (!isConnected) return (
    <div className="glass-card-landing rounded-xl p-6 text-center">
      <Network size={28} className="mx-auto mb-2 text-[var(--color-text-dim)] opacity-30" />
      <p className="text-[var(--color-text-muted)] text-sm font-mono">Connect wallet to use agent-to-agent communication</p>
    </div>
  )

  return (
    <div className="glass-card-landing rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {[
          { id: 'call', label: 'CALL AGENT', icon: Network },
          { id: 'history', label: 'MESSAGE LOG', icon: Activity },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 font-mono text-[10px] tracking-widest border-b-2 transition-all cursor-pointer ${
                tab === t.id
                  ? 'border-[var(--color-purple-bright)] text-[var(--color-purple-bright)] bg-[rgba(124,58,237,0.05)]'
                  : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="p-5 sm:p-6">
        {tab === 'call' && (
          <div className="space-y-5">
            {isOwner && (
              <div className="rounded-xl border border-[var(--color-border)] bg-black/20 p-4 space-y-3">
                <div className="text-[10px] font-mono tracking-widest text-[var(--color-purple-bright)]">OWNER COMMS SETTINGS</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-[var(--color-text-dim)]">Enable agent-to-agent delegation</span>
                  <button
                    onClick={() => setOwnerCommsEnabled(!ownerCommsEnabled)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono cursor-pointer ${
                      ownerCommsEnabled
                        ? 'border-[var(--color-success)] text-[var(--color-success)] bg-[rgba(52,211,153,0.1)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-dim)]'
                    }`}
                  >
                    {ownerCommsEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                {ownerCommsEnabled && (
                  <div>
                    <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2">PRICE PER CALL (AGT)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={ownerCommsPrice}
                      onChange={(e) => setOwnerCommsPrice(e.target.value)}
                      className="input-field w-full px-4 py-2.5 rounded-lg text-sm"
                    />
                  </div>
                )}
                <button
                  onClick={handleSaveCommsConfig}
                  disabled={savingConfig}
                  className="px-4 py-2 rounded-lg text-[10px] font-mono tracking-widest border border-[var(--color-purple-core)] text-[var(--color-purple-bright)] bg-[rgba(124,58,237,0.08)] hover:bg-[rgba(124,58,237,0.16)] disabled:opacity-50 cursor-pointer"
                >
                  {savingConfig ? 'SAVING...' : 'SAVE COMMS CONFIG'}
                </button>
              </div>
            )}

            <div>
              <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
                <strong className="text-[var(--color-purple-bright)]">{agentName}</strong> can delegate tasks to other agents on the marketplace.
                Either specify a target agent name or let the system auto-discover the best match.
              </p>

              {/* Task input */}
              <div className="mb-4">
                <label className="text-[9px] font-mono text-[var(--color-text-dim)] tracking-[0.2em] uppercase block mb-2">TASK TO DELEGATE</label>
                <textarea
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  placeholder="Describe the task to delegate to another agent..."
                  rows={3}
                  className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>

              {/* Mode selector */}
              <div className="flex gap-2 mb-4">
                {[
                  { id: 'manual', label: 'MANUAL TARGET' },
                  { id: 'discover', label: 'AUTO-DISCOVER' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setSelectedAgent(null); setDiscoveryResults([]) }}
                    className={`flex-1 py-2.5 rounded-lg font-mono text-[10px] border transition-all cursor-pointer ${
                      mode === m.id
                        ? 'border-[var(--color-purple-core)] bg-[rgba(124,58,237,0.1)] text-[var(--color-purple-bright)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Manual: target agent ID input */}
              {mode === 'manual' && (
                <input
                  type="text"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                    placeholder="Target Agent Name (exact match)"
                  className="input-field w-full px-4 py-3 rounded-xl text-sm mb-4 font-mono"
                />
              )}

              {/* Discover: search and results */}
              {mode === 'discover' && (
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={handleDiscover}
                      disabled={!task.trim() || discovering}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.06)] text-[var(--color-purple-bright)] font-mono text-[11px] disabled:opacity-40 hover:bg-[rgba(124,58,237,0.12)] transition-all cursor-pointer"
                    >
                      {discovering ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                      FIND AGENTS
                    </button>
                    {selectedAgent && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.25)] text-[var(--color-success)] font-mono text-[11px]">
                        <CheckCircle size={13} />
                        {selectedAgent.name}
                        <button onClick={() => setSelectedAgent(null)} className="ml-1 opacity-50 hover:opacity-100 cursor-pointer">×</button>
                      </div>
                    )}
                  </div>

                  {discoveryResults.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {discoveryResults.map(agent => (
                        <DiscoveryResult
                          key={agent.agentId}
                          agent={agent}
                          selected={selectedAgent}
                          onSelect={setSelectedAgent}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-[var(--color-danger)] text-xs p-3 rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] mb-4">
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              {/* Call button */}
              <button
                onClick={handleCall}
                disabled={calling || !task.trim()}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[var(--color-purple-core)] hover:bg-[var(--color-purple-bright)] text-white font-mono text-[11px] tracking-widest disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.25)]"
              >
                {calling ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                {calling ? 'DELEGATING...' : 'DELEGATE TASK'}
              </button>
            </div>

            {/* Result */}
            {result && <CallResultDisplay result={result} />}
          </div>
        )}

        {tab === 'history' && <MessageHistory agentId={agentId} />}
      </div>
    </div>
  )
}