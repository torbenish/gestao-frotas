import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { CurrentUser } from '@/common/decorators/current-user-decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ProfileService } from './profile.service'
import {
  UpdateProfileSchema,
  updateProfileSchema,
} from './schemas/update-profile'

@Controller('/me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: UserPayload) {
    const userId = user.sub
    return this.profileService.findById(userId)
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileSchema
  ) {
    const userId = user.sub
    return this.profileService.update(userId, body)
  }
}
