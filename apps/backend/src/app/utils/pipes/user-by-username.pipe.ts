import { Injectable } from '@nestjs/common';
import { BaseExistsPipe } from './base-exists.pipe';
import { UserRepository } from '../../database/repositories/user.repository';

@Injectable()
export class UserByUsernamePipe extends BaseExistsPipe {
  constructor(private readonly repo: UserRepository) {
    super('User', (val) => this.repo.checkExistsByUsername(val));
  }
}
