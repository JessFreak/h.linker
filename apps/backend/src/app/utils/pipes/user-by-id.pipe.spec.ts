import 'reflect-metadata';
import { UserByIdPipe } from './user-by-id.pipe';
import { runBasePipeTests } from './base-pipe.spec';

describe('UserByIdPipe', () => {
  const mockRepo = { checkExistsById: jest.fn() };
  runBasePipeTests(UserByIdPipe, mockRepo, 'checkExistsById', 'user-uuid-123');
});
