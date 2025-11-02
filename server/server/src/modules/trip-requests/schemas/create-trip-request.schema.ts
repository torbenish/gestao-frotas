import { z } from 'zod'
import { TripStatus, TripType } from '@/generated/client'

export const createTripRequestSchema = z.object({
  startAddressId: z.string().uuid(),
  endAddressId: z.string().uuid().optional().nullable(),
  tripType: z.nativeEnum(TripType),
  scheduledDeparture: z.coerce.date(),
  scheduledReturn: z.coerce.date().optional().nullable(),
  reason: z.string().min(1),
  passengers: z.any().optional(),
  notes: z.string().optional(),
  requesterId: z.string().uuid(),
  status: z.nativeEnum(TripStatus).default(TripStatus.PENDING),
  approverId: z.string().uuid().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
  driverId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
})

export type CreateTripRequestSchema = z.infer<typeof createTripRequestSchema>
