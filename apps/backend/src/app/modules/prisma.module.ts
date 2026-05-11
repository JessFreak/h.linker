import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../database/repositories/user.repository';
import { CategoryRepository } from '../database/repositories/category.repository';
import { RoleRepository } from '../database/repositories/role.repository';
import { TeamRepository } from '../database/repositories/team.repository';
import { MemberRepository } from '../database/repositories/member.repository';
import { HackathonRepository } from '../database/repositories/hackathon.repository';
import { JuryRepository } from '../database/repositories/jury.repository';
import { CriteriaRepository } from '../database/repositories/criteria.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    CategoryRepository,
    RoleRepository,
    TeamRepository,
    MemberRepository,
    HackathonRepository,
    JuryRepository,
    CriteriaRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    CategoryRepository,
    RoleRepository,
    TeamRepository,
    MemberRepository,
    HackathonRepository,
    JuryRepository,
    CriteriaRepository,
  ],
})
export class PrismaModule {}
