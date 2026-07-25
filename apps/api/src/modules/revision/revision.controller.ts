import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { createRevisionItemSchema, type CreateRevisionItemInput } from '@forge/shared'
import { RevisionService } from './revision.service'

@Controller('revision')
@UseGuards(JwtAuthGuard)
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Get()
  getOverview(@CurrentUser() user: AuthUser) {
    return this.revisionService.getOverview(user.id)
  }

  @Post()
  createItem(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createRevisionItemSchema)) input: CreateRevisionItemInput,
  ) {
    return this.revisionService.createItem(user.id, input)
  }

  @Post(':id/review')
  recordReview(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.revisionService.recordReview(user.id, id)
  }
}
