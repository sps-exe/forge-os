import { Injectable, NotFoundException } from '@nestjs/common'
import { levelForXp, type UpdateProfileInput, type UserDto } from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const xp = await this.prisma.xpEvent.aggregate({
      where: { userId },
      _sum: { amount: true },
    })
    const totalXp = xp._sum.amount ?? 0
    const { level } = levelForXp(totalXp)

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            bio: user.profile.bio,
            timezone: user.profile.timezone,
          }
        : null,
      totalXp,
      level,
    }
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    })
  }
}
