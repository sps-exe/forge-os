import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ContestsService } from './contests.service'

@Controller('contests')
@UseGuards(JwtAuthGuard)
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get('upcoming')
  getUpcoming() {
    return this.contestsService.getUpcoming()
  }
}
