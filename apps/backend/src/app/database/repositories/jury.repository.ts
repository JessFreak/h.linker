import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Jury } from '@prisma/client';

@Injectable()
export class JuryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(hackathonId: string, userId: string): Promise<Jury> {
    return this.prisma.jury.create({
      data: {
        hackathonId,
        userId,
      },
    });
  }

  async remove(hackathonId: string, userId: string): Promise<Jury> {
    return this.prisma.jury.delete({
      where: {
        hackathonId_userId: { hackathonId, userId },
      },
    });
  }

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