import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HackathonRepository } from '../database/repositories/hackathon.repository';

@Injectable()
export class HackathonCronService {
  private readonly logger = new Logger(HackathonCronService.name);
  constructor(private readonly hackathonRepository: HackathonRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHackathonStatuses() {
    const now = new Date();

    try {
      const toActiveResult = await this.hackathonRepository.updateToActive(now);
      if (toActiveResult.count > 0) {
        this.logger.log(
          `Hackathons transitioned to ACTIVE: ${toActiveResult.count}`,
        );
      }

      const toFinishedResult =
        await this.hackathonRepository.updateToFinished(now);
      if (toFinishedResult.count > 0) {
        this.logger.log(
          `Hackathons transitioned to FINISHED: ${toFinishedResult.count}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error during automatic hackathon status update',
        error,
      );
    }
  }
}
