import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { AddressesService } from './addresses.service'
import { CreateAddressDto } from './dto/create-address.dto'
import {
  CreateAddressSchema,
  createAddressSchema,
} from './schemas/create-address.schema'

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressService: AddressesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Endereço cadastrado com sucesso.' })
  @ApiBody({ type: CreateAddressDto })
  async create(
    @Body(new ZodValidationPipe(createAddressSchema)) body: CreateAddressSchema
  ) {
    const address = await this.addressService.create(body)
    return { address }
  }

  @Get('search')
  @ApiQuery({ name: 'q', description: 'Critério de busca', required: true })
  @ApiOkResponse({ description: 'Lista de endereços encontrados.' })
  async search(@Query('q') q: string) {
    const results = await this.addressService.search(q)
    return { results }
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiOkResponse({ description: 'Retorna o endereço encontrado.' })
  async findById(@Param('id') id: string) {
    const address = await this.addressService.findById(id)
    return { address }
  }
}
