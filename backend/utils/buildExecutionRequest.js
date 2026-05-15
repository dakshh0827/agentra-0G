import FormData from 'form-data'
import { redactHeaders } from './redactSecrets.js'

/**
 * Builds the axios-compatible request config from executionConfig + runtimePayload.
 * Fully schema-driven — no hardcoded field names.
 *
 * @param {object} executionConfig  — agent.executionConfig from DB
 * @param {object} runtimePayload   — { headers, body, files, contentType, method }
 * @param {string} task             — the task string (used for multipart/urlencoded flows)
 * @returns {{ url: string, method: string, headers: object, data: any }}
 */
export function buildExecutionRequest(endpoint, executionConfig, runtimePayload, task) {
  const method = (executionConfig?.method || 'POST').toUpperCase()
  const contentType = executionConfig?.contentType || 'json'

  const runtimeHeaders = runtimePayload?.headers || {}
  const runtimeBody    = runtimePayload?.body    || {}
  const runtimeFiles   = runtimePayload?.files   || {}

  // ── Build request headers ────────────────────────────────────
  const requestHeaders = {}

  // Inject static (non-userProvided) header defaults from schema
  for (const headerDef of (executionConfig?.headers || [])) {
    if (!headerDef.userProvided && headerDef.value) {
      requestHeaders[headerDef.key] = headerDef.value
    }
  }

  // Inject runtime user-provided headers
  for (const [k, v] of Object.entries(runtimeHeaders)) {
    if (v !== undefined && v !== '') {
      requestHeaders[k] = v
    }
  }

  console.log('[EXECUTION] Headers (redacted):', redactHeaders(requestHeaders))

  // ── Build request body ────────────────────────────────────────
  let data
  if (contentType === 'form-data') {
    const form = new FormData()

    // Always include task
    form.append('task', task || '')

    // Append schema-defined static body fields (non-userProvided with defaults)
    for (const fieldDef of (executionConfig?.bodyFields || [])) {
      if (!fieldDef.userProvided && fieldDef.type !== 'file') {
        // skip — no static defaults supported for body fields currently
      }
    }

    // Append runtime body fields
    for (const [k, v] of Object.entries(runtimeBody)) {
      if (v !== undefined && v !== '') {
        form.append(k, String(v))
      }
    }

    // Append runtime files
    for (const [k, fileBuffer] of Object.entries(runtimeFiles)) {
      if (fileBuffer) {
        form.append(k, fileBuffer.buffer, {
          filename: fileBuffer.originalname || k,
          contentType: fileBuffer.mimetype || 'application/octet-stream',
        })
      }
    }

    Object.assign(requestHeaders, form.getHeaders())
    data = form

  } else if (contentType === 'x-www-form-urlencoded') {
    const params = new URLSearchParams()
    params.append('task', task || '')
    for (const [k, v] of Object.entries(runtimeBody)) {
      if (v !== undefined && v !== '') {
        params.append(k, String(v))
      }
    }
    requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
    data = params.toString()

  } else {
    // Default: JSON
    data = {
      task: task || '',
      ...runtimeBody,
    }
    requestHeaders['Content-Type'] = 'application/json'
    requestHeaders['Accept'] = 'application/json, text/event-stream'
  }

  const baseEndpoint = String(endpoint || '').trim().replace(/\/+$/, '')
  const candidateUrls = new Set([baseEndpoint])

  try {
    const parsed = new URL(baseEndpoint)
    const pathname = parsed.pathname.replace(/\/+$/, '')
    const origin = parsed.origin

    if (pathname.endsWith('/apply')) {
      candidateUrls.add(`${origin}${pathname.replace(/\/apply$/, '')}`)
    } else if (pathname.endsWith('/execute')) {
      candidateUrls.add(`${origin}${pathname.replace(/\/execute$/, '')}`)
    } else {
      candidateUrls.add(`${origin}${pathname}/apply`)
      candidateUrls.add(`${origin}${pathname}/execute`)
    }
  } catch {
    // ignore URL parsing issues; the base endpoint will still be tried
  }

  return {
    url: `${baseEndpoint}`,
    fallbackUrl: baseEndpoint,
    candidateUrls: [...candidateUrls],
    method,
    headers: requestHeaders,
    data,
  }
}