import { z } from 'zod'

export const validateTripRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  approverId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
})

export type ValidateTripRequestSchema = z.infer<
  typeof validateTripRequestSchema
>
