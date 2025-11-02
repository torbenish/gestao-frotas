import { ApiProperty } from '@nestjs/swagger'

export class CreateAddressDto {
  @ApiProperty({
    example: '12660850',
    description: 'Identificador único do endereço na API externa (placeId)',
  })
  placeId!: string

  @ApiProperty({
    example:
      'Avenida Visconde do Rio Branco, Centro, Fortaleza, CE, 60135-010, Brasil',
    description: 'Endereço formatado completo',
  })
  formattedAddress!: string

  @ApiProperty({
    example: 'Avenida Visconde do Rio Branco',
    description: 'Nome da rua',
    required: false,
  })
  street?: string

  @ApiProperty({
    example: '123',
    description: 'Número do endereço',
    required: false,
  })
  number?: string

  @ApiProperty({
    example: 'Apto 45',
    description: 'Complemento do endereço',
    required: false,
  })
  complement?: string

  @ApiProperty({ example: 'Centro', description: 'Bairro', required: false })
  neighborhood?: string

  @ApiProperty({ example: 'Fortaleza', description: 'Cidade' })
  city!: string

  @ApiProperty({ example: 'CE', description: 'Estado' })
  state!: string

  @ApiProperty({ example: '60135-010', description: 'CEP', required: false })
  postalCode?: string

  @ApiProperty({ example: 'Brasil', description: 'País' })
  country!: string

  @ApiProperty({ example: -3.7357214, description: 'Latitude' })
  latitude!: number

  @ApiProperty({ example: -38.5241542, description: 'Longitude' })
  longitude!: number
}
