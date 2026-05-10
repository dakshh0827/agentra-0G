import { Router } from 'express'
import multer from 'multer'
import {
  executeAgent,
  composeAgents,
  getInteractions,
} from '../controllers/executionController.js'
import { authMiddleware } from '../middlewares/auth.js'
import { executionLimiter } from '../middlewares/rateLimiter.js'

// Store files in memory as buffers — never persist to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 10 MB per file
    files: 10,
  },
})

const router = Router()

// Execute agent — supports both JSON and multipart/form-data
router.post(
  '/agents/:id/execute',
  authMiddleware,
  executionLimiter,
  upload.any(), // multer parses multipart; falls through cleanly for JSON
  executeAgent
)

// Agent-to-agent composition
router.post('/agents/compose', authMiddleware, executionLimiter, composeAgents)

// Interaction history (public)
router.get('/agents/:id/interactions', getInteractions)

export default router