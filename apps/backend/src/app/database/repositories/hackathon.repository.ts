import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Hackathon, Prisma } from '@prisma/client';

@Injectable()
export class HackathonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.HackathonUncheckedCreateInput): Promise<Hackathon> {
    return this.prisma.hackathon.create({ data });
  }

  async getAll() {
    return this.prisma.hackathon.findMany();
  }

  async getById(id: string): Promise<Hackathon> {
    return this.prisma.hackathon.findFirst({ where: { id } });
  }

  async updateById(id: string, data: Prisma.HackathonUncheckedUpdateInput): Promise<Hackathon> {
    return this.prisma.hackathon.update({
      data,
      where: { id },
    });
  }

  async isCreator(hackathonId: string, userId: string): Promise<boolean> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { creatorId: true },
    });
    return hackathon?.creatorId === userId;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.hackathon.delete({ where: { id } });
  }
}
