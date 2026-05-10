# Agentra Dynamic Execution Payload Migration

## Goal

Upgrade Agentra from simple text-only AI execution into a fully dynamic API execution platform supporting:

- JSON body requests
- multipart/form-data requests
- x-www-form-urlencoded requests
- file uploads
- dynamic headers
- secure runtime secrets
- configurable execution schemas

This enables deployment of advanced FastAPI agents requiring:
- file uploads
- API keys
- multipart forms
- custom headers

Examples:
- Jobber AI
- Video processing agents
- Media AI pipelines
- Resume analyzers
- RAG systems
- Voice cloning APIs

---

# IMPORTANT ARCHITECTURAL RULES

## DO NOT MODIFY SMART CONTRACTS

Execution schemas remain:
- off-chain
- stored in Prisma
- included in metadataURI JSON

The Solidity contract remains unchanged.

---

# STAGE 1 — DATABASE MIGRATION

## Modify Prisma Agent model

Add:

```prisma
executionConfig Json?
```

Generate migration.

---

# STAGE 2 — EXECUTION CONFIG TYPES

Create shared types:

```ts
type ExecutionContentType =
  | 'json'
  | 'form-data'
  | 'x-www-form-urlencoded'

type ExecutionFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'file'
  | 'password'
  | 'boolean'

interface ExecutionHeaderField {
  key: string
  value?: string
  required: boolean
  secret: boolean
  userProvided: boolean
  placeholder?: string
  description?: string
}

interface ExecutionBodyField {
  key: string
  type: ExecutionFieldType
  required: boolean
  userProvided: boolean
  placeholder?: string
  description?: string
}

interface ExecutionConfig {
  method: 'POST'
  contentType: ExecutionContentType
  headers: ExecutionHeaderField[]
  bodyFields: ExecutionBodyField[]
}
```

---

# STAGE 3 — DEPLOY BACKEND

Modify deploySchema:

Add:
```ts
executionConfig: z.object(...)
```

Persist:
- Prisma
- metadata payload upload

Ensure validation:
- max field counts
- safe key names
- no duplicate fields
- valid content types

---

# STAGE 4 — DEPLOYSTUDIO FRONTEND

Add new deploy step:
"Execution Config"

Creator can:
- choose content type
- add/remove headers
- add/remove form fields
- set field type
- mark required
- mark secret
- mark userProvided

Add dynamic builders.

Add preview JSON panel.

---

# STAGE 5 — AGENT DETAILS EXECUTION UI

Replace current:
single textarea task input

With:
dynamic execution renderer.

Rules:

## JSON agents
Render:
- task textarea
- dynamic fields

## multipart/form-data agents
Render:
- file uploads
- text fields
- password fields

## Secret fields
Use:
```html
<input type="password" />
```

Do NOT persist secrets locally.

---

# STAGE 6 — EXECUTION API

Current:
```ts
POST /agents/:id/execute
{
  task: string
}
```

New:
Support:

```ts
multipart/form-data
```

and:

```json
{
  "task": "...",
  "headers": {},
  "body": {}
}
```

Execution route must:
- parse multipart uploads
- validate required fields
- validate file sizes
- validate mime types
- sanitize input

---

# STAGE 7 — ORCHESTRATOR REWRITE

Current orchestrator assumes text-only requests.

Rewrite execution layer to dynamically construct requests based on executionConfig.

Implementation rules:

## JSON
Use:
```ts
axios.post(url, jsonBody)
```

## multipart/form-data
Use:
```ts
const formData = new FormData()
```

Append:
- files
- text fields

Inject headers dynamically.

---

# STAGE 8 — FILE HANDLING

Requirements:

- temp file storage only
- automatic cleanup
- configurable max upload size
- mime validation
- antivirus-ready abstraction

Never:
- permanently store uploads
- expose temp paths

---

# STAGE 9 — SECURITY

Mandatory:

## Redact secrets in logs

Never log:
- Authorization
- API keys
- tokens

## Prevent SSRF

Validate endpoints:
- no localhost
- no internal IPs
- no metadata URLs

## Restrict file uploads

Whitelist:
- pdf
- docx
- png
- jpg
- mp4
- txt

---

# STAGE 10 — BACKWARD COMPATIBILITY

Old agents without executionConfig:
must continue working normally.

Fallback behavior:
```ts
{
  task: string
}
```

---

# STAGE 11 — TESTING

Test:
- JSON requests
- multipart requests
- file uploads
- secret headers
- failed validation
- huge files
- missing fields

Use provided FastAPI examples as integration targets.

---

# STAGE 12 — FINAL POLISH

Add:
- loading states
- upload progress
- better error messages
- schema preview
- execution request preview
- request debugging panel

Ensure:
- TypeScript strict compatibility
- no any types
- no duplicated logic
- reusable form renderer