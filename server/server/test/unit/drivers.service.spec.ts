import { ConflictException, NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CNHType, DriverStatus } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { DriversService } from '@/modules/drivers/drivers.service'
import { CreateDriverSchema } from '@/modules/drivers/schemas/create-driver.schema'
import { UpdateDriverSchema } from '@/modules/drivers/schemas/update-driver-schema'

describe('DriversService', () => {
  let service: DriversService
  let prismaMock: {
    driver: {
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
      delete: ReturnType<typeof vi.fn>
    }
    auditLog: {
      create: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    prismaMock = {
      driver: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    }
    service = new DriversService(prismaMock as unknown as PrismaService)
  })

  it('should create a new driver', async () => {
    const driverData: CreateDriverSchema = {
      name: 'João da Silva',
      cpf: '12345678901',
      cnh: '12345678910',
      cnhType: CNHType.B,
      phone: '+55 85 98888-7777',
      notes: 'Motorista de teste',
      status: DriverStatus.AVAILABLE,
      cnhValid: new Date('2028-05-10'),
    }

    prismaMock.driver.findUnique.mockResolvedValue(null)
    prismaMock.driver.create.mockResolvedValueOnce({
      id: 'driver-1',
      ...driverData,
    })
    prismaMock.auditLog.create.mockResolvedValueOnce({})

    const result = await service.create(driverData, 'user-1', null)

    expect(prismaMock.driver.findUnique).toHaveBeenCalledTimes(2)
    expect(prismaMock.driver.create).toHaveBeenCalledWith({ data: driverData })
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entity: 'Driver',
        entityId: 'driver-1',
        userId: 'user-1',
      })
    )
    expect(result.cpf).toBe(driverData.cpf)
  })

  describe('update', () => {
    it('should update the driver and log audit', async () => {
      const driverId = 'driver-123'
      const existingDriver = {
        id: driverId,
        cpf: '12345678901',
        cnh: '12345678910',
        cnhType: 'B',
        status: 'AVAILABLE',
        phone: '+55 85 98888-7777',
      }

      prismaMock.driver.findUnique.mockResolvedValueOnce(existingDriver) // busca pelo id
      prismaMock.driver.findUnique.mockResolvedValue(null) // checagem dup
      prismaMock.driver.update.mockResolvedValueOnce({
        ...existingDriver,
        status: 'ON_TRIP',
      })
      prismaMock.auditLog.create.mockResolvedValueOnce({})

      const updateData: UpdateDriverSchema = { status: 'ON_TRIP' }

      const result = await service.update(driverId, updateData, 'user-1', null)

      expect(prismaMock.driver.update).toHaveBeenCalledWith({
        where: { id: driverId },
        data: updateData,
      })
      expect(result.status).toBe('ON_TRIP')
    })

    it('should throw NotFoundException if driver does not exist', async () => {
      prismaMock.driver.findUnique.mockResolvedValueOnce(null)

      await expect(
        service.update('driver-x', { status: 'AVAILABLE' }, 'user-1', null)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ConflictException on duplicate CPF', async () => {
      const driverId = 'driver-123'
      const existingDriver = {
        id: driverId,
        cpf: '12345678901',
        cnh: '12345678910',
        cnhType: 'B',
      }

      prismaMock.driver.findUnique
        .mockResolvedValueOnce(existingDriver) // pelo id
        .mockResolvedValueOnce({ id: 'driver-999', cpf: '99999999999' })

      await expect(
        service.update(driverId, { cpf: '99999999999' }, 'user-1', null)
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('delete', () => {
    it('should delete a driver and log audit', async () => {
      const driverId = 'driver-123'
      const existingDriver = {
        id: driverId,
        cpf: '12345678901',
        cnh: '12345678910',
      }

      prismaMock.driver.findUnique.mockResolvedValueOnce(existingDriver)
      prismaMock.driver.delete.mockResolvedValueOnce(existingDriver)
      prismaMock.auditLog.create.mockResolvedValueOnce({})

      const result = await service.delete(driverId, 'user-1', null)

      expect(prismaMock.driver.delete).toHaveBeenCalledWith({
        where: { id: driverId },
      })
      expect(result).toEqual({ message: 'Driver deleted successfully' })
    })

    it('should throw NotFoundException if driver not found', async () => {
      prismaMock.driver.findUnique.mockResolvedValueOnce(null)

      await expect(service.delete('driver-x', 'user-1', null)).rejects.toThrow(
        NotFoundException
      )
    })
  })
})
