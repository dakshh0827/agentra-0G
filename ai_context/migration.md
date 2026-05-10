# Agentra Execution Config Migration

# OVERVIEW

Agentra is being upgraded from a simple text-only AI execution marketplace into a universal AI API execution platform supporting:

- multipart/form-data
- dynamic request headers
- runtime secrets
- file uploads
- configurable execution schemas
- multimodal AI APIs

The migration is being implemented incrementally in stages.

---

# IMPORTANT ARCHITECTURE RULES

## Solidity contracts remain unchanged

Execution schemas are execution-layer metadata and remain:
- off-chain
- stored in Prisma
- included in metadataURI JSON

Contracts continue handling:
- ownership
- pricing
- access control
- metadata URI
- deployment lifecycle

---

# STAGE 1 — BACKEND EXECUTION CONFIG SUPPORT

## STATUS

✅ COMPLETE

---

# DATABASE CHANGES

## File

```txt
backend/prisma/schema.prisma
```

## Added

```prisma
executionConfig Json?
```

inside Agent model.

Final structure:

```prisma
mcpSchema       Json?
executionConfig Json?
isVerified      Boolean       @default(false)
```

---

# WHY A SINGLE JSON FIELD IS USED

Instead of multiple columns:

```prisma
headers Json?
bodyFields Json?
contentType String?
method String?
```

a single portable execution schema object is stored:

```json
{
  "method": "POST",
  "contentType": "form-data",
  "headers": [],
  "bodyFields": []
}
```

Benefits:
- extensible
- schema-driven
- frontend-renderable
- orchestration-ready
- metadata-portable
- backward compatible

---

# PRISMA COMMANDS

```bash
npx prisma generate
npx prisma db push
```

IMPORTANT:

Do NOT use:

```bash
npx prisma migrate dev
```

because MongoDB uses db push.

---

# BACKEND VALIDATION

## File

```txt
backend/controllers/agentController.js
```

---

# Added Validation Schemas

## Supported Content Types

```ts
json
form-data
x-www-form-urlencoded
```

---

# Supported Field Types

```ts
text
textarea
number
file
password
boolean
```

---

# Validation Rules

Added:
- duplicate key prevention
- field count limits
- regex-safe identifiers
- optional execution config
- strict enums

---

# executionConfig Added To

## deploySchema

```ts
executionConfig: executionConfigSchema.optional()
```

---

# executionConfig Stored In

- metadata payload
- database-only deploys
- blockchain draft deploys

---

# Agent Service Updated

## File

```txt
backend/services/agentService.js
```

Added:

```ts
'executionConfig'
```

to allowed update fields.

---

# BACKWARD COMPATIBILITY

Old agents:
- remain functional
- remain text-only
- require no migration

Fallback behavior:

```json
{
  "task": "..."
}
```

---

# STAGE 2 — DEPLOYSTUDIO EXECUTION SCHEMA BUILDER

## STATUS

✅ COMPLETE

---

# OBJECTIVE

Allow agent creators to visually define:

- request content type
- headers
- body fields
- file uploads
- runtime secrets
- validation metadata

without coding.

---

# FILES MODIFIED

## Main UI

```txt
frontend/src/pages/DeployStudio.jsx
```

## API Layer

```txt
frontend/src/api/agents.js
```

---

# DEPLOYSTUDIO FLOW UPDATED

DeployStudio now contains:

```txt
1. Mode
2. Identity
3. Endpoint
4. Metadata
5. Pricing
6. Exec Config
7. Deploy
```

---

# executionConfig FRONTEND STATE

```js
executionConfig: {
  method: 'POST',
  contentType: 'json',
  headers: [],
  bodyFields: [],
}
```

---

# CONTENT TYPES SUPPORTED

```txt
json
form-data
x-www-form-urlencoded
```

---

# HEADER BUILDER SUPPORTS

```js
{
  key,
  value,
  required,
  secret,
  userProvided,
  placeholder,
  description
}
```

---

# BODY FIELD BUILDER SUPPORTS

```js
{
  key,
  type,
  required,
  userProvided,
  placeholder,
  description
}
```

---

# FIELD TYPES SUPPORTED

```txt
text
textarea
number
file
password
boolean
```

---

# REUSABLE COMPONENTS CREATED

## HeaderRow

Dynamic header editor.

---

## BodyFieldRow

Dynamic body field editor.

---

## ExecConfigPreview

Live JSON preview panel.

---

# VALIDATION IMPLEMENTED

Frontend validation includes:
- duplicate keys
- field count limits
- invalid identifiers
- required field checks

---

# LIVE PREVIEW

Execution schema preview added using existing neon/code styling.

---

# DEPLOY PAYLOAD UPDATED

executionConfig now included in deploy payload:

```js
executionConfig: data.executionConfig || undefined
```

---

# OPTIONAL CONFIG BEHAVIOR

executionConfig is only sent when:
- headers exist
OR
- body fields exist

Otherwise:
- agent behaves as text-only

---

# IMPORTANT SECURITY NOTES

## Current limitation

Creators can still manually enter secret values.

This must be improved in future stages.

Secrets should NEVER be permanently stored.

Future rule:

```js
if (secret === true) {
  value = ''
  userProvided = true
}
```

---

# IMPORTANT FUTURE IMPROVEMENTS

## Add stable UUIDs to rows

Current implementation uses:

```js
key={index}
```

Should later use:

```js
key={row.id}
```

to avoid React dynamic list issues.

---

# Add file restrictions

Future schema additions:

```js
accept
maxSizeMB
```

for uploaded files.

---

# Add request method selector

Currently:
```txt
POST only
```

Future:
```txt
GET
POST
PUT
PATCH
DELETE
```

---

# Add validation-gated navigation

Currently:
errors display visually but do not block progression.

Future:
disable NEXT STEP when invalid.

---

# CURRENT SYSTEM CAPABILITIES

Agent creators can now define:
- dynamic headers
- file fields
- text fields
- runtime secrets
- request content types

Execution engine support is NOT implemented yet.

---

# NEXT STAGE

Upcoming:
- AgentDetails dynamic execution UI
- multipart request execution
- dynamic orchestrator
- runtime file uploads
- secret injection
- SSRF protection
- temp file cleanup
- upload validation