import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '@/infra/database/prisma.service'
import { AccountsService } from '@/modules/accounts/accounts.service'
import { CreateAccountSchema } from '@/modules/accounts/schemas/create-account.schema'

describe('AccountsService', () => {
  let service: AccountsService
  let prismaMock: {
    user: {
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    }
    service = new AccountsService(prismaMock as unknown as PrismaService)
  })

  it('should create an account', async () => {
    const accountData: CreateAccountSchema = {
      name: 'John Doe',
      cpf: '71498994040',
      email: 'john@example.com',
      password: 'pw',
    }

    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce({
      id: 'id',
      ...accountData,
      password: 'hashed_password',
    })

    await service.create(accountData)

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: accountData.email },
    })
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: accountData.name,
        email: accountData.email,
        cpf: accountData.cpf,
        password: expect.any(String),
      },
    })
  })
})
