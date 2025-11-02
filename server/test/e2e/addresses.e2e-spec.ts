import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import request from 'supertest'
import { Role } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { createTestApp } from './setup-e2e'

describe('Address (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string
  let addressId: string

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
    jwt = app.get(JwtService)

    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        cpf: '78946513000',
        email: 'address@email.com',
        password: '123456',
        role: Role.ADMIN,
      },
    })

    accessToken = jwt.sign({ sub: user.id, role: user.role })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Create Address', () => {
    it('[POST] /addresses - should create address', async () => {
      const response = await request(app.getHttpServer())
        .post('/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          placeId: 'place-123',
          formattedAddress: 'Rua das Flores, Fortaleza, CE, Brasil',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'Fortaleza',
          state: 'Ceará',
          postalCode: '60000-000',
          country: 'Brasil',
          latitude: -3.7,
          longitude: -38.5,
        })

      expect(response.statusCode).toBe(201)
      expect(response.body.address).toBeDefined()
      expect(response.body.address.placeId).toBe('place-123')

      addressId = response.body.address.id
    })
  })

  describe('Get Address By ID', () => {
    it('[GET] /addresses/:id - should return the address', async () => {
      const response = await request(app.getHttpServer())
        .get(`/addresses/${addressId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body.address).toBeDefined()
      expect(response.body.address.id).toBe(addressId)
    })

    it('[GET] /addresses/:id - should return 404 if not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/addresses/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(404)
    })
  })
})
