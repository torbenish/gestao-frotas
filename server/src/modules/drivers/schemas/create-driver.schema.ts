import { z } from 'zod'
import { CNHType, DriverStatus } from '@/generated/client'

export const createDriverSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(11).max(11),
  cnh: z.string().min(11).max(12),
  cnhType: z.nativeEnum(CNHType),
  cnhValid: z.coerce.date().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(DriverStatus).default(DriverStatus.AVAILABLE),
})

export type CreateDriverSchema = z.infer<typeof createDriverSchema>
