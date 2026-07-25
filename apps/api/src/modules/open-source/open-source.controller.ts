import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OpenSourceService } from './open-source.service'

@Controller('open-source')
@UseGuards(JwtAuthGuard)
export class OpenSourceController {
  constructor(private readonly openSourceService: OpenSourceService) {}

  @Get()
  getOverview(@Query('language') language?: string) {
    return this.openSourceService.getOverview(language)
  }
}
