import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  departmentId: z.string().uuid().nullable().optional(), 
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
