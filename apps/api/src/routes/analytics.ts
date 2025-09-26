import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function analyticsRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.get('/visitors', async () => {
    return {
      visitors: [
        { date: '2025-09-20', count: 123 },
        { date: '2025-09-21', count: 178 },
        { date: '2025-09-22', count: 205 }
      ]
    }
  })

  app.get('/interactions', async () => {
    return {
      interactions: [
        { type: 'model-hover', count: 512 },
        { type: 'carousel-swipe', count: 267 },
        { type: 'contact-submit', count: 12 }
      ]
    }
  })
}