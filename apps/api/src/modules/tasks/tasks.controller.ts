import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { updateTaskStatusSchema, type UpdateTaskStatusInput } from '@forge/shared'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { TasksService } from './tasks.service'

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('today')
  getToday(@CurrentUser() user: AuthUser) {
    return this.tasksService.getToday(user.id)
  }

  @Get('summary')
  getSummary(@CurrentUser() user: AuthUser) {
    return this.tasksService.getSummary(user.id)
  }

  @Get('history')
  getHistory(@CurrentUser() user: AuthUser) {
    return this.tasksService.getHistory(user.id)
  }

  @Post('today/generate')
  generateToday(@CurrentUser() user: AuthUser) {
    return this.tasksService.ensureTodayTasks(user.id)
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') taskId: string,
    @Body(new ZodValidationPipe(updateTaskStatusSchema)) body: UpdateTaskStatusInput,
  ) {
    return this.tasksService.updateStatus(user.id, taskId, body.status)
  }
}
