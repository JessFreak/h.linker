import { Module } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { RoleController } from '../controllers/role.controller';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';
import { TeamByIdPipe } from '../utils/pipes/team-by-id.pipe';

@Module({
  controllers: [RoleController, TeamController],
  providers: [RoleService, TeamService, TeamByIdPipe],
  exports: [RoleService, TeamService, TeamByIdPipe],
})
export class TeamModule {}
