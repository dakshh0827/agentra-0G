import axios from 'axios'
import prisma from '../lib/prisma.js'
import agentService from '../services/agentService.js'
import config from '../config/config.js'
import { v4 as uuidv4 } from 'uuid'

class Orchestrator {
  constructor() {
    this.activeChains = new Map()
  }

  async executeAgent(agentId, task, callerWallet, options = {}) {
    const {
      callDepth = 0,
      parentInteractionId = null,
      callChainId = uuidv4(),
    } = options
 
    if (callDepth > config.platform.maxCallDepth) {
      throw Object.assign(
        new Error(`Max call depth (${config.platform.maxCallDepth}) exceeded`),
        { status: 429 }
      )
    }

    if (!this.activeChains.has(callChainId)) {
      this.activeChains.set(callChainId, new Set())
    }
    const chain = this.activeChains.get(callChainId)

    if (chain.has(agentId)) {
      throw Object.assign(
        new Error(`Circular agent call detected: ${agentId}`),
        { status: 400 }
      )
    }
    chain.add(agentId)

    const agent = await agentService.getById(agentId)

    if (agent.status === 'offline' || agent.status === 'inactive') {
      chain.delete(agentId)
      throw Object.assign(
        new Error(`Agent "${agent.name}" is ${agent.status}`),
        { status: 503 }
      )
    }

    if (!agent.endpoint) {
      chain.delete(agentId)
      if (chain.size === 0) this.activeChains.delete(callChainId)
      throw Object.assign(
        new Error(`Agent "${agent.name}" has no endpoint configured`),
        { status: 400 }
      )
    }

    const interactionId = uuidv4()
    const startTime = Date.now()
    let interactionRecord

    try {
      interactionRecord = await prisma.interaction.create({
        data: {
          agentId: agent.agentId,
          callerWallet: callerWallet?.toLowerCase() || null,
          task,
          callDepth,
          parentInteractionId,
          status: 'success',
        },
      })
    } catch (err) {
      console.error('[ORCHESTRATOR] Interaction create failed:', err.message)
    }

    let response
    let success = false

    try {
      let result

      result = await this._callAgentEndpoint(agent.endpoint, task, {
        callDepth,
        callChainId,
        interactionId: interactionRecord?.id,
        callerWallet,
        agentId: agent.agentId,
        contractAgentId: agent.contractAgentId ?? null,
      })

      response = result.data
      success = true
    } catch (err) {
      if (interactionRecord) {
        await prisma.interaction.update({
          where: { id: interactionRecord.id },
          data: {
            status: 'failed',
            errorMessage: err.message,
            latency: Date.now() - startTime,
          },
        })
      }

      chain.delete(agentId)
      if (chain.size === 0) this.activeChains.delete(callChainId)

      throw Object.assign(
        new Error(`Agent execution failed: ${err.message}`),
        { status: 502 }
      )
    }

    const latency = Date.now() - startTime

    if (interactionRecord) {
      await prisma.interaction.update({
        where: { id: interactionRecord.id },
        data: {
          response:
            typeof response === 'string'
              ? response
              : JSON.stringify(response),
          latency,
          status: 'success',
        },
      })
    }

    await agentService.recordExecution(agent.agentId, {
      success,
      latency,
    })

    chain.delete(agentId)
    if (chain.size === 0) this.activeChains.delete(callChainId)

    return {
      interactionId: interactionRecord?.id,
      agentId: agent.agentId,
      agentName: agent.name,
      task,
      response,
      latency,
      success: true,
      callDepth,
      timestamp: new Date().toISOString(),
    }
  }

  async agentToAgentCall(fromAgentId, toAgentId, task, parentOptions = {}) {
    return this.executeAgent(toAgentId, task, null, {
      ...parentOptions,
      callDepth: (parentOptions.callDepth || 0) + 1,
    })
  }

  async _callAgentEndpoint(endpoint, task, meta = {}) {
    const timeout = config.platform.callTimeoutMs

    const baseEndpoint = String(endpoint || '').trim().replace(/\/+$/, '')
    if (!baseEndpoint) {
      throw new Error('Agent endpoint is empty')
    }

    const basePayload = {
      task,
      meta: {
        platform: 'agentra',
        version: '2.0',
        ...meta,
      },
    }

    const compatibilityPayload = {
      ...basePayload,
      input: task,
      prompt: task,
      query: task,
      message: task,
    }

    const attempts = [
      { url: `${baseEndpoint}/execute`, payload: basePayload },
      { url: baseEndpoint, payload: basePayload },
      { url: `${baseEndpoint}/execute`, payload: compatibilityPayload },
      { url: baseEndpoint, payload: compatibilityPayload },
    ]

    let lastError = null

    for (const attempt of attempts) {
      try {
        return await axios.post(attempt.url, attempt.payload, {
          timeout,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (err) {
        lastError = err
      }
    }

    if (!lastError) {
      throw new Error('Agent endpoint call failed without an error response')
    }

    const status = lastError.response?.status
    const responseMsg =
      lastError.response?.data?.error ||
      lastError.response?.data?.message ||
      (typeof lastError.response?.data === 'string' ? lastError.response.data : '') ||
      lastError.message

    if (status) {
      throw new Error(`Endpoint responded with status ${status}: ${responseMsg}`)
    }

    throw lastError
  }

  async getInteractionHistory(agentId, limit = 50) {
    // Support DB id, DB agentId string, and on-chain contractAgentId
    const normalized = String(agentId || '').trim()
    const isContractAgentId = /^\d+$/.test(normalized)

    const agent = await prisma.agent.findFirst({
      where: isContractAgentId
        ? { OR: [{ id: normalized }, { agentId: normalized }, { contractAgentId: Number(normalized) }] }
        : { OR: [{ id: normalized }, { agentId: normalized }] },
    })

    if (!agent) return []

    return prisma.interaction.findMany({
      where: { agentId: agent.agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        callerWallet: true,
        task: true,
        latency: true,
        status: true,
        callDepth: true,
        createdAt: true,
      },
    })
  }
}

export default new Orchestrator()