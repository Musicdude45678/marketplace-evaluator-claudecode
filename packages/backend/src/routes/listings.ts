import type { FastifyInstance } from 'fastify'
import { db } from '../db/client.js'
import { listings } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth.js'

export async function listingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware)

  app.get('/', async (req) =>
    db.select().from(listings).where(eq(listings.userId, req.userId))
  )

  app.post<{
    Body: {
      categoryId?: string | null; name: string; price?: number | null
      conditionScore?: number; riskScore?: number; fitScore?: number
      notes?: string; listingUrl?: string; thumbnailUrl?: string; fbListingId?: string | null
    }
  }>('/', async (req, reply) => {
    const [listing] = await db.insert(listings)
      .values({ userId: req.userId, ...req.body })
      .returning()
    return reply.code(201).send(listing)
  })

  app.put<{
    Params: { id: string }
    Body: Partial<{
      categoryId: string | null; name: string; price: number | null
      conditionScore: number; riskScore: number; fitScore: number
      notes: string; listingUrl: string; thumbnailUrl: string; fbListingId: string | null
    }>
  }>('/:id', async (req, reply) => {
    const [listing] = await db.update(listings)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(listings.id, req.params.id), eq(listings.userId, req.userId)))
      .returning()
    if (!listing) return reply.code(404).send({ error: 'Not found' })
    return listing
  })

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await db.delete(listings)
      .where(and(eq(listings.id, req.params.id), eq(listings.userId, req.userId)))
    return reply.code(204).send()
  })
}
