import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import staticFiles from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { categoryRoutes } from './routes/categories.js'
import { listingRoutes } from './routes/listings.js'
import { adminRoutes } from './routes/admin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(categoryRoutes, { prefix: '/api/categories' })
await app.register(listingRoutes,  { prefix: '/api/listings' })
await app.register(adminRoutes,    { prefix: '/api/admin' })

const frontendDist = process.env.FRONTEND_DIST
  ? join(process.cwd(), process.env.FRONTEND_DIST)
  : join(__dirname, '../../frontend/dist')

await app.register(staticFiles, { root: frontendDist, prefix: '/' })
app.setNotFoundHandler((_req, reply) => { reply.sendFile('index.html') })

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

app.listen({ port, host }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
