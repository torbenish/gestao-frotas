import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { TripRequestController } from './trip-request.controller'
import { TripRequestService } from './trip-request.service'

@Module({
  controllers: [TripRequestController],
  providers: [TripRequestService, PrismaService],
})
export class TripRequestModule {}
