import { z } from 'zod'
import { platformSchema } from './platform'

export const contestSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  name: z.string(),
  url: z.string().url(),
  startsAt: z.coerce.date(),
  durationSeconds: z.number(),
  phase: z.enum(['UPCOMING', 'LIVE', 'FINISHED']),
})
export type Contest = z.infer<typeof contestSchema>
