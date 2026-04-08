import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor (private readonly prisma: PrismaService) {}

  async create (data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async find (where: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where });
  }

  async findById (id: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { id }, include: { categories: true } });
  }

  async findByEmail (email: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findByUsername (username: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { username } });
  }

  async findByGithubId (githubId: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { githubId } });
  }

  async findMany (where: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where });
  }

  async updateById (id: string, data: Prisma.UserUncheckedUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteById (id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}