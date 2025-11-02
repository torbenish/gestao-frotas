import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma.service'
import { UpdateProfileSchema } from './schemas/update-profile'

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found.')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async update(id: string, data: UpdateProfileSchema) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!userExists) {
      throw new NotFoundException('User not found.')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    })

    const { password: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  }
}
