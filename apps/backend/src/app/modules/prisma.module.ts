import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../database/repositories/user.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { RoleRepository } from '../database/repositories/role.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, CategoryRepository, RoleRepository],
  exports: [PrismaService, UserRepository, CategoryRepository, RoleRepository],
})
export class PrismaModule {}
