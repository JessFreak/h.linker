import { Module } from '@nestjs/common';
import { HackathonController } from '../controllers/hackathon.controller';
import { HackathonService } from '../services/hackathon.service';
import { RolesGuard } from '../../config/security/guards/roles.guard';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../services/project.service';
import { HackathonBySlugPipe } from '../utils/pipes/hackathon-by-slug.pipe';
import { ParticipationByIdPipe } from '../utils/pipes/participation-by-id.pipe';
import { HackathonCronService } from '../services/hackathon.cron.service';

@Module({
  controllers: [HackathonController, ProjectController],
  providers: [
    HackathonService,
    HackathonCronService,
    ProjectService,
    RolesGuard,
    HackathonBySlugPipe,
    ParticipationByIdPipe,
  ],
  exports: [
    HackathonService,
    ProjectService,
    RolesGuard,
    HackathonBySlugPipe,
    ParticipationByIdPipe,
  ],
})
export class HackathonModule {}
