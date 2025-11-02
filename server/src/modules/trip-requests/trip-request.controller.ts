import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user-decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  CreateTripRequestSchema,
  createTripRequestSchema,
} from './schemas/create-trip-request.schema'
import {
  ValidateTripRequestSchema,
  validateTripRequestSchema,
} from './schemas/validate-trip-request'
import { TripRequestService } from './trip-request.service'

@Controller('trip-requests')
@UseGuards(JwtAuthGuard)
export class TripRequestController {
  constructor(private tripRequestService: TripRequestService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createTripRequestSchema))
    body: CreateTripRequestSchema
  ) {
    const tripRequest = await this.tripRequestService.create(body)
    return { tripRequest }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const tripRequest = await this.tripRequestService.findById(id)
    return { tripRequest }
  }

  @Patch(':id/validate')
  async validate(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(validateTripRequestSchema))
    body: ValidateTripRequestSchema,
    @CurrentUser() user: UserPayload
  ) {
    const userForService = { id: user.sub, role: user.role }

    const tripRequest = await this.tripRequestService.validateTripRequest(
      id,
      body,
      userForService
    )
    return { tripRequest }
  }
}
