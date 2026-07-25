import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { updateProfileSchema, type UpdateProfileInput } from '@forge/shared'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getMe(user.id)
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(user.id, body)
  }
}
