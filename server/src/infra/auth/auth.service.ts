import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { PrismaService } from '@/infra/database/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async authenticate(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { department: true },
    })
    if (!user) {
      throw new UnauthorizedException('User credentials do not match')
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials do not match')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        signInCount: {
          increment: 1,
        },
        lastLoginAt: new Date(),
      },
      include: { department: true },
    })

    const payload = {
      sub: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
      departmentId: updatedUser.departmentId ?? null,
      departmentName: updatedUser.department?.name ?? null,
      departmentCode: updatedUser.department?.code ?? null,
      name: updatedUser.name,
    }

    const accessToken = this.jwtService.sign(payload)
    return { access_token: accessToken }
  }
}
