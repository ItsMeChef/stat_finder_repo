import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL
const PG_USER = process.env.PG_USER
const PG_HOST = process.env.PG_HOST
const PG_DATABASE = process.env.PG_DATABASE
const PG_PASSWORD = process.env.PG_PASSWORD
const PG_PORT = Number(process.env.PG_PORT)
const PG_SSL = String(process.env.PG_SSL) || ''

const pool = new Pool({
    connectionString: DATABASE_URL,
    // ssl: PG_SSL
})

export default pool