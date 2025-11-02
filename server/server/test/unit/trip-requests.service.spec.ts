import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TripStatus, TripType } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { TripRequestService } from '@/modules/trip-requests/trip-request.service'

describe('TripRequestsService', () => {
  let service: TripRequestService
  let prismaMock: {
    tripRequest: {
      create: ReturnType<typeof vi.fn>
      findUnique: ReturnType<typeof vi.fn>
    }
    address: {
      findUnique: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    prismaMock = {
      tripRequest: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      address: {
        findUnique: vi.fn(),
      },
    }
    service = new TripRequestService(prismaMock as unknown as PrismaService)
  })

  it('should create a trip request when address exists', async () => {
    const addressId = 'be390e44-3493-486a-9f2c-e250e7c86349'
    const tripData = {
      startAddressId: addressId,
      tripType: TripType.ONE_WAY,
      scheduledDeparture: new Date(),
      reason: 'Viagem de teste',
      requesterId: '77a85e5e-9b56-49bc-bfbc-2f3374a53775',
      status: TripStatus.PENDING,
    }

    prismaMock.address.findUnique.mockResolvedValueOnce({ id: addressId })
    prismaMock.tripRequest.create.mockResolvedValueOnce({
      id: 'trip-uuid-1',
      ...tripData,
    })

    const result = await service.create(tripData)
    expect(result.id).toBe('trip-uuid-1')
  })

  it('should throw NotFoundException if address does not exist', async () => {
    prismaMock.address.findUnique.mockResolvedValueOnce(null)
    await expect(
      service.create({
        startAddressId: 'nonexistent-address',
        tripType: TripType.ONE_WAY,
        scheduledDeparture: new Date(),
        reason: 'Teste',
        requesterId: 'uuid',
        status: TripStatus.PENDING,
      })
    ).rejects.toThrow(NotFoundException)
  })

  it('should find trip request by id', async () => {
    prismaMock.tripRequest.findUnique.mockResolvedValueOnce({ id: 'trip-xyz' })
    const result = await service.findById('trip-xyz')
    expect(result.id).toBe('trip-xyz')
  })

  it('should throw NotFoundException if trip request not found', async () => {
    prismaMock.tripRequest.findUnique.mockResolvedValueOnce(null)
    await expect(service.findById('notfound')).rejects.toThrow(
      NotFoundException
    )
  })
})
