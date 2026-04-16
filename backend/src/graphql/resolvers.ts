import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { pool } from '../config/postgres'
import { Event } from '../models/Event'

const signToken = (id: string, email: string) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  })

const requireAuth = (context: any) => {
  if (!context?.user) throw new Error('Not authenticated')
  return context.user
}

export const rootResolver = {
  // ─── Queries ────────────────────────────────────────────
  me: async (_: any, context: any) => {
    const user = requireAuth(context)
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [user.id]
    )
    const row = result.rows[0]
    return { ...row, createdAt: row.created_at }
  },

  myProjects: async (_: any, context: any) => {
    const user = requireAuth(context)
    const result = await pool.query(
      'SELECT id, name, description, api_key, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )
    return result.rows.map((r) => ({
      ...r,
      apiKey: r.api_key,
      createdAt: r.created_at,
    }))
  },

  dashboardStats: async (
    { projectId, days = 7 }: { projectId: string; days: number },
    context: any
  ) => {
    requireAuth(context)

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [totalResult, sessionsResult, pagesResult, byDayResult] =
      await Promise.all([
        // Total events
        Event.countDocuments({ projectId, timestamp: { $gte: since } }),

        // Unique sessions
        Event.distinct('sessionId', { projectId, timestamp: { $gte: since } }),

        // Top pages
        Event.aggregate([
          { $match: { projectId, timestamp: { $gte: since } } },
          { $group: { _id: '$page', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),

        // Events by day
        Event.aggregate([
          { $match: { projectId, timestamp: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ])

    return {
      totalEvents: totalResult,
      uniqueSessions: sessionsResult.length,
      topPages: pagesResult.map((p) => ({ page: p._id, count: p.count })),
      eventsByDay: byDayResult.map((d) => ({ date: d._id, count: d.count })),
    }
  },

  // ─── Mutations ──────────────────────────────────────────
  register: async ({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
  }) => {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )
    if (existing.rows.length > 0) throw new Error('Email already registered')

    const hashed = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashed]
    )
    const user = result.rows[0]
    const token = signToken(user.id, user.email)
    return { token, user: { ...user, createdAt: user.created_at } }
  },

  login: async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    const result = await pool.query(
      'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
      [email]
    )
    if (result.rows.length === 0) throw new Error('Invalid credentials')

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid credentials')

    const token = signToken(user.id, user.email)
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
    }
  },

  createProject: async (
    { name, description }: { name: string; description?: string },
    context: any
  ) => {
    const user = requireAuth(context)
    const apiKey = crypto.randomBytes(32).toString('hex')
    const result = await pool.query(
      'INSERT INTO projects (name, description, user_id, api_key) VALUES ($1, $2, $3, $4) RETURNING id, name, description, api_key, created_at',
      [name, description || '', user.id, apiKey]
    )
    const row = result.rows[0]
    return { ...row, apiKey: row.api_key, createdAt: row.created_at }
  },
}