import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DepartmentsService } from './departments.service'

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List active departments' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async findAll() {
    const departments = await this.departmentsService.findAllActive()
    return { departments }
  }
}
