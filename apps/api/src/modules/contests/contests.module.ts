import { Module } from '@nestjs/common'
import { ContestsController } from './contests.controller'
import { ContestsService } from './contests.service'
import { PlatformsModule } from '../platforms/platforms.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, PlatformsModule],
  controllers: [ContestsController],
  providers: [ContestsService],
})
export class ContestsModule {}
