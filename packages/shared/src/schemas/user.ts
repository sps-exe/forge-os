import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(280).optional(),
  timezone: z.string().max(64).optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  profile: z
    .object({
      displayName: z.string().nullable(),
      bio: z.string().nullable(),
      timezone: z.string().nullable(),
    })
    .nullable(),
  totalXp: z.number(),
  level: z.number(),
})
export type UserDto = z.infer<typeof userDtoSchema>
