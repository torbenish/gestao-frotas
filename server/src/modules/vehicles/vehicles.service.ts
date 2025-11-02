import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { isValidUuid } from '@/utils/validate-uuid'
import { CreateVehicleSchema } from './schemas/create-vehicle.schema'
import { UpdateVehicleSchema } from './schemas/update-vehicle.schema'

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateVehicleSchema,
    userId: string,
    departmentId?: string | null
  ) {
    const { plate, chassi, renavam } = data

    const existingPlate = await this.prisma.vehicle.findUnique({
      where: { plate },
    })
    if (existingPlate)
      throw new ConflictException('A vehicle with this plate already exists.')

    const existingChassi = await this.prisma.vehicle.findUnique({
      where: { chassi },
    })
    if (existingChassi)
      throw new ConflictException('A vehicle with this chassi already exists.')

    const existingRenavam = await this.prisma.vehicle.findUnique({
      where: { renavam },
    })
    if (existingRenavam)
      throw new ConflictException('A vehicle with this renavam already exists.')

    const vehicle = await this.prisma.vehicle.create({
      data,
    })

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        newData: vehicle,
        userId,
        departmentId,
      },
    })

    return vehicle
  }

  async findById(id: string) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Vehicle not found')
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) throw new NotFoundException('Vehicle not found')
    return vehicle
  }

  async fetchRecent(page: number) {
    const perPage = 20
    return this.prisma.vehicle.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(
    id: string,
    data: UpdateVehicleSchema,
    userId: string,
    departmentId?: string | null
  ) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Vehicle not found')
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) throw new NotFoundException('Vehicle not found')

    if (data.plate && data.plate !== vehicle.plate) {
      const exists = await this.prisma.vehicle.findUnique({
        where: { plate: data.plate },
      })
      if (exists)
        throw new ConflictException('Vehicle with this plate already exists.')
    }

    if (data.chassi && data.chassi !== vehicle.chassi) {
      const exists = await this.prisma.vehicle.findUnique({
        where: { chassi: data.chassi },
      })
      if (exists)
        throw new ConflictException('Vehicle with this chassi already exists.')
    }

    if (data.renavam && data.renavam !== vehicle.renavam) {
      const exists = await this.prisma.vehicle.findUnique({
        where: { renavam: data.renavam },
      })
      if (exists)
        throw new ConflictException('Vehicle with this renavam already exists.')
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data,
    })

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Vehicle',
        entityId: updated.id,
        oldData: vehicle,
        newData: updated,
        userId,
        departmentId,
      },
    })

    return updated
  }

  async delete(id: string, userId: string, departmentId?: string | null) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Vehicle not found')
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } })

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found')
    }

    await this.prisma.vehicle.delete({ where: { id } })

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Vehicle',
        entityId: id,
        oldData: vehicle,
        userId,
        departmentId,
      },
    })

    return { message: 'Vehicle deleted successfully' }
  }
}
