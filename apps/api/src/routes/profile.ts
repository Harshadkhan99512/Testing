import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db'
import { env } from '../env'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  socialLinks: z.record(z.string()).default({})
})

export default async function profileRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.get('/', async (request) => {
    const userId = request.user.id
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: true,
        projects: true,
        experiences: true,
        testimonials: true,
        settings3D: true
      }
    })
    return { profile }
  })

  app.put('/', async (request, reply) => {
    const parsed = profileSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid profile payload' })
    }
    const userId = request.user.id
    const { name, title, bio, socialLinks } = parsed.data

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, name, title, bio, socialLinks },
      update: { name, title, bio, socialLinks }
    })
    return { profile }
  })

  app.post('/avatar', async (request, reply) => {
    const userId = request.user.id
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'No file uploaded' })

    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(data.mimetype)) {
      return reply.code(400).send({ error: 'Invalid file type' })
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true })
    const filename = `avatar_${userId}_${Date.now()}.${data.filename.split('.').pop()}`
    const filepath = join(env.UPLOAD_DIR, filename)
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filepath)
      data.file.pipe(stream)
      stream.on('finish', () => resolve())
      stream.on('error', (e) => reject(e))
    })

    const avatarUrl = `/uploads/${filename}`
    await prisma.profile.updateMany({
      where: { userId },
      data: { avatar: avatarUrl }
    })

    return { url: avatarUrl }
  })
}