# Agentra Execution Config Migration

# OVERVIEW

Agentra is evolving from a simple text-only AI marketplace into a universal AI API execution platform supporting:

- multipart/form-data
- runtime headers
- file uploads
- schema-driven execution
- multimodal AI APIs
- runtime secrets
- configurable execution schemas

The migration is being implemented incrementally.

---

# IMPORTANT ARCHITECTURE RULES

## Solidity contracts remain unchanged

Execution schemas remain:
- off-chain
- stored in Prisma
- included inside metadataURI JSON

Contracts continue handling:
- ownership
- pricing
- access control
- deployment lifecycle
- metadata URI

---

# STAGE 1 — BACKEND EXECUTION CONFIG SUPPORT

## STATUS

✅ COMPLETE

## Includes

- Prisma executionConfig field
- deploy validation schemas
- metadata propagation
- DB persistence
- update support
- backward compatibility

---

# STAGE 2 — DEPLOYSTUDIO EXECUTION SCHEMA BUILDER

## STATUS

✅ COMPLETE

## Includes

- Execution Config deploy step
- dynamic schema builder
- content type selector
- header builder
- body field builder
- validation
- live preview
- deploy payload integration

---

# STAGE 3 — AGENTDETAILS DYNAMIC EXECUTION UI

## STATUS

✅ COMPLETE

---

# OBJECTIVE

Upgrade AgentDetails from:
- static task textarea

into:
- fully schema-driven runtime execution UI.

The runtime UI dynamically renders based on:

```js
agent.executionConfig
```

---

# FILES CREATED

## RuntimeFieldRenderer

```txt
frontend/src/components/execution/RuntimeFieldRenderer.jsx
```

Dynamic field renderer for:
- text
- textarea
- number
- password
- boolean

---

## RuntimeHeaderRenderer

```txt
frontend/src/components/execution/RuntimeHeaderRenderer.jsx
```

Dynamic runtime header input renderer.

---

## RuntimeFileUpload

```txt
frontend/src/components/execution/RuntimeFileUpload.jsx
```

Supports:
- drag/drop uploads
- click uploads
- file previews
- file removal

Frontend-only storage currently.

---

## RuntimeExecutionForm

```txt
frontend/src/components/execution/RuntimeExecutionForm.jsx
```

Main schema-driven runtime execution form.

Handles:
- runtime validation
- runtime payload preparation
- field orchestration

---

## RuntimeSummaryPanel

```txt
frontend/src/components/execution/RuntimeSummaryPanel.jsx
```

Pre-execution runtime summary.

Shows:
- content type
- file count
- header count
- field count

without exposing secrets.

---

# FILES MODIFIED

## AgentDetail Page

```txt
frontend/src/pages/AgentDetail.jsx
```

---

# AGENTDETAILS EXECUTION FLOW UPDATED

Current execution console now supports:

## Legacy Agents

Fallback:
```json
{
  "task": "..."
}
```

Rendered exactly as before.

---

## executionConfig Agents

Dynamic runtime execution UI rendered automatically.

---

# execConfig SAFETY HANDLING

Safe derived helper added:

```js
const execConfig = agent?.executionConfig || null
```

Prevents:
- null crashes
- undefined schema issues
- backward compatibility failures

---

# RUNTIME FIELD TYPES SUPPORTED

```txt
text
textarea
number
file
password
boolean
```

---

# SECRET FIELD SUPPORT

Secret fields render as:

```html
<input type="password" />
```

with:
- hidden values
- eye toggle
- masked display

---

# RUNTIME PAYLOAD STRUCTURE

Runtime execution payload now prepared dynamically:

```js
{
  method,
  contentType,
  headers,
  body,
  files
}
```

IMPORTANT:
Payload is prepared only.

Execution engine rewrite comes later.

---

# EXECUTION FLOW

Current flow:

```txt
Runtime UI
→ Runtime Payload Builder
→ Existing Text Execution API
```

Future flow:

```txt
Runtime UI
→ Runtime Payload Builder
→ Multipart Execution Engine
→ Dynamic Orchestrator
```

---

# BACKWARD COMPATIBILITY

Old agents:
- remain unchanged
- still use task textarea
- require no migration

This migration is fully backward compatible.

---

# CURRENT LIMITATIONS

Stage 3 does NOT yet:
- upload files to backend
- execute multipart requests
- inject headers dynamically
- execute schema-driven requests
- sanitize uploads server-side
- support dynamic orchestrator execution

Those are implemented in Stage 4.

---

# IMPORTANT SECURITY NOTES

## Current limitations

Files currently exist only in frontend memory.

Secrets currently:
- should never be logged
- should never persist locally

Further hardening required in future stages.

---

# IMPORTANT FUTURE IMPROVEMENTS

## Centralize runtime payload builder

Future recommended utility:

```txt
utils/buildRuntimePayload.js
```

to avoid duplicated execution logic later.

---

# File storage optimization

Future:
- useRef for raw file blobs
- React state only for previews/metadata

---

# Add upload restrictions

Future:
```txt
accept
maxSizeMB
```

support.

---

# Add validation-gated execution

Future:
disable EXECUTE when runtime validation fails.

---

# CURRENT SYSTEM CAPABILITIES

Creators can define:
- headers
- body fields
- file uploads
- runtime secrets
- request content types

Users can now:
- dynamically fill schemas
- upload files
- provide runtime headers
- prepare execution payloads

Execution engine still remains text-only internally.

---

# NEXT STAGE

Upcoming:
- multipart/form-data backend execution
- dynamic request builder
- orchestrator rewrite
- temp file handling
- upload limits
- SSRF protection
- runtime header injection
- secret redaction
- schema-driven request execution