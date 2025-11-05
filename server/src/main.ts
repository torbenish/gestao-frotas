import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { EnvSchema } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService: ConfigService<EnvSchema, true> = app.get(ConfigService)

  const isProd = process.env.NODE_ENV === 'production'

  const frontendUrl = configService.get('FRONTEND_URL', { infer: true })

  app.enableCors({
    origin: isProd ? frontendUrl : 'http://localhost:3000',
    credentials: true,
  })

  const port = configService.get('PORT', { infer: true })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fleet Management API')
    .setDescription('Documentação da API de gestão de frotas')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('accounts')
    .addTag('vehicles')
    .addTag('drivers')
    .addTag('trip-requests')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Fleet API Docs',
    explorer: true,
  })

  await app.listen(port)
  console.log(`🚗 Server running at http://localhost:${port}`)
  console.log(
    `🌐 CORS liberado para: ${isProd ? frontendUrl : 'http://localhost:3000'}`
  )
  console.log(`📘 Swagger docs available at http://localhost:${port}/api`)
}
bootstrap()
