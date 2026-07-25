import { Injectable } from '@nestjs/common'
import { type NotificationDto, type NotificationsOverview } from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string): Promise<NotificationsOverview> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const dtos: NotificationDto[] = notifications.map((n) => ({
      id: n.id,
      type: n.type as NotificationDto['type'],
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt,
    }))

    return {
      notifications: dtos,
      unreadCount: dtos.filter((n) => !n.read).length,
    }
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }
}
