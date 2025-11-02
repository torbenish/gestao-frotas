import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        priority: true,
      },
      orderBy: { priority: 'desc' },
    })
  }
}
