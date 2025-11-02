import { z } from 'zod'
import { CNHType, DriverStatus } from '@/generated/client'

export const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  cpf: z.string().length(11).optional(),
  cnh: z.string().min(11).max(12).optional(),
  cnhType: z.nativeEnum(CNHType).optional(),
  cnhValid: z.coerce.date().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(DriverStatus).optional(),
})

export type UpdateDriverSchema = z.infer<typeof updateDriverSchema>
