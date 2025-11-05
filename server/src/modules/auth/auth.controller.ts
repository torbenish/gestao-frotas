import {
  Body,
  Controller,
  Get,
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

    // 5. Defina o cookie httpOnly
    response.cookie('auth_token', access_token, {
      httpOnly: true, // Impede acesso via JavaScript no cliente
      secure: process.env.NODE_ENV !== 'development', // Use 'true' em produção (HTTPS)
      path: '/', // O cookie estará disponível em todo o site
      sameSite: 'strict', // Ajuda a prevenir CSRF
      // maxAge: 60 * 60 * 24 * 7, // Opcional: define a validade (ex: 7 dias)
    })

    // 6. Retorne o token no corpo (para o client-side)
    // Isso é importante! Manter isso permite que seu
    // 'sign-in-form.tsx' e o 'axios.ts' continuem
    // funcionando para chamadas de API no client-side.
    return { access_token }
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
