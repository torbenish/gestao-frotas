import { ConflictException, Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { PrismaService } from '@/infra/database/prisma.service'
import { CreateAccountSchema } from './schemas/create-account.schema'

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create({
    name,
    email,
    cpf,
    password,
    departmentId,
  }: CreateAccountSchema) {
    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('User with the same e-mail already exists')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        departmentId: departmentId ?? null,
      },
    })
  }
}
