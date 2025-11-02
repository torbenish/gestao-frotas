import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { DriversController } from './drivers.controller'
import { DriversService } from './drivers.service'

@Module({
  controllers: [DriversController],
  providers: [DriversService, PrismaService],
})
export class DriversModule {}
