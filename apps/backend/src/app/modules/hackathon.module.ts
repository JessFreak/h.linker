import { Module } from '@nestjs/common';
import { HackathonController } from '../controllers/hackathon.controller';
import { HackathonService } from '../services/hackathon.service';
import { RolesGuard } from '../../config/security/guards/roles.guard';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../services/project.service';

@Module({
  controllers: [HackathonController, ProjectController],
  providers: [HackathonService, ProjectService, RolesGuard],
  exports: [HackathonService, ProjectService, RolesGuard],
})
export class HackathonModule {}