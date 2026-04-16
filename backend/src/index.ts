import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createHandler } from 'graphql-http/lib/use/express'
import { connectPostgres, initTables } from './config/postgres'
import { connectMongo } from './config/mongo'
import { schema } from './graphql/schema'
import { rootResolver } from './graphql/resolvers'
import eventRoutes from './rest/eventRoutes'
import { authMiddleware } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// ─── Health check ────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'insightflow-backend' })
})

// ─── REST routes (event ingestion) ───────────────────────
app.use('/api', eventRoutes)

// ─── GraphQL endpoint ────────────────────────────────────
app.use(
  '/graphql',
  authMiddleware,
  createHandler({
    schema,
    rootValue: rootResolver,
    context: (req) => ({ user: (req.raw as any).user }),
  })
)

// ─── Start server ─────────────────────────────────────────
const start = async () => {
  await connectPostgres()
  await initTables()
  await connectMongo()
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`)
    console.log(`GraphQL at http://localhost:${PORT}/graphql`)
  })
}

start()