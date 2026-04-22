import type { FastifyInstance } from 'fastify'
import { db } from '../db/client.js'
import { categories } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth.js'

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware)

  app.get('/', async (req) =>
    db.select().from(categories).where(eq(categories.userId, req.userId))
  )

  app.post<{ Body: { name: string; hardMin: number; prefLow: number; prefHigh: number; hardMax: number } }>(
    '/', async (req, reply) => {
      const [cat] = await db.insert(categories)
        .values({ userId: req.userId, ...req.body })
        .returning()
      return reply.code(201).send(cat)
    }
  )

  app.put<{
    Params: { id: string }
    Body: Partial<{ name: string; hardMin: number; prefLow: number; prefHigh: number; hardMax: number }>
  }>('/:id', async (req, reply) => {
    const [cat] = await db.update(categories)
      .set(req.body)
      .where(and(eq(categories.id, req.params.id), eq(categories.userId, req.userId)))
      .returning()
    if (!cat) return reply.code(404).send({ error: 'Not found' })
    return cat
  })

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await db.delete(categories)
      .where(and(eq(categories.id, req.params.id), eq(categories.userId, req.userId)))
    return reply.code(204).send()
  })
}
