import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@thinking-agents.de' },
    update: {},
    create: {
      email: 'admin@thinking-agents.de',
      name: 'Admin',
      passwordHash,
    },
  })

  console.log('Seed completed: admin@thinking-agents.de / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
