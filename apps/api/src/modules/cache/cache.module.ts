import { Global, Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [createKeyv(process.env.REDIS_URL ?? 'redis://localhost:6379')],
      }),
    }),
  ],
})
export class CacheConfigModule {}
