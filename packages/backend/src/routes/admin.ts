import type { FastifyInstance } from 'fastify'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const ADMIN_KEY = process.env.ADMIN_KEY

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (req, reply) => {
    if (!ADMIN_KEY || req.headers['x-admin-key'] !== ADMIN_KEY) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
  })

  app.get('/users', async () =>
    db.select({ id: users.id, name: users.name, apiKey: users.apiKey, createdAt: users.createdAt }).from(users)
  )

  app.post<{ Body: { name: string } }>('/users', async (req, reply) => {
    const [user] = await db.insert(users)
      .values({ name: req.body.name, apiKey: randomUUID() })
      .returning()
    return reply.code(201).send(user)
  })

  app.delete<{ Params: { id: string } }>('/users/:id', async (_req, reply) => {
    await db.delete(users).where(eq(users.id, _req.params.id))
    return reply.code(204).send()
  })
}
