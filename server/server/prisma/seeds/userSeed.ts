import { Prisma, PrismaClient, Role } from '@/generated/client'

const prisma = new PrismaClient()

export async function seedUsers() {
  const department = await prisma.department.findUnique({
    where: {
      name: 'Secretaria Executiva de Planejamento e Gestão Interna',
    },
  })

  if (!department) {
    console.error(
      'Erro no seed: Departamento "Assessoria de Controle Interno e Ouvidoria" não encontrado.'
    )
    return
  }

  const users = [
    {
      name: 'Administrador',
      email: 'admin@email.com',
      cpf: '58931550090',
      password: '$2y$10$kLTAVtvfpmb2joRXUFd.vOLq1t7lBk3MH1YOYE30voVA5cq81ihRC', //123456
      role: Role.ADMIN,
      departmentId: department.id,
    },
  ]

  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        console.log(`CPF ${user.cpf} já existe. Pulando...`)
      } else {
        throw e
      }
    }
  }

  console.log('Usuários adicionados com sucesso.')
}
