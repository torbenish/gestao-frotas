import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import request from 'supertest'
import { Role } from '@/generated/client'
import { PrismaService } from '@/infra/database/prisma.service'
import { createTestApp } from './setup-e2e'

describe('Vehicle (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string
  let vehicleId: string

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
    jwt = app.get(JwtService)

    // Cria usuário admin e token uma vez para todos os testes
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        cpf: '71498994040',
        email: 'johndoe@example.com',
        password: '123456',
        role: Role.ADMIN,
      },
    })

    accessToken = jwt.sign({ sub: user.id, role: user.role })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Create Vehicle', () => {
    it('[POST] /vehicles - should create a new vehicle', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          plate: 'ABC1D23',
          model: 'Model S',
          year: 2023,
          color: 'Midnight Silver',
          chassi: '5YJSA1DN5CFP01728',
          renavam: '12345678901',
          mileage: 1500.5,
          fuelType: 'ELECTRIC',
          transmission: 'AUTOMATIC',
        })

      expect(response.statusCode).toBe(201)
      expect(response.body.vehicle).toBeDefined()
      expect(response.body.vehicle.id).toBeDefined()

      // Salva o id para usar nos testes de update
      vehicleId = response.body.vehicle.id

      const vehicleOnDatabase = await prisma.vehicle.findFirst({
        where: { plate: 'ABC1D23' },
      })

      expect(vehicleOnDatabase).toBeTruthy()
    })
  })

  describe('Update Vehicle', () => {
    it('[PATCH] /vehicles/:id - should update vehicle partially', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_USE',
          color: 'Black',
          mileage: 2500,
        })

      expect(response.statusCode).toBe(200)
      expect(response.body.vehicle).toBeDefined()
      expect(response.body.vehicle.status).toBe('IN_USE')
      expect(response.body.vehicle.color).toBe('Black')
      expect(response.body.vehicle.mileage).toBe(2500)
    })

    it('[PATCH] /vehicles/:id - should return 404 if vehicle does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/vehicles/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'AVAILABLE' })

      expect(response.statusCode).toBe(404)
      expect(response.body.message).toContain('Vehicle not found')
    })

    it('[PATCH] /vehicles/:id - should throw conflict on duplicate plate', async () => {
      await prisma.vehicle.create({
        data: {
          plate: 'DUPL123',
          model: 'Other Model',
          year: 2023,
          color: 'Red',
          chassi: '5YJSA1DN5CFP01999',
          renavam: '98765432109',
          mileage: 1000,
          fuelType: 'DIESEL',
          transmission: 'AUTOMATIC',
        },
      })

      const conflictResponse = await request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ plate: 'DUPL123' })

      expect(conflictResponse.statusCode).toBe(409)
      expect(conflictResponse.body.message).toContain(
        'Vehicle with this plate already exists.'
      )
    })
  })

  describe('Delete Vehicle', () => {
    it('[DELETE] /vehicles/:id - should delete an existing vehicle', async () => {
      // Deleta o veículo criado anteriormente
      const response = await request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)

      // Verifica se o veículo foi realmente apagado do banco
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      })
      expect(vehicle).toBeNull()
    })

    it('[DELETE] /vehicles/:id - should return 404 for not found vehicle', async () => {
      const response = await request(app.getHttpServer())
        .delete('/vehicles/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(404)
      expect(response.body.message).toContain('Vehicle not found')
    })
  })
})
