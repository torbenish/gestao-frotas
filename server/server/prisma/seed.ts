import { PrismaClient } from '@/generated/client'
import { seedDepartments } from './seeds/departmentSeed'
import { seedUsers } from './seeds/userSeed'

const prisma = new PrismaClient()

async function main() {
  await seedDepartments()
  await seedUsers()
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
