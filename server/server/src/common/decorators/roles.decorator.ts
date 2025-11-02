import { SetMetadata } from '@nestjs/common'

// Exemplo de uso: @Roles('ADMIN', 'MANAGER')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
