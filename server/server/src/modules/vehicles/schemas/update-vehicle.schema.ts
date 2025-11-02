import { z } from 'zod'
import { createVehicleSchema } from './create-vehicle.schema'

export const updateVehicleSchema = createVehicleSchema.partial()

export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>
