import OpenAI from 'openai'
import config from '../../config/config.js'

/**
 * 0G Router Service
 *
 * Handles agent execution via the 0G Compute Network using OpenAI-compatible API.
 * The 0G Router provides decentralized GPU inference through an OpenAI-compatible endpoint.
 */
class ZeroGRouterService {
  constructor() {
    this.clients = new Map()
  }

  /**
   * Get or create an OpenAI client configured for 0G Router
   * @param {Object} computeConfig - Agent's 0G compute configuration
   * @returns {OpenAI} Configured OpenAI client
   */
  _getClient(computeConfig) {
    if (!computeConfig || !computeConfig.apiKey) {
      throw new Error('0G Router API key is required in computeConfig')
    }

    const baseURL = computeConfig.baseURL || 'https://router-api.0g.ai/v1'
    const clientKey = `${baseURL}:${computeConfig.apiKey}`

    if (!this.clients.has(clientKey)) {
      this.clients.set(
        clientKey,
        new OpenAI({
          apiKey: computeConfig.apiKey,
          baseURL: baseURL,
        })
      )
    }

    return this.clients.get(clientKey)
  }

  /**
   * Execute an agent task via 0G Router
   * @param {string} task - The input task/prompt
   * @param {Object} agent - The agent object with computeConfig
   * @param {Object} meta - Metadata about the execution
   * @returns {Promise<Object>} Response from 0G Router
   */
  async executeAgent(task, agent, meta = {}) {
    if (!agent.computeConfig) {
      throw new Error('Agent is not configured for 0G Router execution')
    }

    const config = agent.computeConfig
    const client = this._getClient(config)

    const model = config.model || 'meta-llama/Llama-3-8b-instruct'
    const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.'
    const temperature = config.temperature !== undefined ? config.temperature : 0.7
    const maxTokens = config.maxTokens || 512

    try {
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: task,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      })

      // Extract the response text from the OpenAI format
      const responseText =
        response.choices?.[0]?.message?.content || 'No response generated'

      return {
        data: {
          response: responseText,
          model: model,
          usage: {
            prompt_tokens: response.usage?.prompt_tokens || 0,
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
          },
          provider: '0g',
        },
      }
    } catch (error) {
      // Re-throw with more context
      const errorMsg =
        error.response?.data?.error?.message || error.message || 'Unknown error'
      throw new Error(`0G Router API error: ${errorMsg}`)
    }
  }

  /**
   * Validate 0G Router compute configuration
   * @param {Object} computeConfig - The configuration to validate
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateConfig(computeConfig) {
    const errors = []

    if (!computeConfig) {
      errors.push('computeConfig is required')
      return { isValid: false, errors }
    }

    if (!computeConfig.apiKey) {
      errors.push('apiKey is required in computeConfig')
    }

    if (computeConfig.model && typeof computeConfig.model !== 'string') {
      errors.push('model must be a string')
    }

    if (
      computeConfig.temperature !== undefined &&
      (typeof computeConfig.temperature !== 'number' ||
        computeConfig.temperature < 0 ||
        computeConfig.temperature > 2)
    ) {
      errors.push('temperature must be a number between 0 and 2')
    }

    if (
      computeConfig.maxTokens !== undefined &&
      (typeof computeConfig.maxTokens !== 'number' ||
        computeConfig.maxTokens < 1 ||
        computeConfig.maxTokens > 4096)
    ) {
      errors.push('maxTokens must be a number between 1 and 4096')
    }

    if (computeConfig.systemPrompt && typeof computeConfig.systemPrompt !== 'string') {
      errors.push('systemPrompt must be a string')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get available 0G Router models
   * Cached list of known models
   */
  getAvailableModels() {
    return [
      'meta-llama/Llama-3-8b-instruct',
      'meta-llama/Llama-3-70b-instruct',
      'meta-llama/Llama-2-7b-chat-hf',
      'meta-llama/Llama-2-13b-chat-hf',
      'mistralai/Mistral-7B-Instruct-v0.1',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'NousResearch/Nous-Hermes-2-Mistral-7B-DPO',
    ]
  }
}

export default new ZeroGRouterService()
