import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'
import { EnvSchema } from '@/env'
import { Role } from '@/generated/client'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.nativeEnum(Role),
  email: z.string().email().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  departmentName: z.string().min(1).nullable().optional(),
  departmentCode: z.string().min(1).nullable().optional(),
  name: z.string().min(1).nullable().optional(),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<EnvSchema, true>) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
