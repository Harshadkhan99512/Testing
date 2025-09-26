import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/db'

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, password: hashed, role: 'ADMIN' },
    update: {}
  })

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      name: 'Admin',
      title: 'Portfolio Owner',
      bio: 'Welcome to my 3D portfolio!',
      socialLinks: {}
    },
    update: {}
  })

  console.log('Seeded admin user:', email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })