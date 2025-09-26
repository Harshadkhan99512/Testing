import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  REFRESH_SECRET: z.string().min(16, 'REFRESH_SECRET must be at least 16 characters'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_DIR: z.string().default('apps/api/uploads')
})

export const env = envSchema.parse(process.env)