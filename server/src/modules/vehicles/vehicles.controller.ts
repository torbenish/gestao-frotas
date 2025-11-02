import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user-decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  CreateVehicleSchema,
  createVehicleSchema,
} from './schemas/create-vehicle.schema'
import {
  PageQueryParamSchema,
  pageQueryParamSchema,
} from './schemas/fetch-recent-vehicles.schema'
import {
  UpdateVehicleSchema,
  updateVehicleSchema,
} from './schemas/update-vehicle.schema'
import { VehiclesService } from './vehicles.service'

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(createVehicleSchema)) body: CreateVehicleSchema,
    @CurrentUser() user: UserPayload
  ) {
    const vehicle = await this.vehiclesService.create(
      body,
      user.sub,
      user.departmentId ?? null
    )
    return { vehicle }
  }

  @Get()
  async fetchRecent(
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema
  ) {
    const vehicles = await this.vehiclesService.fetchRecent(page)
    return { vehicles }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const vehicle = await this.vehiclesService.findById(id)
    return { vehicle }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVehicleSchema)) body: UpdateVehicleSchema,
    @CurrentUser() user: UserPayload
  ) {
    const vehicle = await this.vehiclesService.update(
      id,
      body,
      user.sub,
      user.departmentId ?? null
    )
    return { vehicle }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    await this.vehiclesService.delete(
      id,
      user.sub,
      user.departmentId ?? null
    )
  }
}
