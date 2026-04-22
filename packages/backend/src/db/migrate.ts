import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)
const __dirname = dirname(fileURLToPath(import.meta.url))

migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') })
  .then(() => { console.log('Migrations complete'); process.exit(0) })
  .catch(err => { console.error('Migration failed', err); process.exit(1) })
