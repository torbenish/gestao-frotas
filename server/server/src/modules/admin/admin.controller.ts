import { Controller, Get, UseGuards } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles('MANAGER', 'ADMIN') // Apenas MANAGER e ADMIN autorizados
  getAdminResource() {
    return { message: 'Acesso liberado para perfis MANAGER e ADMIN' }
  }
}
