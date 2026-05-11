import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JuryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isUserInJury(hackathonId: string, userId: string): Promise<boolean> {
    const juryMember = await this.prisma.jury.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
    });
    return !!juryMember;
  }
}