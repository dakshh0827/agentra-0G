import axios from 'axios'
import config from '../../config/config.js'

function normalizeEnv(envInput) {
  if (!envInput || typeof envInput !== 'object') return {}

  const entries = Object.entries(envInput)
    .filter(([key, value]) => String(key || '').trim().length > 0)
    .map(([key, value]) => [String(key).trim(), String(value ?? '')])

  return Object.fromEntries(entries)
}

function ensureHostedComputeConfig(computeConfig) {
  if (!computeConfig || typeof computeConfig !== 'object') {
    throw Object.assign(new Error('0G hosted compute config is required'), { status: 400 })
  }

  if (!String(computeConfig.agentCode || '').trim()) {
    throw Object.assign(new Error('computeConfig.agentCode is required for 0G hosted deploy'), { status: 400 })
  }
}

class ZeroGComputeService {
  get deployApiUrl() {
    return config.compute.deployApiUrl
  }

  get statusApiUrl() {
    return config.compute.statusApiUrl
  }

  get routerInvokeUrl() {
    return config.compute.routerInvokeUrl
  }

  get apiKey() {
    return config.compute.apiKey || ''
  }

  get timeoutMs() {
    return config.compute.timeoutMs
  }

  _buildHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`
    }
    return headers
  }

  async deployHostedAgent({ agentName, ownerWallet, computeConfig, metadata = {} }) {
    ensureHostedComputeConfig(computeConfig)

    const deployPayload = {
      name: agentName,
      ownerWallet,
      runtime: computeConfig.runtime || 'nodejs20',
      entryFile: computeConfig.entryFile || 'index.js',
      installCommand: computeConfig.installCommand || 'npm install',
      startCommand: computeConfig.startCommand || 'node index.js',
      sourceCode: computeConfig.agentCode,
      env: normalizeEnv(computeConfig.env),
      systemPrompt: computeConfig.systemPrompt || '',
      metadata,
    }

    const response = await axios.post(this.deployApiUrl, deployPayload, {
      headers: this._buildHeaders(),
      timeout: this.timeoutMs,
    })

    const deployment = response?.data || {}
    const deploymentId = String(
      deployment.deploymentId || deployment.id || deployment.jobId || ''
    ).trim()

    let endpoint = String(
      deployment.endpoint || deployment.serviceUrl || deployment.url || ''
    ).trim()

    let status = String(deployment.status || '').trim().toLowerCase() || 'deploying'

    if (!deploymentId && !endpoint) {
      throw new Error('0G deploy response missing deploymentId/endpoint')
    }

    // Some providers return a deployment id first and endpoint later.
    if (!endpoint && deploymentId) {
      const polled = await this.waitForDeploymentReady(deploymentId)
      endpoint = polled.endpoint
      status = polled.status
    }

    if (!endpoint) {
      throw new Error('0G deployment did not produce an endpoint')
    }

    return {
      deploymentId: deploymentId || endpoint,
      endpoint,
      status,
      raw: deployment,
    }
  }

  async waitForDeploymentReady(deploymentId) {
    const maxAttempts = config.compute.deployStatusMaxAttempts
    const delayMs = config.compute.deployStatusPollMs

    let lastStatus = 'deploying'

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await axios.get(this.statusApiUrl, {
        params: { deploymentId },
        headers: this._buildHeaders(),
        timeout: this.timeoutMs,
      })

      const data = response?.data || {}
      const endpoint = String(data.endpoint || data.serviceUrl || data.url || '').trim()
      const status = String(data.status || '').trim().toLowerCase() || 'deploying'
      lastStatus = status

      if (endpoint && ['ready', 'active', 'running', 'available'].includes(status)) {
        return { endpoint, status }
      }

      if (['failed', 'error'].includes(status)) {
        throw new Error(`0G deployment failed with status: ${status}`)
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    throw new Error(`0G deployment is not ready yet (last status: ${lastStatus})`)
  }

  async invokeHostedAgent(task, agent, meta = {}) {
    const endpoint = String(agent?.endpoint || '').trim().replace(/\/+$/, '')
    if (!endpoint) {
      throw new Error('Hosted 0G agent endpoint is missing')
    }

    const headers = this._buildHeaders()

    // Preferred path: invoke through 0G router with endpoint target.
    if (this.routerInvokeUrl) {
      const routerPayload = {
        endpoint,
        task,
        meta,
      }

      const routerResponse = await axios.post(this.routerInvokeUrl, routerPayload, {
        headers,
        timeout: this.timeoutMs,
      })

      return {
        data: routerResponse?.data,
      }
    }

    // Fallback path: direct invocation of generated endpoint.
    const directPayload = {
      task,
      input: task,
      prompt: task,
      query: task,
      message: task,
      meta,
    }

    const attempts = [
      `${endpoint}/execute`,
      endpoint,
    ]

    let lastError = null
    let directResponse = null

    for (const url of attempts) {
      try {
        directResponse = await axios.post(url, directPayload, {
          headers,
          timeout: this.timeoutMs,
        })
        break
      } catch (error) {
        lastError = error
      }
    }

    if (!directResponse) {
      throw lastError || new Error('Failed to invoke hosted 0G endpoint')
    }

    return {
      data: directResponse?.data,
    }
  }
}

export default new ZeroGComputeService()
