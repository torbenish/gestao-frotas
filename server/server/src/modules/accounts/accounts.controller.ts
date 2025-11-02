import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from '@/common/pipes/zod-validation-pipe'
import { AccountsService } from './accounts.service'
import { CreateAccountDto } from './dto/create-account.dto'
import {
  CreateAccountSchema,
  createAccountSchema,
} from './schemas/create-account.schema'

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @UsePipes(new ZodValidationPipe(createAccountSchema))
  async create(@Body() body: CreateAccountSchema) {
    return this.accountsService.create(body)
  }
}
