import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { AddressesController } from './addresses.controller'
import { AddressesService } from './addresses.service'

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, PrismaService],
})
export class AddressModule {}
