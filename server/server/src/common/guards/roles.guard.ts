import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lê roles permitidos da rota
    const requiredRoles = this.reflector.getAllAndMerge<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    // Se não há roles definidos, libera acesso
    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user
    // Checa se o usuário tem o role permitido
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado')
    }
    return true
  }
}
