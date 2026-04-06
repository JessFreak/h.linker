import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../database/repositories/user.repository';
import { CategoryRepository } from '../database/repositories/category.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, CategoryRepository],
  exports: [PrismaService, UserRepository, CategoryRepository],
})
export class PrismaModule {}
