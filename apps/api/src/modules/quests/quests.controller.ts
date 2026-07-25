import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator'
import { QuestsService } from './quests.service'

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  getOverview(@CurrentUser() user: AuthUser) {
    return this.questsService.getOverview(user.id)
  }
}
