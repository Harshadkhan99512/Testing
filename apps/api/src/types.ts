import type { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      role: 'ADMIN' | 'USER'
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string
      role: 'ADMIN' | 'USER'
    }
    user: {
      id: string
      role: 'ADMIN' | 'USER'
    }
  }
}