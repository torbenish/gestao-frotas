import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  email!: string

  @ApiProperty({ example: 'suaSenha123' })
  password!: string
}
