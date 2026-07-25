import { Module } from '@nestjs/common'
import { PlatformsController } from './platforms.controller'
import { PlatformsService } from './platforms.service'
import { LeetCodeProvider } from './providers/leetcode.provider'
import { CodeforcesProvider } from './providers/codeforces.provider'
import { GithubProvider } from './providers/github.provider'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [PlatformsController],
  providers: [PlatformsService, LeetCodeProvider, CodeforcesProvider, GithubProvider],
  exports: [CodeforcesProvider],
})
export class PlatformsModule {}
