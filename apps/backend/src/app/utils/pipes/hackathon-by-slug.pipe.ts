import { Injectable } from '@nestjs/common';
import { HackathonRepository } from '../../database/repositories/hackathon.repository';
import { BaseExistsPipe } from './base-exists.pipe';

@Injectable()
export class HackathonBySlugPipe extends BaseExistsPipe {
  constructor(private readonly repo: HackathonRepository) {
    super('Hackathon', (val) => this.repo.checkExistsBySlug(val));
  }
}
