import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { OpenSourceController } from './open-source.controller'
import { OpenSourceService } from './open-source.service'

@Module({
  imports: [AuthModule],
  controllers: [OpenSourceController],
  providers: [OpenSourceService],
  exports: [OpenSourceService],
})
export class OpenSourceModule {}
