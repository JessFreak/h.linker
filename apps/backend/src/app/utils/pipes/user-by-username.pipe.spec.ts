import 'reflect-metadata';
import { UserByUsernamePipe } from './user-by-username.pipe';
import { runBasePipeTests } from './base-pipe.spec';

describe('UserByUsernamePipe', () => {
  const mockRepo = { checkExistsByUsername: jest.fn() };
  runBasePipeTests(
    UserByUsernamePipe,
    mockRepo,
    'checkExistsByUsername',
    'jessfreak',
  );
});
