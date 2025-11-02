import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { isValidUuid } from '@/utils/validate-uuid'
import { CreateAddressSchema } from './schemas/create-address.schema'

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAddressSchema) {
    const existing = await this.prisma.address.findUnique({
      where: { placeId: data.placeId },
    })
    if (existing) throw new ConflictException('Endereço já cadastrado.')

    return this.prisma.address.create({ data })
  }

  async search(query: string) {
    if (!query) return []

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.append('q', `${query} Ceará Brasil`)
    url.searchParams.append('format', 'json')
    url.searchParams.append('addressdetails', '1')
    url.searchParams.append('limit', '5')

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(
        `Nominatim API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  }

  async findById(id: string) {
    if (!isValidUuid(id)) {
      throw new NotFoundException('Endereço não encontrado')
    }

    const address = await this.prisma.address.findUnique({ where: { id } })
    if (!address) throw new NotFoundException('Endereço não encontrado')
    return address
  }
}
