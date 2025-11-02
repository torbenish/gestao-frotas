import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { isValidUuid } from '@/utils/validate-uuid'
import { CreateDriverSchema } from './schemas/create-driver.schema'
import { UpdateDriverSchema } from './schemas/update-driver-schema'

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateDriverSchema,
    userId: string,
    departmentId?: string | null
  ) {
    const { cpf, cnh } = data

    const existingCpf = await this.prisma.driver.findUnique({ where: { cpf } })
    if (existingCpf)
      throw new ConflictException('A driver with this CPF already exists.')

    const existingCnh = await this.prisma.driver.findUnique({ where: { cnh } })
    if (existingCnh)
      throw new ConflictException('A driver with this CNH already exists.')

    const driver = await this.prisma.driver.create({ data })

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Driver',
        entityId: driver.id,
        newData: driver,
        userId,
        departmentId,
      },
    })

    return driver
  }

  async findById(id: string) {
    if (!isValidUuid(id)) throw new NotFoundException('Driver not found')

    const driver = await this.prisma.driver.findUnique({ where: { id } })
    if (!driver) throw new NotFoundException('Driver not found')

    return driver
  }

  async update(
    id: string,
    data: UpdateDriverSchema,
    userId: string,
    departmentId?: string | null
  ) {
    if (!isValidUuid(id)) throw new NotFoundException('Driver not found')

    const driver = await this.prisma.driver.findUnique({ where: { id } })
    if (!driver) throw new NotFoundException('Driver not found')

    // Check CPF
    if (data.cpf && data.cpf !== driver.cpf) {
      const exists = await this.prisma.driver.findUnique({
        where: { cpf: data.cpf },
      })
      if (exists)
        throw new ConflictException('Driver with this CPF already exists.')
    }

    // Check CNH
    if (data.cnh && data.cnh !== driver.cnh) {
      const exists = await this.prisma.driver.findUnique({
        where: { cnh: data.cnh },
      })
      if (exists)
        throw new ConflictException('Driver with this CNH already exists.')
    }

    const updated = await this.prisma.driver.update({
      where: { id },
      data,
    })

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Driver',
        entityId: updated.id,
        oldData: driver,
        newData: updated,
        userId,
        departmentId,
      },
    })

    return updated
  }

  async delete(id: string, userId: string, departmentId?: string | null) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Driver not found')
    }

    const driver = await this.prisma.driver.findUnique({ where: { id } })
    if (!driver) {
      throw new NotFoundException('Driver not found')
    }

    await this.prisma.driver.delete({ where: { id } })

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Driver',
        entityId: id,
        oldData: driver,
        userId,
        departmentId,
      },
    })

    return { message: 'Driver deleted successfully' }
  }
}
