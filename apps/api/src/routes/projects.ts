import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db'

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string().url(),
  images: z.array(z.string().url()).default([]),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  model3D: z.string().url().optional()
})

export default async function projectRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.get('/', async (request) => {
    const userId = request.user.id
    const profile = await prisma.profile.findUnique({ where: { userId } })
    if (!profile) return { projects: [] }
    const projects = await prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }]
    })
    return { projects }
  })

  app.post('/', async (request, reply) => {
    const parsed = projectSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid project payload' })
    const userId = request.user.id
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, name: 'New User', title: 'Title', bio: '', socialLinks: {} },
      update: {}
    })
    const created = await prisma.project.create({
      data: { profileId: profile.id, ...parsed.data }
    })
    return { project: created }
  })

  app.put('/:id', async (request, reply) => {
    const params = request.params as { id: string }
    const parsed = projectSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid project payload' })
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: parsed.data
    })
    return { project: updated }
  })

  app.delete('/:id', async (request) => {
    const params = request.params as { id: string }
    await prisma.project.delete({ where: { id: params.id } })
    return { success: true }
  })
}