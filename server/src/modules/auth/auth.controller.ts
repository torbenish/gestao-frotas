import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
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
import { Response } from 'express'
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
  async login(
    @Body() body: AuthenticateSchema,
    @Res({ passthrough: true }) response: Response
  ) {
    const { access_token } = await this.authService.authenticate(
      body.email,
      body.password
    )
    response.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      sameSite: 'strict',
      // maxAge: 60 * 60 * 24 * 7, // Opcional: define a validade (ex: 7 dias)
    })

    return { access_token }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desloga o usuário e limpa cookies de autenticação',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso e cookies limpos',
    schema: {
      example: { message: 'Logged out successfully' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado / token inválido',
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao processar logout',
    schema: {
      example: { message: 'Failed to log out' },
    },
  })
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() _user: UserPayload,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      // --- opcional: revogar refresh token no DB/Redis ---
      // await this.authService.revokeRefreshTokenForUser(user.sub)

      // Limpa cookies de autenticação
      res.clearCookie('refreshToken', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
      })

      res.clearCookie('auth_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
      })

      return { message: 'Logged out successfully' }
    } catch (_err) {
      // log do erro (opcional: usar Logger)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Failed to log out',
      })
    }
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
      email: user.email,
      departmentId: user.departmentId ?? null,
      departmentName: user.departmentName ?? null,
      departmentCode: user.departmentCode ?? null,
      name: user.name ?? null,
    }
  }
}
