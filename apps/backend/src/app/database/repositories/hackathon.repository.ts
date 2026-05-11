import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HackathonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isCreator(hackathonId: string, userId: string): Promise<boolean> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { creatorId: true },
    });
    return hackathon?.creatorId === userId;
  }


}