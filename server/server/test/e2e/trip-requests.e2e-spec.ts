import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import request from 'supertest'
import { Role, TripStatus, TripType } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { createTestApp } from './setup-e2e'

describe('TripRequests (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string
  let tripRequestId: string
  let addressId: string
  let userId: string

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
    jwt = app.get(JwtService)

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        name: 'Solicitante',
        cpf: '12345678900',
        email: 'solicitante@teste.com',
        password: '123456',
        role: Role.ADMIN,
      },
    })
    userId = user.id
    accessToken = jwt.sign({ sub: user.id, role: user.role })

    // Cria endereço
    const address = await prisma.address.create({
      data: {
        placeId: 'fake-place-id-x',
        formattedAddress: 'Rua Exemplo, Ceará, Brasil',
        city: 'Sobral',
        state: 'Ceará',
        country: 'Brasil',
        latitude: -3.6,
        longitude: -39.6,
      },
    })
    addressId = address.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /trip-requests - should create trip request', async () => {
    const response = await request(app.getHttpServer())
      .post('/trip-requests') // plural
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        startAddressId: addressId,
        tripType: TripType.ONE_WAY,
        scheduledDeparture: new Date().toISOString(),
        reason: 'Transporte para reunião',
        requesterId: userId,
        status: TripStatus.PENDING,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.tripRequest).toBeDefined()
    expect(response.body.tripRequest.startAddressId).toBe(addressId)
    tripRequestId = response.body.tripRequest.id
  })

  it('[GET] /trip-requests/:id - should fetch trip request', async () => {
    const response = await request(app.getHttpServer())
      .get(`/trip-requests/${tripRequestId}`) // plural
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.tripRequest.id).toBe(tripRequestId)
    expect(response.body.tripRequest.startAddressId).toBe(addressId)
  })

  it('[GET] /trip-requests/:id - should return 404 if not found', async () => {
    const response = await request(app.getHttpServer())
      .get('/trip-requests/nonexistent-id')
      .set('Authorization', `Bearer ${accessToken}`)

    expect([404, 400]).toContain(response.statusCode) 
  })
})
