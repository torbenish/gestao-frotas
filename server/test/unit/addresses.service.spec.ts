import { ConflictException, NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '@/infra/database/prisma.service'
import { AddressesService } from '@/modules/addresses/addresses.service'
import { CreateAddressSchema } from '@/modules/addresses/schemas/create-address.schema'

describe('AddressesService', () => {
  let service: AddressesService
  let prismaMock: {
    address: {
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    prismaMock = {
      address: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    }
    service = new AddressesService(prismaMock as unknown as PrismaService)
  })

  it('should create a new address', async () => {
    const addressData: CreateAddressSchema = {
      placeId: 'place-001',
      formattedAddress: 'Rua das Flores, Fortaleza, CE, Brasil',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'Ceará',
      postalCode: '60000-000',
      country: 'Brasil',
      latitude: -3.7,
      longitude: -38.5,
    }

    prismaMock.address.findUnique.mockResolvedValue(null)
    prismaMock.address.create.mockResolvedValueOnce({
      id: 'id-001',
      ...addressData,
    })

    const result = await service.create(addressData)
    expect(prismaMock.address.findUnique).toHaveBeenCalledWith({
      where: { placeId: 'place-001' },
    })
    expect(prismaMock.address.create).toHaveBeenCalledWith({
      data: addressData,
    })
    expect(result.placeId).toBe('place-001')
  })

  it('should throw ConflictException if address already exists', async () => {
    const addressData: CreateAddressSchema = {
      placeId: 'place-001',
      formattedAddress: 'Rua das Flores, Fortaleza, CE, Brasil',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'Ceará',
      postalCode: '60000-000',
      country: 'Brasil',
      latitude: -3.7,
      longitude: -38.5,
    }

    prismaMock.address.findUnique.mockResolvedValueOnce({ id: 'id-001' })

    await expect(service.create(addressData)).rejects.toThrow(ConflictException)
  })

  it('should throw NotFoundException if findById not found', async () => {
    prismaMock.address.findUnique.mockResolvedValueOnce(null)
    await expect(service.findById('notfound-id')).rejects.toThrow(
      NotFoundException
    )
  })
})
