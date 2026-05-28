import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { BaseExistsPipe } from './base-exists.pipe';

@Injectable()
export class UserByIdPipe extends BaseExistsPipe {
  constructor(private readonly repo: UserRepository) {
    super('User', (val) => this.repo.checkExistsById(val));
  }
}
