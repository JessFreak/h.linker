import { Module } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { RoleController } from '../controllers/role.controller';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';

@Module({
  controllers: [RoleController, TeamController],
  providers: [RoleService, TeamService],
  exports: [RoleService, TeamService],
})
export class TeamModule {}
