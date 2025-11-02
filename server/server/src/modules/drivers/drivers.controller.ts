import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '@/common/decorators/current-user-decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { DriversService } from './drivers.service'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import {
  CreateDriverSchema,
  createDriverSchema,
} from './schemas/create-driver.schema'
import {
  UpdateDriverSchema,
  updateDriverSchema,
} from './schemas/update-driver-schema'

@ApiTags('drivers')
@ApiBearerAuth()
@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiBody({ type: CreateDriverDto })
  @ApiResponse({ status: 201, description: 'Driver created successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Driver with given CPF or CNH already exists.',
  })
  async create(
    @Body(new ZodValidationPipe(createDriverSchema)) body: CreateDriverSchema,
    @CurrentUser() user: UserPayload
  ) {
    const driver = await this.driversService.create(
      body,
      user.sub,
      user.departmentId ?? null
    )
    return { driver }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver UUID' })
  @ApiResponse({ status: 200, description: 'Driver found.' })
  @ApiResponse({ status: 404, description: 'Driver not found.' })
  async findById(@Param('id') id: string) {
    const driver = await this.driversService.findById(id)
    return { driver }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver UUID' })
  @ApiBody({ type: UpdateDriverDto })
  @ApiResponse({ status: 200, description: 'Driver updated successfully.' })
  @ApiResponse({ status: 404, description: 'Driver not found.' })
  @ApiResponse({
    status: 409,
    description: 'Driver with given CPF or CNH already exists.',
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDriverSchema)) body: UpdateDriverSchema,
    @CurrentUser() user: UserPayload
  ) {
    const driver = await this.driversService.update(
      id,
      body,
      user.sub,
      user.departmentId ?? null
    )
    return { driver }
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver UUID' })
  @ApiResponse({ status: 204, description: 'Driver deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Driver not found.' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    await this.driversService.delete(
      id,
      user.sub,
      user.departmentId ?? null // ✅
    )
  }
}
