import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db'
import { env } from '../env'
import jwtLib from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
})

export default async function authRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid credentials payload' })
    }
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return reply.status(401).send({ error: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return reply.status(401).send({ error: 'Invalid email or password' })

    const accessToken = await app.jwt.sign({ id: user.id, role: user.role }, { expiresIn: '15m' })
    const refreshToken = jwtLib.sign({ id: user.id, role: user.role }, env.REFRESH_SECRET, { expiresIn: '7d' })

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken }
    })

    return reply.send({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    })
  })

  app.post('/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid refresh payload' })
    }
    const { refreshToken } = parsed.data
    try {
      const payload = jwtLib.verify(refreshToken, env.REFRESH_SECRET) as { id: string; role: 'ADMIN' | 'USER' }
      const tokenRow = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
      if (!tokenRow || tokenRow.revoked) return reply.status(401).send({ error: 'Refresh token revoked or invalid' })

      const newAccess = await app.jwt.sign({ id: payload.id, role: payload.role }, { expiresIn: '15m' })
      return reply.send({ accessToken: newAccess })
    } catch {
      return reply.status(401).send({ error: 'Invalid refresh token' })
    }
  })

  app.post('/logout', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid logout payload' })
    }
    const { refreshToken } = parsed.data
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true }
    })
    return reply.send({ success: true })
  })
}