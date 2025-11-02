import { ApiProperty } from '@nestjs/swagger'

export class UpdateDriverDto {
  @ApiProperty({ example: 'João Silva', required: false })
  name?: string

  @ApiProperty({ example: '12345678901', required: false })
  cpf?: string

  @ApiProperty({ example: '12345678901', required: false })
  cnh?: string

  @ApiProperty({
    example: 'B',
    enum: ['A', 'B', 'C', 'D', 'E'],
    required: false,
  })
  cnhType?: string

  @ApiProperty({ example: '2027-12-31T00:00:00.000Z', required: false })
  cnhValid?: string

  @ApiProperty({ example: '(85) 99999-9999', required: false })
  phone?: string

  @ApiProperty({ example: 'Motorista experiente', required: false })
  notes?: string

  @ApiProperty({
    example: 'AVAILABLE',
    enum: ['AVAILABLE', 'ON_TRIP', 'INACTIVE'],
    required: false,
  })
  status?: string
}
