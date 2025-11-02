import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import request from 'supertest'
import { Role } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { createTestApp } from './setup-e2e'

describe('Driver (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string
  let driverId: string

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
    jwt = app.get(JwtService)

    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '11122233344',
        email: 'admin@example.com',
        password: '123456',
        role: Role.ADMIN,
      },
    })

    accessToken = jwt.sign({ sub: user.id, role: user.role })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Create Driver', () => {
    it('[POST] /drivers - should create a new driver', async () => {
      const response = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'João da Silva',
          cpf: '12345678901',
          cnh: '12345678910',
          cnhType: 'B',
          cnhValid: '2028-05-10T00:00:00.000Z',
          phone: '+55 85 98888-7777',
          notes: 'Motorista experiente',
          status: 'AVAILABLE',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body.driver).toBeDefined()
      expect(response.body.driver.id).toBeDefined()

      driverId = response.body.driver.id

      const driverOnDatabase = await prisma.driver.findFirst({
        where: { cpf: '12345678901' },
      })
      expect(driverOnDatabase).toBeTruthy()
    })
  })

  describe('Update Driver', () => {
    it('[PATCH] /drivers/:id - should update driver partially', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          phone: '+55 85 97777-6666',
          status: 'ON_TRIP',
        })

      expect(response.statusCode).toBe(200)
      expect(response.body.driver).toBeDefined()
      expect(response.body.driver.status).toBe('ON_TRIP')
      expect(response.body.driver.phone).toBe('+55 85 97777-6666')
    })

    it('[PATCH] /drivers/:id - should return 404 if driver does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/drivers/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'AVAILABLE' })

      expect(response.statusCode).toBe(404)
      expect(response.body.message).toContain('Driver not found')
    })

    it('[PATCH] /drivers/:id - should throw conflict on duplicate CPF', async () => {
      await prisma.driver.create({
        data: {
          name: 'Outro Motorista',
          cpf: '98765432100',
          cnh: '98765432109',
          cnhType: 'C',
        },
      })

      const conflictResponse = await request(app.getHttpServer())
        .patch(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cpf: '98765432100' })

      expect(conflictResponse.statusCode).toBe(409)
      expect(conflictResponse.body.message).toContain(
        'Driver with this CPF already exists.'
      )
    })
  })

  describe('Delete Driver', () => {
    it('[DELETE] /drivers/:id - should delete an existing driver', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/drivers/${driverId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)

      const driver = await prisma.driver.findUnique({ where: { id: driverId } })
      expect(driver).toBeNull()
    })

    it('[DELETE] /drivers/:id - should return 404 for not found driver', async () => {
      const response = await request(app.getHttpServer())
        .delete('/drivers/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(404)
      expect(response.body.message).toContain('Driver not found')
    })
  })
})
