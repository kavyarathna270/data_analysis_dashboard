import { Router, Request, Response } from 'express'
import { Event } from '../models/Event'
import { pool } from '../config/postgres'

const router = Router()

// POST /api/events — ingest a tracking event
// Called by frontend tracker with project api_key
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { apiKey, eventType, page, userId, sessionId, metadata } = req.body

    if (!apiKey || !eventType || !page || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate api key belongs to a real project
    const result = await pool.query(
      'SELECT id FROM projects WHERE api_key = $1',
      [apiKey]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    const projectId = result.rows[0].id

    const event = await Event.create({
      projectId,
      eventType,
      page,
      userId,
      sessionId,
      metadata: metadata || {},
    })

    res.status(201).json({ success: true, eventId: event._id })
  } catch (err) {
    console.error('Event ingestion error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/events/recent/:projectId — latest 20 events
router.get('/events/recent/:projectId', async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ projectId: req.params.projectId })
      .sort({ timestamp: -1 })
      .limit(20)

    res.json(events)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router