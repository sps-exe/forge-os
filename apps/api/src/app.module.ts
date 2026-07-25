import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { PlatformsModule } from './modules/platforms/platforms.module'
import { ContestsModule } from './modules/contests/contests.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { AchievementsModule } from './modules/achievements/achievements.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { QuestsModule } from './modules/quests/quests.module'
import { OpenSourceModule } from './modules/open-source/open-source.module'
import { RevisionModule } from './modules/revision/revision.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { CacheConfigModule } from './modules/cache/cache.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    CacheConfigModule,
    AuthModule,
    UsersModule,
    PlatformsModule,
    ContestsModule,
    TasksModule,
    AchievementsModule,
    NotificationsModule,
    QuestsModule,
    OpenSourceModule,
    RevisionModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
