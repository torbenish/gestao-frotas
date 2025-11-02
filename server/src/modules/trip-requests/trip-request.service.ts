import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { isValidUuid } from '@/utils/validate-uuid'
import { CreateTripRequestSchema } from './schemas/create-trip-request.schema'
import { ValidateTripRequestSchema } from './schemas/validate-trip-request'

@Injectable()
export class TripRequestService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTripRequestSchema) {
    if (!isValidUuid(data.startAddressId)) {
      throw new NotFoundException('Endereço de partida não encontrado')
    }

    const start = await this.prisma.address.findUnique({
      where: { id: data.startAddressId },
    })
    if (!start) {
      throw new NotFoundException('Endereço de partida não encontrado')
    }

    if (data.endAddressId) {
      if (!isValidUuid(data.endAddressId)) {
        throw new NotFoundException('Endereço de destino inválido')
      }
      const end = await this.prisma.address.findUnique({
        where: { id: data.endAddressId },
      })
      if (!end) {
        throw new NotFoundException('Endereço de destino não encontrado')
      }
    }

    const tripRequest = await this.prisma.tripRequest.create({
      data: {
        startAddressId: data.startAddressId,
        endAddressId: data.endAddressId ?? null,
        tripType: data.tripType,
        scheduledDeparture: new Date(data.scheduledDeparture),
        scheduledReturn: data.scheduledReturn
          ? new Date(data.scheduledReturn)
          : null,
        reason: data.reason,
        passengers: data.passengers,
        notes: data.notes,
        status: data.status ?? 'PENDING',
        requesterId: data.requesterId,
        approverId: data.approverId ?? null,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
        driverId: data.driverId ?? null,
        vehicleId: data.vehicleId ?? null,
      },
    })

    return tripRequest
  }

  async findById(id: string) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Solicitação de viagem não encontrada')
    }

    const trip = await this.prisma.tripRequest.findUnique({ where: { id } })
    if (!trip) {
      throw new NotFoundException('Solicitação de viagem não encontrada')
    }
    return trip
  }

  async validateTripRequest(
    id: string,
    data: ValidateTripRequestSchema,
    currentUser: { id: string; role: string }
  ) {
    if (!isValidUuid(id) || !isValidUuid(data.approverId)) {
      throw new NotFoundException(
        'Solicitação de viagem ou aprovador não encontrado'
      )
    }

    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Somente administradores podem validar solicitações.'
      )
    }

    const tripRequest = await this.prisma.tripRequest.findUnique({
      where: { id },
    })
    if (!tripRequest)
      throw new NotFoundException('Solicitação de viagem não encontrada')

    if (tripRequest.status !== 'PENDING') {
      throw new ForbiddenException(
        'A solicitação já foi validada anteriormente.'
      )
    }

    if (data.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: data.driverId },
      })
      if (!driver || driver.status !== 'AVAILABLE') {
        throw new NotFoundException('Motorista não encontrado ou indisponível')
      }
    }

    if (data.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
      })
      if (!vehicle || vehicle.status !== 'AVAILABLE') {
        throw new NotFoundException('Veículo não encontrado ou indisponível')
      }
    }

    return this.prisma.tripRequest.update({
      where: { id },
      data: {
        status: data.status,
        approverId: data.approverId,
        approvedAt: new Date(),
        driverId: data.driverId ?? null,
        vehicleId: data.vehicleId ?? null,
      },
    })
  }
}
