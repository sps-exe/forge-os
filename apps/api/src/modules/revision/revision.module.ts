import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { RevisionController } from './revision.controller'
import { RevisionService } from './revision.service'

@Module({
  imports: [AuthModule],
  controllers: [RevisionController],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}
