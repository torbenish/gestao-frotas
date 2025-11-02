import { PrismaClient } from '@/generated/client'

const prisma = new PrismaClient()

export async function seedDepartments() {
  const departments = [
    {
      name: 'Gabinete',
      // code: 'Gabinete',
      isActive: true,
      priority: 1,
    },
    {
      name: 'Secretaria Executiva do Agronegócio',
      code: 'AGR',
      isActive: true,
      priority: 2,
    },
    {
      name: 'Secretaria Executiva da Indústria',
      code: 'IND',
      isActive: true,
      priority: 3,
    },
    {
      name: 'Secretaria Executiva de Comércio, Serviço e Inovação',
      code: 'CSI',
      isActive: true,
      priority: 4,
    },
    {
      name: 'Secretaria Executiva de Planejamento e Gestão Interna',
      code: 'PGI, COPLA, COAFI, COGEP e COTEC',
      isActive: true,
      priority: 5,
    },
    {
      name: 'Assessoria Jurídica',
      code: 'ASJUR',
      isActive: true,
      priority: 6,
    },
    {
      name: 'Assessoria de Controle Interno e Ouvidoria',
      code: 'ASCOU',
      isActive: true,
      priority: 7,
    },
    {
      name: 'Assessoria de Comunicação',
      code: 'ASCOM',
      isActive: true,
      priority: 8,
    },
  ]

  for (const department of departments) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: {},
      create: department,
    })
  }

  console.log('Departamentos adicionados com sucesso.')
}
