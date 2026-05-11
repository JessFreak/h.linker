import { Module } from '@nestjs/common';
import { HackathonController } from '../controllers/hackathon.controller';
import { HackathonService } from '../services/hackathon.service';
import { RolesGuard } from '../../config/security/guards/roles.guard';

@Module({
  controllers: [HackathonController],
  providers: [HackathonService, RolesGuard],
  exports: [HackathonService, RolesGuard],
})
export class HackathonModule {}