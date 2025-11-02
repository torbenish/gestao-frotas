import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './infra/auth/auth.module'
import { AccountsModule } from './modules/accounts/accounts.module'
import { AddressModule } from './modules/addresses/addresses.module'
import { AdminModule } from './modules/admin/admin.module'
import { DriversModule } from './modules/drivers/drivers.module'
import { ProfileModule } from './modules/profile/profile.module'
import { TripRequestModule } from './modules/trip-requests/trip-request.module'
import { VehiclesModule } from './modules/vehicles/vehicles.module'
import { DepartmentsModule } from './modules/departments/departments.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: env => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    AccountsModule,
    AdminModule,
    VehiclesModule,
    DriversModule,
    AddressModule,
    TripRequestModule,
    ProfileModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
