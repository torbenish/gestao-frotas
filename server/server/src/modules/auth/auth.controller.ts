import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '@/common/decorators/current-user-decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { AuthService } from '@/infra/auth/auth.service'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { AuthenticateDto } from './dto/authenticate.dto'
import {
  AuthenticateSchema,
  authenticateSchema,
} from './schemas/authenticate.schema'

@ApiTags('auth')
@Controller('auth')
export class AuthenticateController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentica o usuário e retorna o token JWT' })
  @ApiBody({ type: AuthenticateDto })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso, token retornado',
  })
  @UsePipes(new ZodValidationPipe(authenticateSchema))
  async login(@Body() body: AuthenticateSchema) {
    return this.authService.authenticate(body.email, body.password)
  }
  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserPayload) {
    return {
      id: user.sub,
      role: user.role,
      departmentId: user.departmentId ?? null,
      departmentName: user.departmentName ?? null,
    }
  }
}
