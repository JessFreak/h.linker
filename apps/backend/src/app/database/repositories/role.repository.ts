import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<Role[]> {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string): Promise<Role> {
    return this.prisma.role.create({ data: { name } });
  }
}
