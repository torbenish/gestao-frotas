import { z } from 'zod'

export const createAddressSchema = z.object({
  placeId: z.string().min(1),
  formattedAddress: z.string().min(1),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
})

export type CreateAddressSchema = z.infer<typeof createAddressSchema>
