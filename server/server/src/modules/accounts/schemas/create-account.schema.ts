import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string(),
  password: z.string(),
  departmentId: z.string().uuid().nullable().optional(),
})

export type CreateAccountSchema = z.infer<typeof createAccountSchema>
