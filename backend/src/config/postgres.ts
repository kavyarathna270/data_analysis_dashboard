import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export const connectPostgres = async () => {
  try {
    await pool.query('SELECT 1')
    console.log('✅ PostgreSQL connected')
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err)
    process.exit(1)
  }
}

// Create tables if they don't exist
export const initTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      api_key VARCHAR(64) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('✅ PostgreSQL tables ready')
}