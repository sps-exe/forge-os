import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { connectAccountSchema, type ConnectAccountInput } from '@forge/shared'
import { Platform } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { PlatformsService } from './platforms.service'

@Controller('platforms')
@UseGuards(JwtAuthGuard)
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get('accounts')
  listAccounts(@CurrentUser() user: AuthUser) {
    return this.platformsService.listAccounts(user.id)
  }

  @Post('connect')
  connect(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(connectAccountSchema)) body: ConnectAccountInput,
  ) {
    return this.platformsService.connect(user.id, body)
  }

  @Delete(':platform')
  disconnect(
    @CurrentUser() user: AuthUser,
    @Param('platform', new ParseEnumPipe(Platform)) platform: Platform,
  ) {
    return this.platformsService.disconnect(user.id, platform)
  }

  @Get(':platform/stats')
  getStats(
    @CurrentUser() user: AuthUser,
    @Param('platform', new ParseEnumPipe(Platform)) platform: Platform,
  ) {
    return this.platformsService.getStats(user.id, platform)
  }
}
