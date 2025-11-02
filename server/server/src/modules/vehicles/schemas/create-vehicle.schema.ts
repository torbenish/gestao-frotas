import { z } from 'zod'
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from '@/generated/client'

export const createVehicleSchema = z.object({
  plate: z.string().min(7).max(8),
  brand: z.string().optional(),
  model: z.string().min(1),
  vehicleType: z.nativeEnum(VehicleType).default(VehicleType.CAR),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  chassi: z.string().length(17),
  renavam: z.string().length(11),
  mileage: z.number().nonnegative().default(0.0),
  fuelConsumption: z.number().positive().optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
  lastMaintenance: z.coerce.date().optional(),
  nextMaintenance: z.coerce.date().optional(),
})

export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>
