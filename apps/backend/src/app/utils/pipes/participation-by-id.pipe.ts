import { Injectable } from '@nestjs/common';
import { BaseExistsPipe } from './base-exists.pipe';
import { ParticipationRepository } from '../../database/repositories/participation.repository';

@Injectable()
export class ParticipationByIdPipe extends BaseExistsPipe {
  constructor(private readonly repo: ParticipationRepository) {
    super('Project submission', (val) => this.repo.checkExistsById(val));
  }
}
