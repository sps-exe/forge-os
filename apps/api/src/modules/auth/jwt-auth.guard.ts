import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'

interface ApiTokenPayload {
  sub: string
  email?: string | null
}

/**
 * Validates the HS256 API token issued by the web app (signed with the
 * shared AUTH_SECRET) and attaches `{ id, email }` to the request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(request)
    if (!token) throw new UnauthorizedException('Missing bearer token')

    try {
      const payload = await this.jwtService.verifyAsync<ApiTokenPayload>(token)
      ;(request as Request & { user: unknown }).user = {
        id: payload.sub,
        email: payload.email ?? null,
      }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
