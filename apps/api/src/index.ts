import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import staticPlugin from '@fastify/static'
import { env } from './env'
import { prisma } from './db'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import projectRoutes from './routes/projects'
import assetRoutes from './routes/assets'
import analyticsRoutes from './routes/analytics'

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
})

app.register(cors, { origin: env.CORS_ORIGIN })
app.register(helmet)
app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
app.register(multipart)
app.register(staticPlugin, { root: env.UPLOAD_DIR, prefix: '/uploads/' })
app.register(jwt, { secret: env.JWT_SECRET })

app.decorate('prisma', prisma)

app.get('/api/health', async () => ({ status: 'ok' }))

app.register(authRoutes, { prefix: '/api/auth' })
app.register(profileRoutes, { prefix: '/api/profile' })
app.register(projectRoutes, { prefix: '/api/projects' })
app.register(assetRoutes, { prefix: '/api/assets' })
app.register(analyticsRoutes, { prefix: '/api/analytics' })

app.listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`API listening on port ${env.PORT}`)
  })
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma
  }
}