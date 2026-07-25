import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { ErrorCodes, type ApiError, type ErrorCode } from '@forge/shared'

const STATUS_TO_CODE: Record<number, ErrorCode> = {
  [HttpStatus.UNAUTHORIZED]: ErrorCodes.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCodes.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCodes.NOT_FOUND,
  [HttpStatus.BAD_REQUEST]: ErrorCodes.VALIDATION_ERROR,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCodes.RATE_LIMITED,
  [HttpStatus.BAD_GATEWAY]: ErrorCodes.PLATFORM_ERROR,
}

/** Maps every thrown error into the shared `ApiError` envelope. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException ? exception.message : 'Internal server error'

    const details = exception instanceof HttpException ? exception.getResponse() : undefined

    const body: ApiError = {
      success: false,
      error: {
        code: STATUS_TO_CODE[status] ?? ErrorCodes.INTERNAL,
        message,
        details: typeof details === 'object' ? details : undefined,
      },
    }

    if (status >= 500) console.error('[api]', exception)
    res.status(status).json(body)
  }
}
