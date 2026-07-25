import { z } from 'zod'

export const notificationTypeSchema = z.enum([
  'ACHIEVEMENT_UNLOCKED',
  'STREAK_MILESTONE',
  'CONTEST_REMINDER',
  'QUEST_COMPLETED',
  'SYSTEM',
])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  createdAt: z.coerce.date(),
})
export type NotificationDto = z.infer<typeof notificationSchema>

export const notificationsOverviewSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number(),
})
export type NotificationsOverview = z.infer<typeof notificationsOverviewSchema>
