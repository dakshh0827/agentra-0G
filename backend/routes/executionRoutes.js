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
    files: 5,
    fields: 50,
    headerPairs: 100,
  },
})

const router = Router()

// Execute agent — supports both JSON and multipart/form-data
router.post(
  '/agents/:id/execute',
  authMiddleware,
  executionLimiter,
  (req, res, next) => {
    // Block oversized JSON payloads before multer
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('multipart/form-data')) {
      const bodySize = parseInt(req.headers['content-length'] || '0')
      if (bodySize > 5 * 1024 * 1024) {
        return res.status(413).json({ error: 'Request payload too large (max 5MB for JSON)' })
      }
    }
    next()
  },
  upload.any(),
  executeAgent
)

// Agent-to-agent composition
router.post('/agents/compose', authMiddleware, executionLimiter, composeAgents)

// Interaction history (public)
router.get('/agents/:id/interactions', getInteractions)

export default router