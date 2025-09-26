import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../db'
import { env } from '../env'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default async function assetRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  app.post('/upload', async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'No file uploaded' })

    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream' // some glb/gltf mime types
    ]
    if (!allowed.includes(data.mimetype)) {
      return reply.code(400).send({ error: 'Invalid file type' })
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true })
    const ext = data.filename.split('.').pop()?.toLowerCase() || 'bin'
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = join(env.UPLOAD_DIR, filename)

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filepath)
      data.file.pipe(stream)
      stream.on('finish', () => resolve())
      stream.on('error', (e) => reject(e))
    })

    const url = `/uploads/${filename}`
    const asset = await prisma.asset.create({
      data: {
        userId: request.user.id,
        url,
        type: data.mimetype,
        size: data.file.bytesRead ?? 0
      }
    })

    return { asset }
  })

  app.get('/', async (request) => {
    const assets = await prisma.asset.findMany({ where: { userId: request.user.id }, orderBy: { createdAt: 'desc' } })
    return { assets }
  })

  app.delete('/:id', async (request) => {
    const params = request.params as { id: string }
    await prisma.asset.delete({ where: { id: params.id } })
    return { success: true }
  })
}