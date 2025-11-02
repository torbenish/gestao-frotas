import { ApiProperty } from '@nestjs/swagger'

export class CreateAccountDto {
  @ApiProperty({ example: 'Ana Lima', description: 'Nome do usuário' })
  name!: string

  @ApiProperty({
    example: 'ana@sde.ce.gov.br',
    description: 'E-mail corporativo',
  })
  email!: string

  @ApiProperty({ example: '12345678900', description: 'CPF do funcionário' })
  cpf!: string

  @ApiProperty({ example: '123456', description: 'Senha de acesso' })
  password!: string
}
