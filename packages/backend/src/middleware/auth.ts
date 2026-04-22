import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || typeof apiKey !== 'string') {
    return reply.code(401).send({ error: 'Missing API key' })
  }
  const [user] = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1)
  if (!user) {
    return reply.code(401).send({ error: 'Invalid API key' })
  }
  req.userId = user.id
}
