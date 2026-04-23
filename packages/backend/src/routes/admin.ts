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
    db.select({ id: users.id, name: users.name, apiKey: users.apiKey, active: users.active, createdAt: users.createdAt }).from(users)
  )

  app.post<{ Body: { name: string } }>('/users', async (req, reply) => {
    const [user] = await db.insert(users)
      .values({ name: req.body.name, apiKey: randomUUID() })
      .returning({ id: users.id, name: users.name, apiKey: users.apiKey, active: users.active, createdAt: users.createdAt })
    return reply.code(201).send(user)
  })

  app.patch<{ Params: { id: string }; Body: { active: boolean } }>('/users/:id/active', async (req, reply) => {
    const [user] = await db.update(users)
      .set({ active: req.body.active })
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, name: users.name, apiKey: users.apiKey, active: users.active, createdAt: users.createdAt })
    if (!user) return reply.code(404).send({ error: 'Not found' })
    return user
  })

  app.delete<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    await db.delete(users).where(eq(users.id, req.params.id))
    return reply.code(204).send()
  })
}
