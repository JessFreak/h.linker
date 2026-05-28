import { Injectable } from '@nestjs/common';
import { BaseExistsPipe } from './base-exists.pipe';
import { TeamRepository } from '../../database/repositories/team.repository';

@Injectable()
export class TeamByIdPipe extends BaseExistsPipe {
  constructor(private readonly repo: TeamRepository) {
    super('Team', (val) => this.repo.checkExistsById(val));
  }
}
