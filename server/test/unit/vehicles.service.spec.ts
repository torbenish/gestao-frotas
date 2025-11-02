import { ConflictException, NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { CreateVehicleSchema } from '@/modules/vehicles/schemas/create-vehicle.schema'
import { UpdateVehicleSchema } from '@/modules/vehicles/schemas/update-vehicle.schema'
import { VehiclesService } from '@/modules/vehicles/vehicles.service'

describe('VehiclesService', () => {
  let service: VehiclesService
  let prismaMock: {
    vehicle: {
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
      vehicle: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    }
    service = new VehiclesService(prismaMock as unknown as PrismaService)
  })

  it('should create a new vehicle', async () => {
    const vehicleData: CreateVehicleSchema = {
      plate: 'ABC1D23',
      brand: 'Tesla',
      model: 'Model S',
      vehicleType: VehicleType.CAR,
      year: new Date().getFullYear(),
      color: 'Midnight Silver',
      chassi: '5YJSA1DN5CFP01728',
      renavam: '12345678901',
      mileage: 1500.5,
      fuelConsumption: 20.5,
      fuelType: FuelType.ELECTRIC,
      transmission: TransmissionType.AUTOMATIC,
      notes: 'Veículo de teste',
      status: VehicleStatus.AVAILABLE,
      lastMaintenance: new Date('2024-07-01'),
      nextMaintenance: new Date('2024-12-01'),
    }

    prismaMock.vehicle.findUnique.mockResolvedValue(null)
    prismaMock.vehicle.create.mockResolvedValueOnce({
      id: 'vehicle-1',
      ...vehicleData,
    })
    prismaMock.auditLog.create.mockResolvedValueOnce({})

    const result = await service.create(vehicleData, 'some-user-id', null)

    expect(prismaMock.vehicle.findUnique).toHaveBeenCalledTimes(3)
    expect(prismaMock.vehicle.create).toHaveBeenCalledWith({
      data: vehicleData,
    })
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: 'vehicle-1',
        userId: 'some-user-id',
      })
    )
    expect(result.plate).toBe(vehicleData.plate)
  })

  describe('update', () => {
    it('should update the vehicle and log audit', async () => {
      const vehicleId = 'vehicle-123'
      const existingVehicle = {
        id: vehicleId,
        plate: 'ABC1234',
        chassi: 'CHASSI123',
        renavam: 'RENAVAM123',
        status: 'AVAILABLE',
        color: 'Prata',
        model: 'Gol',
      }

      prismaMock.vehicle.findUnique.mockResolvedValueOnce(existingVehicle) // busca pelo id
      prismaMock.vehicle.findUnique.mockResolvedValue(null) // checagem duplicidade plate/chassi/renavam
      prismaMock.vehicle.update.mockResolvedValueOnce({
        ...existingVehicle,
        status: 'IN_USE',
        color: 'Preto',
      })
      prismaMock.auditLog.create.mockResolvedValueOnce({})

      const updateData: UpdateVehicleSchema = {
        status: 'IN_USE',
        color: 'Preto',
      }

      const result = await service.update(vehicleId, updateData, 'user-1', null)

      expect(prismaMock.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId },
      })
      expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
        where: { id: vehicleId },
        data: updateData,
      })
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          entity: 'Vehicle',
          entityId: vehicleId,
          oldData: existingVehicle,
          newData: expect.objectContaining(updateData),
          userId: 'user-1',
        })
      )
      expect(result.status).toBe('IN_USE')
      expect(result.color).toBe('Preto')
    })

    it('should throw NotFoundException if vehicle does not exist', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValueOnce(null) // busca pelo id

      const updateData: UpdateVehicleSchema = { status: 'IN_USE' }

      await expect(
        service.update('vehicle-x', updateData, 'user-1', null)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ConflictException on duplicate plate', async () => {
      const vehicleId = 'vehicle-123'
      const existingVehicle = {
        id: vehicleId,
        plate: 'ABC1234',
        chassi: 'CHASSI123',
        renavam: 'RENAVAM123',
      }
      prismaMock.vehicle.findUnique
        .mockResolvedValueOnce(existingVehicle) // pelo id
        .mockResolvedValueOnce({ id: 'vehicle-999', plate: 'DUPLICATE' }) // busca duplicado plate

      const updateData: UpdateVehicleSchema = { plate: 'DUPLICATE' }

      await expect(
        service.update(vehicleId, updateData, 'user-1', null)
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('delete', () => {
    it('should delete a vehicle and log audit', async () => {
      const vehicleId = 'vehicle-123'
      const existingVehicle = {
        id: vehicleId,
        plate: 'ABC1234',
        chassi: 'CHASSI123',
        renavam: 'RENAVAM123',
      }

      prismaMock.vehicle.findUnique.mockResolvedValueOnce(existingVehicle)
      prismaMock.vehicle.delete.mockResolvedValueOnce(existingVehicle)
      prismaMock.auditLog.create.mockResolvedValueOnce({})

      const result = await service.delete(vehicleId, 'user-1', null)

      expect(prismaMock.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: vehicleId },
      })
      expect(prismaMock.vehicle.delete).toHaveBeenCalledWith({
        where: { id: vehicleId },
      })
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          entity: 'Vehicle',
          entityId: vehicleId,
          oldData: existingVehicle,
          userId: 'user-1',
        })
      )
      expect(result).toEqual({ message: 'Vehicle deleted successfully' })
    })

    it('should throw NotFoundException if vehicle not found', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValueOnce(null)

      await expect(service.delete('vehicle-x', 'user-1', null)).rejects.toThrow(
        NotFoundException
      )
    })
  })
})
